import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

import { AuthModule } from '../auth/auth.module'; // Caminho para o seu AuthModule// Se o admin buscar por nome
import { Users, UserModel } from '../users/entities/entity';
import { Transaction, TransactionModel } from './entities/entity';
import { UserModule } from '../users/user.module';

@Module({
  imports: [
    // 1. Registramos o Schema da Transação
    MongooseModule.forFeature([
      { name: Transaction.name, schema: TransactionModel },
      { name: Users.name, schema: UserModel }, // Necessário para a busca do Admin por nome
    ]),
    // 2. Importamos o AuthModule para resolver o erro de dependência do JwtService
    AuthModule,
    UserModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
