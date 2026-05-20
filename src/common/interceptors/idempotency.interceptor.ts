import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import Redis from 'ioredis';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private redisClient: Redis;

  constructor() {
    // Kumokonekta sa "[NEW] Fast Cache (Redis)" na nasa diagram
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    // Basahin ang Idempotency Key mula sa headers (e.g., x-idempotency-key)
    const idempotencyKey = request.headers['x-idempotency-key'];

    // Ayon sa diagram, ang Idempotency ay madalas sa mutative requests (POST/PUT/PATCH) gaya ng Payment
    if (!idempotencyKey || !['POST', 'PUT', 'PATCH'].includes(request.method)) {
      return next.handle();
    }

    const redisKey = `idempotency:${idempotencyKey}`;

    // 1. CHECK KEY / SET LOCK (Ayon sa diagram)
    // Gumamit ng NX (Set if Not Exists) para magsilbing Distributed Lock habang pinaproseso ang request
// Pinauna natin ang 'EX', 30 bago ang 'NX' para pumasa sa TypeScript
const isLockAcquired = await this.redisClient.set(`lock:${idempotencyKey}`, 'LOCKED', 'EX', 30, 'NX');    
    // 2. Tsek kung may duplicate key na natapos na at may cached response na
    const cachedResponse = await this.redisClient.get(redisKey);
    if (cachedResponse) {
      // Alisin ang lock dahil may sagot na
      await this.redisClient.del(`lock:${idempotencyKey}`);
      // DUPLICATE KEY: Return Cached 200/201 agad nang hindi tinatamaan ang backend controller!
      return of(JSON.parse(cachedResponse));
    }

    // Kung kasalukuyan pang pinaproseso ng isa pang request at walang lock na nakuha
    if (!isLockAcquired) {
      throw new HttpException('Request is already being processed. Please wait.', HttpStatus.CONFLICT);
    }

    // 3. ALLOW: Ipasa sa core pipeline / microservices kung walang cache at nakuha ang lock
    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          // I-save ang response sa Redis Cache (Mawawala after 24 hours / 86400 seconds)
          await this.redisClient.set(redisKey, JSON.stringify(responseData), 'EX', 86400);
        } finally {
          // ALISIN ANG LOCK pagkatapos ma-save ang cache
          await this.redisClient.del(`lock:${idempotencyKey}`);
        }
      }),
    );
  }
}