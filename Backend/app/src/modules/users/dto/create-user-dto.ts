import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Digite o e-mail do usuário',
  })
  @IsEmail({}, { message: 'O formato do email é inválido' })
  @IsNotEmpty({ message: 'O email não pode estar vazio' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Digite uma senha de pelo menos 6 caracteres',
  })
  @IsString()
  @IsNotEmpty({ message: 'A password é obrigatória' })
  @MinLength(6, { message: 'A password deve ter pelo menos 6 caracteres' })
  password: string;
}
