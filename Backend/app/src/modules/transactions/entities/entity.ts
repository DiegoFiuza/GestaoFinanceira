import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Users } from 'src/modules/users/entities/entity';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, default: 0, min: 0 })
  amount: number;

  @Prop({ required: false, trim: true, lowercase: true })
  description: string;

  @Prop({ required: true, default: Date.now })
  date: Date;

  @Prop({
    type: String,
    required: true,
    // 2. Definição do Enum para o Mongoose (Verificação em tempo de execução/BD)
    enum: ['income', 'expensive', 'fixed expensive'],
    default: 'income',
  })
  type: string;

  @Prop({ type: Number, min: 1, max: 31 })
  recurrencyDay?: number;

  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  user: Types.ObjectId;

  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;
}

export const TransactionModel = SchemaFactory.createForClass(Transaction);
