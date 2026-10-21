import type { DeskRole } from "../access/deskRole";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: DeskRole;
  title: string;
  department: string;
  avatarUrl?: string;
  propertyId: string;
  propertyName: string;
  phone: string;
  lastLoginAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
