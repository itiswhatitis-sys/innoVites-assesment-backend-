import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for both dev and deployed frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',              // dev
      'https://inno-vites-assesment-frontend-iko4qjn9m.vercel.app', // deployed frontend
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3001);
  console.log(`🚀 Backend running on port ${process.env.PORT || 3001}`);
}
bootstrap();

