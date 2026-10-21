import { createContext, useContext } from "react";
import type { DeskRole } from "../access/deskRole";
import type { AuthUser, LoginCredentials } from "./authTypes";

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: DeskRole;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
