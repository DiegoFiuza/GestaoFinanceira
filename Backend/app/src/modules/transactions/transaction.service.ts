import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './entities/entity';
import { Model } from 'mongoose';
import { CreateTransactionDto } from './dto/create-transaction-dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
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

  async delete(id: string) {
    const transaction = await this.transactionModel
      .findByIdAndDelete(id, { isActive: false })
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return {
      message: 'Transação apagada',
    };
  }

  async findALl(id: string, year: number, month: number) {
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

  async findFixedByDay(userId: string, day: number): Promise<Transaction[]> {
    // O MongoDB já retorna apenas as despesas do dia exato (ex: dia 10)
    return this.transactionModel
      .find({
        user: userId,
        recurrencyDay: day,
      })
      .exec();
  }
}
