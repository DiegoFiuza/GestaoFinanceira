import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [
    // 1. Carrega as variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Usa forRootAsync para injetar a configuração
    MongooseModule.forRootAsync({
      imports: [ConfigModule], // Importa o módulo de config (opcional se isGlobal: true)
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService], // Injeta o serviço para ler a variável
    }),
    UserModule,
  ],
})
export class AppModule {}
