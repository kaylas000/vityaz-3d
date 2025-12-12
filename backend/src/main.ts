import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn'],
  })

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  })

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const PORT = process.env.PORT || 3001
  await app.listen(PORT)
  console.log(`🥊 VITYAZ Backend listening on port ${PORT}`)
}

bootstrap()
