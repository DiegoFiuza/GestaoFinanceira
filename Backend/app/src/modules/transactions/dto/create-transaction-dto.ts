import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty({ example: 2000, description: 'Digite o valor da transação' })
  @IsNumber()
  @IsNotEmpty({ message: 'Digite o valor' })
  @Min(0, { message: 'O valor não pode ser negativo' })
  amount: number;

  @ApiProperty({
    example: 'Salário do mes',
    description: 'Descrição da transação que irá criar',
  })
  @IsString({ message: 'Descrição da transação deverá ser um texto' })
  @IsOptional()
  description: string;

  @ApiProperty({
    example: 'income | expensive | fixed expensive',
    description: 'Informa se é um ganho, gasto ou gasto fixo',
  })
  @IsString()
  @IsEnum(['income', 'expensive', 'fixed expensive'], {
    message: 'O tipo deve ser: income, expensive ou fixed expensive',
  })
  type: string;

  @ApiProperty({
    example: 1,
    description:
      'Informa o dia se a transação tiver recorrencia mensal (opcional)',
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  recurrencyDay?: number;
}
