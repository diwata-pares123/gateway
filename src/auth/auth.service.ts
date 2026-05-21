import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
 
  login(platform: string) {
    return {
      success: true,
      message: `Successfully logged in via ${platform}`,
      token: 'dummy-jwt-token-12345',
      timestamp: new Date().toISOString(),
    };
  }
}