import { SetMetadata } from '@nestjs/common';

// Esta constante é a "chave" que o Guard vai procurar depois
export const ROLES_KEY = 'roles';
export enum Role {
  User = 'user',
  Admin = 'admin',
}
// O decorador recebe uma lista de strings (ex: 'admin', 'user')
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
