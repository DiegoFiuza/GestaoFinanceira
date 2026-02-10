import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role, Roles } from '../auth/roles.decorator';
import { AuthGuard } from '../auth/guards/auth.guard';

@ApiTags('Users')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'Criar usuário',
    description: 'Método para criação do usuário no BD',
  })
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiOperation({
    summary: 'Retornar usuário',
    description: 'Método para retornar um usuário específico do BD',
  })
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.findByEmail(id);
  }

  @ApiOperation({
    summary: 'Apagar usuário',
    description: 'Método inativa usuário em aplicação, mas deixa salvo no BD',
  })
  @Delete(':id') // 1. Adicionamos o parâmetro na rota /users/123
  deleteUser(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Método para atualizar todos os dados do usuário',
  })
  @Put(':id')
  putUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Método para atualizar um único dado do usuário',
  })
  @Patch(':id')
  patchUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.patchUser(id, dto);
  }

  @Patch('me')
  @Roles(Role.User, Role.Admin) // Ambos podem atualizar o seu próprio perfil
  patchMe(@Request() req, @Body() dto: UpdateUserDto) {
    // Pegamos o ID do token que o AuthGuard validou
    const userId = req.user.sub;
    return this.userService.patchUser(userId, dto);
  }
}
