import { Injectable, ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { UsersService } from "../users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException("El email ya está registrado.");

    const password_hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      id: uuidv4(),
      email: dto.email,
      password_hash,
    });

    const tokens = await this.issueTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refresh_token);
    return { ...tokens, user: { id: user.id, email: user.email } };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Credenciales inválidas.");

    const valid = await bcrypt.compare(dto.password, user.password_hash);
    if (!valid) throw new UnauthorizedException("Credenciales inválidas.");

    const tokens = await this.issueTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refresh_token);
    return { ...tokens, user: { id: user.id, email: user.email } };
  }

  async refresh(userId: string, email: string, rawRefreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user?.refresh_token_hash) throw new UnauthorizedException("Sesión expirada.");

    const valid = await bcrypt.compare(rawRefreshToken, user.refresh_token_hash);
    if (!valid) throw new UnauthorizedException("Token de refresco inválido.");

    const tokens = await this.issueTokens(user.id, user.email);
    await this.storeRefreshToken(user.id, tokens.refresh_token);
    return { ...tokens, user: { id: user.id, email: user.email } };
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async issueTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: "1h",
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
        expiresIn: "7d",
      }),
    ]);
    return { access_token, refresh_token };
  }

  private async storeRefreshToken(userId: string, rawToken: string) {
    const hash = await bcrypt.hash(rawToken, 10);
    await this.usersService.updateRefreshToken(userId, hash);
  }
}
