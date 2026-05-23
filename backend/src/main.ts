import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { CustomLogger } from './logger/logger.service';
import * as Sentry from '@sentry/node';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const customLogger = new CustomLogger();
  const app = await NestFactory.create(AppModule, {
    logger: customLogger,
  });

  // Initialize Sentry for Error Tracking
  Sentry.init({
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

  const config = new DocumentBuilder()
    .setTitle('OmniCart API')
    .setDescription('The OmniCart API backend description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  customLogger.log(`🚀 OmniCart API running on http://localhost:${port}/api/v1`, 'Bootstrap');
  customLogger.log(`📚 Swagger Docs running on http://localhost:${port}/api/docs`, 'Bootstrap');
}
bootstrap();
