import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DeskRole } from "../access/deskRole";
import type { AuthUser, LoginCredentials } from "./authTypes";
import { AuthContext, type AuthContextValue } from "./authContextDef";

const AUTH_STORAGE_KEY = "hotel_auth_session";

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) ?? sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [rememberSession, setRememberSession] = useState(() => {
    try {
      return Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
    } catch {
      return true;
    }
  });

  const role: DeskRole = user ? user.role : "RECEPTION";

  useEffect(() => {
    try {
      if (!user) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        return;
      }

      const storage = rememberSession ? localStorage : sessionStorage;
      const otherStorage = rememberSession ? sessionStorage : localStorage;
      storage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      otherStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      /* Browser storage can be unavailable in private browsing. */
    }
  }, [user, rememberSession]);

  const loginWithUser = useCallback(
    async (targetUser: AuthUser, token?: string, rememberMe: boolean = true): Promise<void> => {
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("authToken", token);
      }
      setRememberSession(rememberMe);
      setUser({ ...targetUser, lastLoginAt: new Date().toISOString() });
    },
    [],
  );

  const login = useCallback(
    async (_credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      void _credentials;
      return { success: false, error: "Sign in through the hotel account form." };
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwt");
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), role, login, loginWithUser, logout }),
    [user, role, login, loginWithUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
