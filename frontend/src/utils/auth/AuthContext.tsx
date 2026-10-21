import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DeskRole } from "../access/deskRole";
import type { AuthUser, LoginCredentials } from "./authTypes";
import { authenticateMockUser, MOCK_ACCOUNTS } from "./mockUsers";
import { AuthContext, type AuthContextValue } from "./authContextDef";
import { setActiveHotelProperty } from "../db/localDb";

const AUTH_STORAGE_KEY = "hotel_auth_session";

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY) ?? sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw) as AuthUser;
    const account = MOCK_ACCOUNTS.find((candidate) => candidate.user.id === stored.id);
    return account ? { ...account.user, lastLoginAt: stored.lastLoginAt } : null;
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

  const login = useCallback(
    async ({ username, password, rememberMe = true }: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const authenticatedUser = authenticateMockUser(username, password);
      if (!authenticatedUser) {
        return { success: false, error: "Invalid username or password." };
      }

      if (authenticatedUser.propertyId !== "ALL") {
        await setActiveHotelProperty(authenticatedUser.propertyId);
      }

      setRememberSession(rememberMe);
      setUser(authenticatedUser);
      return { success: true };
    },
    [],
  );

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: Boolean(user), role, login, logout }),
    [user, role, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
