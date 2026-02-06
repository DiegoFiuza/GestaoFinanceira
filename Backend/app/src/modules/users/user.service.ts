import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Users, UserDocument } from './entities/entity';
import { Model, Types } from 'mongoose';
import { CreateUserDto } from './dto/create-user-dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(Users.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<UserDocument | null> {
    //verifico se a string tem formato válido
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    //garanto que vai retornar uma promisse e resolver para null ou nao
    return this.userModel.findById(id).exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Usuário não encontrado');
    }
    //procura o user, senao retorna a exception
    //Uso de notfound para nao especificar o erro
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const exist = await this.findByEmail(createUserDto.email);
    if (exist) {
      throw new ConflictException('Email já em uso');
    }
    //encriptando senha de sign in
    const saltRounds = 10;
    const hashPwd = await bcrypt.hash(createUserDto.password, saltRounds);
    const user = new this.userModel({
      email: createUserDto.email,
      password: hashPwd,
    });
    return await user.save();
  }

  async delete(id: string) {
    // 1. Tenta encontrar e apagar o utilizador ao mesmo tempo
    const inactiveUser = await this.userModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();

    // 2. Se o resultado for nulo, significa que o utilizador não existe
    if (!inactiveUser) {
      throw new NotFoundException(`Usuário não encontrado.`);
    }

    // 3. Retornamos uma mensagem de sucesso ou o utilizador apagado
    return {
      message: 'Utilizador removido com sucesso',
      id: inactiveUser._id,
    };
  }

  async updateUser(id: string, update: UpdateUserDto): Promise<UserDocument> {
    const putUser = await this.userModel
      .findOneAndReplace({ _id: id }, update, {
        new: true,
        runValidators: true, // Garante que o novo documento respeita as regras do Schema
      })
      .exec(); // Melhor tratamento de Promises

    if (!putUser) {
      throw new NotFoundException('User não encontrado');
    }
    return putUser;
  }

  async patchUser(id: string, update: UpdateUserDto): Promise<UserDocument> {
    const patchUser = await this.userModel
      .findByIdAndUpdate(
        { _id: id },
        { $set: update }, // O $set garante que apenas os campos enviados mudam
        {
          new: true,
          runValidators: true,
        },
      )
      .exec();

    if (!patchUser) {
      throw new NotFoundException('User não encontrado');
    }
    return patchUser;
  }
}
