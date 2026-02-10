import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './entities/entity';
import { Model, Types } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction-dto';
import { UpdateTransactionDto } from './dto/update-transaction-dto';
import { UserDocument, Users } from '../users/entities/entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Users.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(
    dto: CreateTransactionDto,
    userId: string,
  ): Promise<TransactionDocument> {
    try {
      const transaction = new this.transactionModel({
        amount: dto.amount,
        description: dto.description,
        type: dto.type,
        recurrencyDay: dto.recurrencyDay,
        user: userId,
      });
      if (dto.recurrencyDay && dto.recurrencyDay !== 0) {
        console.log('Criando recorrencia');
      }
      return await transaction.save();
    } catch (err) {
      throw new BadRequestException('Erro ao criar transação' + err.message);
    }
  }

  async delete(id: string, userId: string) {
    const transaction = await this.transactionModel
      .findOneAndDelete({ _id: id, user: userId })
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return {
      message: 'Transação apagada',
    };
  }

  async patch(id: string, userId: string, update: UpdateTransactionDto) {
    const transaction = await this.transactionModel
      .findOneAndUpdate(
        {
          _id: id,
          user: userId,
        },
        { $set: update },
        { new: true, runValidators: true },
      )
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async findByUserName(name: string) {
    // 1. Procurar o usuário pelo nome (usando 'i' para ignorar maiúsculas/minúsculas)
    const user = await this.userModel
      .findOne({
        name: new RegExp(name, 'i'),
      })
      .exec();

    // 2. Se o usuário não existir, lançamos um erro
    if (!user) {
      throw new NotFoundException(
        `Usuário com o nome "${name}" não encontrado`,
      );
    }

    // 3. Buscar as transações usando o ID do usuário encontrado
    const transactions = await this.transactionModel
      .find({ user: user._id })
      .populate('user', 'name email') // Opcional: traz os detalhes do user no retorno
      .exec();

    return {
      userInfo: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      transactions,
    };
  }

  async findById(id: string): Promise<TransactionDocument | null> {
    //verifico se a string tem formato válido
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    //garanto que vai retornar uma promisse e resolver para null ou nao
    return this.transactionModel.findById(id).exec();
  }

  async findAllMonth(id: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    return this.transactionModel
      .find({
        user: id,
        createdAt: {
          $gte: startDate, // Greater than or equal (Maior ou igual)
          $lte: endDate, // Less than or equal (Menor ou igual)
        },
      })
      .exec();
  }

  async calcMonth(id: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    let sum = 0;
    const transactions = await this.transactionModel
      .find({
        user: id,
        createdAt: {
          $gte: startDate, // Greater than or equal (Maior ou igual)
          $lte: endDate, // Less than or equal (Menor ou igual)
        },
      })
      .exec();
    for (const sumTransaction of transactions) {
      if (
        sumTransaction.type === 'expensive' ||
        sumTransaction.type === 'fixed expensive'
      ) {
        const intTransaction = Number(sumTransaction.amount);
        if (!isNaN(intTransaction)) {
          sum -= intTransaction;
        }
      } else if (sumTransaction.type === 'income') {
        const intTransaction = Number(sumTransaction.amount);
        if (!isNaN(intTransaction)) {
          sum += intTransaction;
        }
      }
    }
    return sum;
  }

  async findFixedByDay(userId: string, day: number): Promise<Transaction[]> {
    // O MongoDB já retorna apenas as despesas do dia exato (ex: dia 10)
    return this.transactionModel
      .find({
        name: userId,
        recurrencyDay: day,
      })
      .exec();
  }

  async findAllTransaction(userId: string): Promise<Transaction[]> {
    return this.transactionModel.find({ user: userId }).exec();
  }

  async calcAll(id: string) {
    let sum = 0;
    const transactions = await this.findAllTransaction(id);
    for (const sumTransaction of transactions) {
      if (
        sumTransaction.type === 'expensive' ||
        sumTransaction.type === 'fixed expensive'
      ) {
        const intTransaction = Number(sumTransaction.amount);
        if (!isNaN(intTransaction)) {
          sum -= intTransaction;
        }
      } else if (sumTransaction.type === 'income') {
        const intTransaction = Number(sumTransaction.amount);
        if (!isNaN(intTransaction)) {
          sum += intTransaction;
        }
      }
    }
    return sum;
  }
}
