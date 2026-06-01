import { Test } from "@nestjs/testing";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";

const mockUser = {
  id: "user-1",
  email: "doc@hospital.com",
  password_hash: "",
  refresh_token_hash: null as string | null,
  created_at: new Date(),
};

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue("signed-token"),
};

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue("test-secret"),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get(AuthService);
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("crea usuario y retorna tokens cuando el email no existe", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ ...mockUser, email: "doc@hospital.com" });

      const result = await service.register({ email: "doc@hospital.com", password: "pass123" });

      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty("access_token");
      expect(result).toHaveProperty("refresh_token");
      expect(result.user.email).toBe("doc@hospital.com");
    });

    it("lanza ConflictException cuando el email ya está registrado", async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: "doc@hospital.com", password: "pass123" })
      ).rejects.toBeInstanceOf(ConflictException);
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("retorna tokens con credenciales válidas", async () => {
      const hash = await bcrypt.hash("pass123", 10);
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, password_hash: hash });

      const result = await service.login({ email: "doc@hospital.com", password: "pass123" });

      expect(result).toHaveProperty("access_token");
      expect(result.user.email).toBe("doc@hospital.com");
    });

    it("lanza UnauthorizedException con password incorrecta", async () => {
      const hash = await bcrypt.hash("correcto", 10);
      mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, password_hash: hash });

      await expect(
        service.login({ email: "doc@hospital.com", password: "incorrecto" })
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("lanza UnauthorizedException cuando el email no existe", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: "noexiste@hospital.com", password: "pass123" })
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe("refresh", () => {
    it("retorna nuevos tokens con refresh token válido", async () => {
      const rawToken = "raw-refresh-token";
      const hash = await bcrypt.hash(rawToken, 10);
      mockUsersService.findById.mockResolvedValue({ ...mockUser, refresh_token_hash: hash });

      const result = await service.refresh("user-1", "doc@hospital.com", rawToken);

      expect(result).toHaveProperty("access_token");
      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledTimes(1);
    });

    it("lanza UnauthorizedException cuando el hash no coincide", async () => {
      const hash = await bcrypt.hash("token-correcto", 10);
      mockUsersService.findById.mockResolvedValue({ ...mockUser, refresh_token_hash: hash });

      await expect(
        service.refresh("user-1", "doc@hospital.com", "token-incorrecto")
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it("lanza UnauthorizedException cuando refresh_token_hash es null", async () => {
      mockUsersService.findById.mockResolvedValue({ ...mockUser, refresh_token_hash: null });

      await expect(
        service.refresh("user-1", "doc@hospital.com", "cualquier-token")
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("llama a updateRefreshToken con null", async () => {
      await service.logout("user-1");

      expect(mockUsersService.updateRefreshToken).toHaveBeenCalledWith("user-1", null);
    });
  });
});
