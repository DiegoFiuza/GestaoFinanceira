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
  @IsNumber()
  @IsNotEmpty({ message: 'Digite o valor' })
  @Min(0, { message: 'O valor não pode ser negativo' })
  amount: number;

  @IsString({ message: 'Descrição da transação deverá ser um texto' })
  @IsOptional()
  description: string;

  @IsString()
  @IsEnum(['income', 'expensive', 'fixed expensive'], {
    message: 'O tipo deve ser: income, expensive ou fixed expensive',
  })
  type: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(31)
  recurrencyDay?: number;
}
