import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  adminLogin() {
    return this.authService.login('pakiADMIN (Next.js Web)');
  }

  @Post('mobile/login')
  mobileLogin() {
    return this.authService.login('pakiAPPS (Expo Mobile)');
  }

  @Post('web/login')
  webLogin() {
    return this.authService.login('pakiSHIP/pakiPARK Clients (Next.js)');
  }
}