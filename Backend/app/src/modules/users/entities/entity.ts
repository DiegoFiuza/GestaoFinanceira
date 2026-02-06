import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<Users>;

@Schema({ timestamps: true })
export class Users {
  @ApiProperty({
    example: 'John Doe',
    description: 'Digite o nome do usuário',
  })
  @Prop({ required: true, lowercase: true })
  name: string;

  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Digite o e-mail do usuário',
  })
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Digite uma senha de pelo menos 6 caracteres',
  })
  @Prop({ required: true, min: 6 })
  password: string;

  @Prop({
    type: String,
    required: true,
    // 2. Definição do Enum para o Mongoose (Verificação em tempo de execução/BD)
    enum: ['user', 'admin'],
    default: 'user',
  })
  role: string;

  @ApiProperty({
    example: 'True | False',
    description: 'Por padrão, a propriedade vem como true',
  })
  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;
}

export const UserModel = SchemaFactory.createForClass(Users);
