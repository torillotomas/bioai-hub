import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

const authHttp = axios.create({ baseURL: BASE_URL });

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user: { id: string; email: string };
}

export async function register(email: string, password: string): Promise<AuthTokens> {
  const { data } = await authHttp.post<AuthTokens>("/api/v1/auth/register", { email, password });
  return data;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const { data } = await authHttp.post<AuthTokens>("/api/v1/auth/login", { email, password });
  return data;
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const { data } = await authHttp.post<AuthTokens>("/api/v1/auth/refresh", null, {
    headers: { Authorization: `Bearer ${refreshToken}` },
  });
  return data;
}

export async function logout(accessToken: string): Promise<void> {
  await authHttp.post("/api/v1/auth/logout", null, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
