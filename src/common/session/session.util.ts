import { CookieOptions } from 'express';

export const SESSION_COOKIE = 'pakiapps_session';

export function createSessionToken(payload: any): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export function readSessionToken(token: string): any {
  if (!token) return null;
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(): CookieOptions {
  return { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production', 
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
}

// ==========================================
// 🛠️ ADDED: parseCookieHeader Function
// ==========================================
export function parseCookieHeader(cookieString: string | undefined | null): Record<string, string> {
  if (!cookieString) return {};
  
  return cookieString.split(';').reduce((cookies, item) => {
    const [key, ...valueParts] = item.trim().split('=');
    if (key) {
      // Re-join just in case the cookie value has an '=' character inside it
      cookies[key] = valueParts.join('='); 
    }
    return cookies;
  }, {} as Record<string, string>);
}