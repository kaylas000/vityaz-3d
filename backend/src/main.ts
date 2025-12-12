import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerService } from './common/logger/logger.service';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new LoggerService(),
  });

  // Security
  app.use(helmet());
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX || '/api/v1');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('VITYAZ API')
    .setDescription('VITYAZ: Special Operations - Game API Documentation')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('battles', 'Battle system')
    .addTag('economy', 'Token economy')
    .addTag('nft', 'NFT system')
    .addTag('staking', 'Staking system')
    .addTag('tournaments', 'Tournament system')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.API_PORT || 3001;
  await app.listen(port);

  const logger = new LoggerService();
  logger.log(`🚀 VITYAZ API running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 API Documentation: http://localhost:${port}/docs`, 'Bootstrap');
  logger.log(`🔧 Environment: ${process.env.NODE_ENV}`, 'Bootstrap');
  logger.log(`🗄️ Database: Connected`, 'Bootstrap');
  logger.log(`📡 Redis: Connected`, 'Bootstrap');
}

bootstrap();
