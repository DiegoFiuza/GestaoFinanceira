import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserModel, Users } from './entities/entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: UserModel }]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
