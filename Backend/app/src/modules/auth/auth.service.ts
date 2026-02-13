import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async login(email: string, pwd: string) {
    const user = await this.userService.findByEmail(email);

    if (user && (await bcrypt.compare(pwd, user.password))) {
      const payload = { sub: user._id, email: user.email, role: user.role };

      return {
        access_token: await this.jwtService.signAsync(payload),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }
    throw new UnauthorizedException('Credenciais inválidas');
  }
}
