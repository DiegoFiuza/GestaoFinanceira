import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Gestão Financeira')
    .setDescription(
      'Documentação detalhada da minha API de Gestão Financeira em NestJS',
    )
    .setVersion('1.0')
    .addTag('Users', 'Transactions') // Podes agrupar as rotas por tags
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Ativa a validação para todos os endpoints da tua API
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      forbidNonWhitelisted: true, // Lança erro se enviarem propriedades extra
      transform: true, // Converte os tipos automaticamente
    }),
  );
  SwaggerModule.setup('api', app, document); //disponível na rota localhost:3000/api

  const origin = configService.get<string>('ORIGIN');
  app.enableCors({
    origin: origin?.includes(',') ? origin.split(',') : origin,
    methods: 'GET,PUT,PATCH,POST,DELETE',
    credentials: true,
  }); //habilitado requisições do front
  await app.listen(3000);
}
bootstrap();
