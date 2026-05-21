import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('api/notifications')
export class NotificationsController {
  
  // Dummy endpoint para makuha ng Frontend ang listahan ng notifs
  @Get('list')
  getNotifications() {
    return {
      success: true,
      data: [
        { id: 1, title: 'Welcome!', message: 'Salamat sa pag-register sa pakiPARK.', read: false },
        { id: 2, title: 'Payment Success', message: 'Na-receive na namin ang bayad mo.', read: true }
      ],
      timestamp: new Date().toISOString()
    };
  }

  @Post('send')
  sendNotification(@Body() body: any) {
    return {
      success: true,
      message: 'Notification sent successfully!',
      payloadReceived: body
    };
  }
}