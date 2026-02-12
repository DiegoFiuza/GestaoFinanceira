import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateTransactionDto } from './dto/create-transaction-dto';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role, Roles } from '../auth/roles.decorator';
import { UpdateTransactionDto } from './dto/update-transaction-dto';

@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin, Role.User)
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({
    summary: 'Retornar transações',
    description: 'Retornar todas as transações do usuário logado',
  })
  @Post()
  async create(@Request() req, @Body() dto: CreateTransactionDto) {
    const userId = req.user.sub;
    const transaction = await this.transactionService.create(dto, userId);
    return transaction;
  }

  @ApiOperation({
    summary: 'Deletar transação',
    description: 'Chamada para deletar função',
  })
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    const userId = req.user.sub;
    return this.transactionService.delete(id, userId);
  }

  @ApiOperation({
    summary: 'Atualizar transação',
    description: 'Chamada para atualizar alguma transação',
  })
  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
    @Request() req,
  ) {
    const userId = req.user.sub; // Pegamos o ID do token
    return this.transactionService.patch(id, userId, dto);
  }

  @ApiOperation({
    summary: 'Retornar transações',
    description: 'Retornar todas as transações do usuário logado',
  })
  @Get()
  async getMyTransaction(@Request() req) {
    //recebendo o user do guard
    const userId = req.user.sub;
    const allBilled = await this.transactionService.calcAll(userId);
    const allTransaction =
      await this.transactionService.findAllTransaction(userId);
    return { allBilled, allTransaction };
  }

  @ApiOperation({
    summary: 'Buscar transações por nome de usuário (Admin)',
    description:
      'Permite que o admin veja as transações de um usuário pesquisando pelo nome dele',
  })
  @ApiQuery({
    name: 'name',
    description: 'Nome do usuário para pesquisa',
    required: true,
  })
  @Roles(Role.Admin)
  @Get('admin/search-by-name')
  async getByUserName(@Query('name') name: string) {
    return this.transactionService.findByUserName(name);
  }

  @ApiOperation({
    summary: 'Retorno por dia',
    description: 'Retorna as transações do dia selecionado',
  })
  @ApiQuery({
    name: 'day',
    type: Number,
    description: 'O dia do mês',
    example: '1-31',
  })
  @Get('fix-day')
  async getByDay(
    @Request() req,
    @Query('day') day: string,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    const userId = req.user.sub;

    const d = parseInt(day, 10);
    const m = parseInt(month, 10); // Esperamos 1-12
    const y = parseInt(year, 10);

    // Validação: Impede dias menores que 1, maiores que 31 ou meses fora de 1-12
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 2000) {
      throw new BadRequestException(
        'Data inválida. Forneça dia (1-31), mês (1-12) e ano.',
      );
    }

    return this.transactionService.findFixedByDay(userId, d, m, y);
  }

  @ApiOperation({
    summary: 'Retorno único',
    description: 'Retorna uma única transação',
  })
  @ApiQuery({
    name: 'day',
    type: Number,
    description: 'O dia do mês',
    example: '1-31',
  })
  @Get('unique/:id')
  async getOne(@Request() req, @Param('id') transactionId: string) {
    //transformando o que irei receber do front em number
    return this.transactionService.findById(transactionId);
  }

  @ApiOperation({
    summary: 'Retorno por mês',
    description: 'Retorna as transações do mês selecionado',
  })
  @ApiQuery({
    name: 'month',
    type: Number,
    description: 'O mês específico',
    example: '1-12',
  })
  @ApiQuery({
    name: 'year',
    type: Number,
    description: 'O ano específico',
    example: '2025',
  })
  @Get('balance')
  async getMonth(
    @Request() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    const userId = req.user.sub;

    // Conversão explícita com fallback para evitar o NaN
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || isNaN(monthNum)) {
      throw new BadRequestException('Ano e mês devem ser números válidos.');
    }

    const [transactions, calculedBill] = await Promise.all([
      this.transactionService.findAllMonth(userId, yearNum, monthNum),
      this.transactionService.calcMonth(userId, yearNum, monthNum),
    ]);

    return { transactions, calculedBill };
  }
}
