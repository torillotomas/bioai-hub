import axios from "axios";
import { refreshTokens } from "./authApi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "bioai_access_token",
  REFRESH_TOKEN: "bioai_refresh_token",
  USER: "bioai_user",
} as const;

export const apiClient = axios.create({ baseURL: BASE_URL });

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(error: unknown, token: string | null = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const original = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        if (original) original.headers = original.headers ?? {};
        if (original) original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original!);
      });
    }

    original!._retry = true;
    isRefreshing = true;

    const storedRefresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!storedRefresh) {
      isRefreshing = false;
      drainQueue(error);
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    try {
      const tokens = await refreshTokens(storedRefresh);
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(tokens.user));
      drainQueue(null, tokens.access_token);
      original!.headers = original!.headers ?? {};
      original!.headers.Authorization = `Bearer ${tokens.access_token}`;
      return apiClient(original!);
    } catch (refreshError) {
      drainQueue(refreshError);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

function clearAuthAndRedirect() {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  window.location.href = "/login";
}
