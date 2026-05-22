import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  async adminLogin() {
    return this.processLogin('pakiADMIN (Next.js Web)');
  }

  @Post('mobile/login')
  async mobileLogin() {
    return this.processLogin('pakiAPPS (Expo Mobile)');
  }

  @Post('web/login')
  async webLogin() {
    return this.processLogin('pakiSHIP/pakiPARK Clients (Next.js)');
  }

  /**
   * ✅ Reusable private method para malinis ang code (DRY Principle).
   * Pinalitan natin ang 'login' ng 'signIn' para pumasa sa AuthService mo.
   */
  private async processLogin(platform: string) {
    // Note: Siguraduhing tumutugma ang parameters dito sa hinihingi ng iyong authService.signIn()
    return this.authService.signIn(platform, '', 'customer' as any); 
  }
}