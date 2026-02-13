import {
  Body,
  Res,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login-dto';
import { UserService } from '../users/user.service';
import { CreateUserDto } from '../users/dto/create-user-dto';
import * as express from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) response: express.Response, // Acessa a resposta
  ) {
    const loginData = await this.authService.login(dto.email, dto.password);

    // Salva o token no cookie
    response.cookie('access_token', loginData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Apenas HTTPS em prod
      sameSite: 'lax', // Proteção contra CSRF
      maxAge: 1000 * 60 * 60 * 24, // Expira em 24h (ms)
    });

    return {
      id: loginData.user.id,
      name: loginData.user.name,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: express.Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logout realizado com sucesso' };
  }

  @Post('signup')
  signUp(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
