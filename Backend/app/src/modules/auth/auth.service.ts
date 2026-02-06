import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(email: string, pwd: string) {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(pwd, user.password))) {
      const payload = { sub: user.id, email: user.email, role: user.role };
      return { access_token: await this.jwtService.signAsync(payload) };
    }
    throw new UnauthorizedException('Credenciais inválidas');
  }
}
