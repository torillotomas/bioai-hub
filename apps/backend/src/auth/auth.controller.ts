import { Controller, Post, Body, UseGuards, Req, HttpCode } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { JwtRefreshGuard } from "./guards/jwt-refresh.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string; refreshToken?: string };
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  refresh(@Req() req: AuthenticatedRequest) {
    const { userId, email, refreshToken } = req.user;
    return this.authService.refresh(userId, email, refreshToken!);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  logout(@Req() req: AuthenticatedRequest) {
    return this.authService.logout(req.user.userId);
  }
}
