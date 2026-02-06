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
    const request = context.switchToHttp().getRequest();
    // 1. Extraímos o token do cabeçalho
    const token = this.extractTokenFromHeader(request);

    // 2. Se não houver token, barramos logo a entrada
    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }

    try {
      // 3. Verificamos se o token é válido usando o nosso Secret do .env
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('SECRET'),
      });

      // 4. Se for válido, anexamos os dados do utilizador à requisição
      // Assim, o Controller saberá quem está a fazer o pedido
      request['user'] = payload;
    } catch {
      // 5. Se o token for inválido ou expirado, lançamos erro
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    return true; // Acesso permitido!
  }

  // Função auxiliar para procurar o token no formato "Bearer <token>"
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
