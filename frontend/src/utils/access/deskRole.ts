import { createContext, useContext } from "react";

export type DeskRole = "RECEPTION" | "ADMIN" | "SUPER_ADMIN";

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

/** Reception only sees the counter. Admin sees this hotel. Super Admin sees the whole chain portfolio. */
export function canAccessPath(role: DeskRole, pathname: string) {
  if (pathname === "/chain-portfolio" || pathname.startsWith("/chain-portfolio/")) {
    return role === "SUPER_ADMIN";
  }
  if (role !== "RECEPTION") return true;
  if (pathname === "/") return true;
  return RECEPTION_ROOTS.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}
