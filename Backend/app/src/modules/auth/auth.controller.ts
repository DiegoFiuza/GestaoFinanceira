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
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @ApiOperation({
    summary: 'Realizar login',
    description: 'Autentica o usuário e retorna cookie HTTP-only com JWT',
  })
  @ApiBody({ type: AuthLoginDto })
  @ApiOkResponse({
    description: 'Login realizado com sucesso',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas',
  })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() dto: AuthLoginDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const loginData = await this.authService.login(dto.email, dto.password);

    response.cookie('access_token', loginData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24,
    });

    return {
      id: loginData.user.id,
      name: loginData.user.name,
    };
  }

  @ApiOperation({
    summary: 'Realizar logout',
    description: 'Remove o cookie de autenticação',
  })
  @ApiOkResponse({
    description: 'Logout realizado com sucesso',
    schema: {
      example: { message: 'Logout realizado com sucesso' },
    },
  })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: express.Response) {
    response.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return { message: 'Logout realizado com sucesso' };
  }

  @ApiOperation({
    summary: 'Cadastrar novo usuário',
    description: 'Cria uma nova conta na aplicação',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos',
  })
  @Post('signup')
  signUp(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
