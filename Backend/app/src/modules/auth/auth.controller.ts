import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login-dto';
import { UserService } from '../users/user.service';
import { CreateUserDto } from '../users/dto/create-user-dto';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() dto: AuthLoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('signup')
  signUp(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
