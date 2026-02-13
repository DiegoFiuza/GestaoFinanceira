import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const token = request.cookies?.['access_token'];

    if (!token) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('SECRET'),
      });

      request['user'] = payload;
    } catch (error) {
      // 5. Erro caso o JWT tenha sido alterado ou expirado
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true;
  }
}
