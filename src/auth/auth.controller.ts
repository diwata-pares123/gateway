import { BadRequestException, Body, Controller, Post, Res } from "@nestjs/common";
import * as express from "express"; 
import { AuthService } from "./auth.service";
import { createSessionToken, getSessionCookieOptions, SESSION_COOKIE } from "../common/session/session.util";

type UserRole = "customer" | "driver" | "operator" | "parcel_sender";

interface LoginRequestBody {
  role?: UserRole;
  identifier?: string;
  emailOrMobile?: string;
  password?: string;
}

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("admin/login")
  async adminLogin(
    @Body() body: LoginRequestBody, 
    @Res({ passthrough: true }) response: express.Response
  ) {
    return this.processLogin(body, response, "operator");
  }

  @Post("mobile/login")
  async mobileLogin(
    @Body() body: LoginRequestBody, 
    @Res({ passthrough: true }) response: express.Response
  ) {
    return this.processLogin(body, response, "customer");
  }

  @Post("web/login")
  async webLogin(
    @Body() body: LoginRequestBody, 
    @Res({ passthrough: true }) response: express.Response
  ) {
    // I-set mo na lang ang default role dito depende sa kailangan ng pakiSHIP/pakiPARK mo
    return this.processLogin(body, response, "customer"); 
  }

  private async processLogin(
    body: LoginRequestBody, 
    response: express.Response, 
    defaultRole: UserRole
  ) {
    // 1. Clean extraction of values with fallback values
    const role = body.role || defaultRole;
    const identifier = String(body.identifier ?? body.emailOrMobile ?? "").trim();
    const password = String(body.password ?? "").trim();

    // 2. Validation Guard Clause
    if (!identifier || !password) {
      throw new BadRequestException("Identifier and password are required.");
    }

    // 3. Execute Authentication Business Logic (Make sure auth.service.ts uses signIn)
    const result = await this.authService.signIn(identifier, password, role as any);
    
    // 4. Properly typed accessToken to allow string assignment
    let accessToken: string | undefined = undefined;

    if (!result.requiresTwoFactor) {
      accessToken = createSessionToken(result.session);
      response.cookie(SESSION_COOKIE, accessToken, getSessionCookieOptions());
    }

    // 5. Return Unified Response Structure
    return {
      user: result.user,
      redirectPath: result.redirectPath,
      requiresTwoFactor: result.requiresTwoFactor,
      challengeToken: result.challengeToken,
      accessToken,
    };
  }
}