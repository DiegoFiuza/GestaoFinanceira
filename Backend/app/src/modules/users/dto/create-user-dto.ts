import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'O formato do email é inválido' })
  @IsNotEmpty({ message: 'O email não pode estar vazio' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'A password é obrigatória' })
  @MinLength(6, { message: 'A password deve ter pelo menos 6 caracteres' })
  password: string;

  @IsBoolean()
  isActive?: boolean;
}
