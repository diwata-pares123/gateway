import { Controller, Post, Body, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('checkout')
  async checkout(@Body() body: any, @Req() req: any) {
    // Idempotency check logic is handled by your Interceptor!
    return await this.paymentService.processCheckout(body);
  }
}