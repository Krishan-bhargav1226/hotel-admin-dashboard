import { createContext, useContext } from "react";

export type DeskRole = "RECEPTION" | "ADMIN" | "SUPER_ADMIN" | "USER";

export function mapBackendRole(role: string | undefined): DeskRole {
  const lower = (role ?? "").toLowerCase();
  if (lower === "superadmin" || lower === "super_admin") return "SUPER_ADMIN";
  if (lower === "admin") return "ADMIN";
  if (lower === "reception" || lower === "receptionist") return "RECEPTION";
  return "USER";
}

const RECEPTION_ROOTS = ["/check-in", "/reservations", "/stays", "/guests", "/pos-services", "/lost-found"];

export interface DeskRoleValue {
  role: DeskRole;
}

export const DeskRoleContext = createContext<DeskRoleValue | null>(null);

export function useDeskRole() {
  const ctx = useContext(DeskRoleContext);
  if (!ctx) throw new Error("useDeskRole must be used within DeskRoleProvider");
  return ctx;
}

/** Reception only sees the counter. Admin sees this hotel. Super Admin sees the whole chain portfolio. User sees normal portal. */
export function canAccessPath(role: DeskRole, pathname: string) {
  if (role === "USER") {
    return pathname === "/" || pathname === "";
  }
  if (pathname === "/chain-portfolio" || pathname.startsWith("/chain-portfolio/")) {
    return role === "SUPER_ADMIN";
  }
  if (role !== "RECEPTION") return true;
  if (pathname === "/") return true;
  return RECEPTION_ROOTS.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}
