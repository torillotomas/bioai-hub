import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import * as request from "supertest";
import { AuthModule } from "./auth.module";
import { AnalysisModule } from "../analysis/analysis.module";
import { AiClientService } from "../ai-client/ai-client.service";
import { User } from "../users/user.entity";
import { Analysis } from "../analysis/entities/analysis.entity";

const TEST_ENV = {
  JWT_ACCESS_SECRET: "test-access-secret-32chars-minimum",
  JWT_REFRESH_SECRET: "test-refresh-secret-32chars-minimum",
};

async function buildApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [() => TEST_ENV] }),
      TypeOrmModule.forRoot({
        type: "better-sqlite3",
        database: ":memory:",
        entities: [User, Analysis],
        synchronize: true,
      }),
      AuthModule,
      AnalysisModule,
    ],
  })
    .overrideProvider(AiClientService)
    .useValue({ predictWithCam: jest.fn() })
    .compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
  return app;
}

describe("Auth e2e", () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("201 — registra usuario y retorna tokens", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "doc@hospital.com", password: "Passw0rd!" });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("access_token");
      expect(res.body).toHaveProperty("refresh_token");
      expect(res.body.user.email).toBe("doc@hospital.com");

      accessToken = res.body.access_token as string;
      refreshToken = res.body.refresh_token as string;
    });

    it("409 — email duplicado", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/register")
        .send({ email: "doc@hospital.com", password: "OtroPass1!" });

      expect(res.status).toBe(409);
    });
  });

  describe("POST /auth/login", () => {
    it("200 — credenciales válidas retornan tokens", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "doc@hospital.com", password: "Passw0rd!" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token");
      accessToken = res.body.access_token as string;
      refreshToken = res.body.refresh_token as string;
    });

    it("401 — password incorrecta", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "doc@hospital.com", password: "incorrecto" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("200 — retorna nuevos tokens con refresh válido", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Authorization", `Bearer ${refreshToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("access_token");
      accessToken = res.body.access_token as string;
    });
  });

  describe("GET /analysis", () => {
    it("401 — sin token", async () => {
      const res = await request(app.getHttpServer()).get("/analysis");
      expect(res.status).toBe(401);
    });

    it("200 — con token válido retorna array del usuario", async () => {
      const res = await request(app.getHttpServer())
        .get("/analysis")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("POST /auth/logout", () => {
    it("200 — invalida sesión", async () => {
      const res = await request(app.getHttpServer())
        .post("/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
    });
  });
});
