import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { STORAGE_KEYS } from "../services/apiClient";
import * as authApi from "../services/authApi";
import { logout as apiLogout } from "../services/authApi";

interface User {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readUserFromStorage);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login(email, password);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(tokens.user));
    setUser(tokens.user);
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.register(email, password);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(tokens.user));
    setUser(tokens.user);
  }, []);

  const logout = useCallback(async () => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (accessToken) {
      try {
        await apiLogout(accessToken);
      } catch {
        // best-effort — clear local state regardless
      }
    }
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
