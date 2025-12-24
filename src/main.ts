import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:3000',          // Local development
      'https://inno-vites-assesment-frontend.vercel.app/',   // Production frontend domain
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });

  // ✅ Global validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Use dynamic port for Render
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 Backend running on port ${port}`);
}

bootstrap();
