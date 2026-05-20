import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';

@Module({})
export class GatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // ==========================================
    // 1. pakiSHIP MICROSERVICE (Port: 3001)
    // ==========================================
    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3001',
          changeOrigin: true,
          // MAGIC HAPENS HERE: Tinatanggal natin ang '/api/ship'
          // FE calls: /api/ship/admin/users
          // BE gets:  /admin/users (Pasok sa BFF controllers niyo!)
          pathRewrite: { '^/api/ship': '' }, 
        }),
      )
      .forRoutes('/api/ship'); 

    // ==========================================
    // 2. pakiPARK MICROSERVICE (Port: 3002)
    // ==========================================
    consumer
      .apply(
        createProxyMiddleware({
          target: 'http://localhost:3002',
          changeOrigin: true,
          // FE calls: /api/park/mobile/booking
          // BE gets:  /mobile/booking 
          pathRewrite: { '^/api/park': '' },
        }),
      )
      .forRoutes('/api/park');
  }
}