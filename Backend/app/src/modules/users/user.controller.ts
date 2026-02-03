import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user-dto';
import { UpdateUserDto } from './dto/update-user-dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.findByEmail(id);
  }

  @Delete(':id') // 1. Adicionamos o parâmetro na rota /users/123
  deleteUser(@Param('id') id: string) {
    return this.userService.delete(id);
  }

  @Put(':id')
  putUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Patch(':id')
  patchUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.patchUser(id, dto);
  }
}
