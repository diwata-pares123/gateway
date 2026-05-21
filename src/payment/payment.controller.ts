import { Controller, Post, Body } from '@nestjs/common';

@Controller('api/payment')
export class PaymentController {
  @Post('checkout')
  dummyCheckout(@Body() body: any) {

    return {
      success: true,
      transactionId: 'txn_dummy_12345',
      message: 'Mock payment successful! Walang totoong pera na binawas.',
      status: 'PAID'
    };
  }
}