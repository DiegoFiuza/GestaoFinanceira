import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './entities/entity';

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  constructor(
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
  ) {}

  // Este método corre todos os dias à meia-noite (00:00)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyRecurrence() {
    this.logger.log('Iniciando processamento de despesas fixas...');

    const today = new Date();
    const currentDay = today.getDate(); // Ex: 10

    // 1. Procurar transações que têm a recorrência marcada para hoje
    const fixedExpenses = await this.transactionModel
      .find({
        recurrencyDay: currentDay,
      })
      .exec();

    if (fixedExpenses.length === 0) {
      this.logger.log('Nenhuma despesa fixa para processar hoje.');
      return;
    }

    // 2. Para cada despesa fixa, criamos um novo lançamento no banco
    for (const expense of fixedExpenses) {
      this.logger.log(`Lançando despesa fixa: ${expense.description}`);

      // Criamos uma cópia da transação, mas com a data de hoje
      // e opcionalmente marcamos que esta é uma instância de uma fixa
      const newEntry = new this.transactionModel({
        amount: expense.amount,
        description: `[FIXA] ${expense.description}`,
        type: expense.type,
        user: expense.user,
        recurrencyDay: 0, // A nova cópia não deve ser recorrente para não duplicar infinitamente
        createdAt: today,
      });

      await newEntry.save();
    }

    this.logger.log(`${fixedExpenses.length} despesas foram processadas.`);
  }
}
