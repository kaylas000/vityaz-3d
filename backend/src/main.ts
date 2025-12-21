import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.use(cors());

  // API documentation
  const config = new DocumentBuilder()
    .setTitle('VITYAZ API')
    .setDescription('VITYAZ: Special Operations - Backend API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`✅ VITYAZ Backend listening on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
