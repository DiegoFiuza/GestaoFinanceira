import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; // Importa isto
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ativa a validação para todos os endpoints da tua API
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Lança erro se enviarem propriedades extra
      transform: true, // Converte os tipos automaticamente
    }),
  );

  await app.listen(3000);
}
bootstrap();
