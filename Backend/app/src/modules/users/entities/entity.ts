import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<Users>;

@Schema({ timestamps: true })
export class Users {
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

  @ApiProperty({
    example: 'True | False',
    description: 'Por padrão, a propriedade vem como true',
  })
  @Prop({ type: Boolean, required: true, default: true })
  isActive: boolean;
}

export const UserModel = SchemaFactory.createForClass(Users);
