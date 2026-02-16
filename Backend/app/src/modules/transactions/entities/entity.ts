import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from 'src/modules/users/entities/entity';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @ApiProperty({ example: 2000, description: 'Digite o valor da transação' })
  @Prop({ required: true, default: 0, min: 0 })
  amount: number;

  @ApiProperty({
    example: 'Salário do mes',
    description: 'Descrição da transação que irá criar',
  })
  @Prop({ required: false, trim: true, lowercase: true })
  description: string;

  @ApiProperty({
    example: '2026-02-22',
    description: 'Data que a transação é criada',
  })
  @Prop({ required: true, default: Date.now })
  date: Date;

  @ApiProperty({
    example: 'income | expensive | fixed expensive',
    description: 'Informa se é um ganho, gasto ou gasto fixo',
  })
  @Prop({
    type: String,
    required: true,
    // 2. Definição do Enum para o Mongoose (Verificação em tempo de execução/BD)
    enum: ['income', 'expensive', 'fixed expensive'],
    default: 'income',
  })
  type: string;

  @ApiProperty({
    example: 1,
    description:
      'Informa o dia se a transação tiver recorrencia mensal (opcional)',
  })
  @Prop({ type: Number, min: 1, max: 31 })
  recurrencyDay?: number;

  @ApiProperty({
    example: 'John Doe',
    description: 'Relaciona a transação ao usuário que a cria',
  })
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  user: Types.ObjectId | Users;
}

export const TransactionModel = SchemaFactory.createForClass(Transaction);
