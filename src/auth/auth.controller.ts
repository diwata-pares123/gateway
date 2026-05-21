import { Controller, Post, Req } from '@nestjs/common';

@Controller('api/auth')
export class AuthController {
  

  @Post('admin/login')
  adminLogin(@Req() req: any) {
    console.log('Test hit! Idempotency Key:', req.headers['x-idempotency-key']);
    // Ginawa nating object para ma-process nang maayos ng JSON.stringify ng interceptor mo
    return { message: 'pakiADMIN (Next.js Web) - SUCCESS!' };
  }

  @Post('mobile/login')
  mobileLogin() {
    return { message: 'pakiAPPS (Expo Mobile) - SUCCESS!' };
  }
}