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
        user: new Types.ObjectId(userId),
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
      .findOneAndDelete({ _id: id, user: new Types.ObjectId(userId) })
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
          user: new Types.ObjectId(userId),
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

  async findAllMonth(userId: string, year: number, month: number) {
    // 1. Início do mês: Dia 1 às 00:00:00 UTC
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));

    // 2. Fim do mês: Dia 0 do mês seguinte às 23:59:59 UTC
    // (O dia 0 do mês seguinte é automaticamente o último dia do mês atual)
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    console.log(`--- BUSCA MENSAL (${month}/${year}) ---`);
    console.log('Início:', startOfMonth.toISOString());
    console.log('Fim:', endOfMonth.toISOString());

    return this.transactionModel
      .find({
        user: userId, // Nome do campo conforme seu banco
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
      .exec();
  }

  async calcMonth(userId: string, year: number, month: number) {
    // Use a mesma lógica de datas acima
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const transactions = await this.transactionModel
      .find({
        user: userId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      })
      .exec();

    // Exemplo simples de cálculo de balanço (ajuste conforme sua regra de negócio)
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === 'expensive')
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }

  async findFixedByDay(
    userId: string,
    day: number,
    month: number,
    year: number,
  ) {
    // Criamos as datas usando Date.UTC para garantir que 00:00 seja 00:00 no MongoDB
    // Mês - 1 porque o Date.UTC também usa index 0 para Janeiro
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    console.log('--- NOVA BUSCA (UTC) ---');
    console.log('Início:', startOfDay.toISOString()); // Deve aparecer 2026-02-11T00:00:00.000Z
    console.log('Fim:', endOfDay.toISOString()); // Deve aparecer 2026-02-11T23:59:59.999Z

    return this.transactionModel
      .find({
        user: new Types.ObjectId(userId), // Se continuar vazio, tente: new Types.ObjectId(userId)
        createdAt: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
      .exec();
  }

  async findAllTransaction(userId: string): Promise<Transaction[]> {
    return this.transactionModel
      .find({ user: new Types.ObjectId(userId) })
      .populate('user', 'name')
      .exec();
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
