import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import configuration from './config/configuration';
import { PrismaModule } from './prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { SearchModule } from './search/search.module';
import { CollectionsModule } from './collections/collections.module';
import { FeedModule } from './feed/feed.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * Root Application Module
 *
 * Wires together:
 * - ConfigModule (env + typed config)
 * - ThrottlerModule (rate limiting per 13_SECURITY_SPEC.md)
 * - PrismaModule (database, global)
 * - RedisModule (caching, global)
 * - AuthModule (JWT auth)
 * - SearchModule (core search + aggregation + AI engine + connectors)
 * - CollectionsModule (CRUD lists)
 * - FeedModule (home feed)
 *
 * Global guards:
 * - JwtAuthGuard (all routes require JWT unless @Public())
 * - ThrottlerGuard (rate limiting)
 */
@Module({
  imports: [
    // Configuration — load .env and typed config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Rate limiting — global 100 req/min per 06_API_CONTRACTS.md §12
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),

    // Infrastructure
    PrismaModule,
    RedisModule,

    // Core modules
    AuthModule,
    SearchModule,
    CollectionsModule,
    FeedModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global JWT auth guard — every route requires auth unless @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Global rate limiter
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply request-id middleware to all routes
    consumer.apply(RequestIdMiddleware).forRoutes('*path');
  }
}
