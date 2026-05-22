import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // ✅ BAGONG DAGDAG
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import Redis from 'ioredis';

// --- Iyong Core/Domain Modules ---
import { GatewayModule } from './gateway/gateway.module';
import { LoggingModule } from './logging/logging.module';

// --- Shared Services Modules natin ---
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentModule } from './payment/payment.module';

// --- Interceptors ---
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor';

@Module({
  imports: [
    // === [NEW] CONFIG MODULE ===
    // 🔥 Ito ang magbabasa ng .env file mo at gagawin siyang available sa buong app!
    ConfigModule.forRoot({
      isGlobal: true, 
    }),

    // === RATE LIMITER (Token Bucket Middleware) ===
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule], // In-inject natin si ConfigModule para magamit dito
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: 60000, 
            limit: 100, 
          },
        ],
        // ✅ Mas safe: Kukunin na niya ang Redis port at host sa .env, pero may fallback na localhost:6379
        storage: new ThrottlerStorageRedisService(
          new Redis({
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
          })
        ),
      }),
    }),

    // === MODULES REGISTRATION ===
    SupabaseModule, 
    AuthModule,
    GatewayModule,
    LoggingModule,
    NotificationsModule,
    PaymentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // 🔥 Pumipigil sa Spam (DDoS)
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: IdempotencyInterceptor, // 🔥 Pumipigil sa Double-charge sa payment
    },
  ],
})
export class AppModule {}