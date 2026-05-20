import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import Redis from 'ioredis';

// I-import ang iyong mga modules base sa iyong tree structure
import { GatewayModule } from './gateway/gateway.module';
import { AuthModule } from './auth/auth.module';
import { LoggingModule } from './logging/logging.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentModule } from './payment/payment.module';

// I-import ang kakagawang Idempotency Interceptor
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';

@Module({
  imports: [
    // === [NEW] RATE LIMITER (Token Bucket Middleware) ===
    // Naka-konekta sa Redis para i-store at i-increment ang request counters ng bawat IP
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: 60000, // 1 minuto (60 seconds)
            limit: 100, // Max 100 requests per IP per minute
          },
        ],
        // I-route ang storage ng Rate Limiter sa Redis Cache Instance
        storage: new ThrottlerStorageRedisService(new Redis({ host: 'localhost', port: 6379 })),
      }),
    }),

    // Local at Shared Modules sa iyong API Gateway structure
    AuthModule,
    GatewayModule,
    LoggingModule,
    NotificationsModule,
    PaymentModule,
  ],
  providers: [
    // HARANG 1: Rate Exceeded Check -> Pag sumobra, Return 429 Too Many automatically
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // HARANG 2: Idempotency Validation Pipeline -> Check Lock & Cached Response
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor,
    },
  ],
})
export class AppModule {}