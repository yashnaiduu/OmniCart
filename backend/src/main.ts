import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // CORS
  app.enableCors({
    origin: '*', // TODO: restrict in prod
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // API versioning prefix — per 06_API_CONTRACTS.md §2.1
  app.setGlobalPrefix('api/v1');

  // Global validation pipe — strict input validation per 13_SECURITY_SPEC.md
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter — standardized error responses per 06_API_CONTRACTS.md §2.4
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Global interceptors — response wrapping + logging
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 OmniCart API running on http://localhost:${port}/api/v1`);
}
bootstrap();
