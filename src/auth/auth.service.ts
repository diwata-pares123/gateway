import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  // Dito natin idinedefine ang 'login' method na hinahanap ng controller mo
  login(platform: string) {
    return {
      success: true,
      message: `Successfully logged in via ${platform}`,
      token: 'dummy-jwt-token-12345',
      timestamp: new Date().toISOString(),
    };
  }
}