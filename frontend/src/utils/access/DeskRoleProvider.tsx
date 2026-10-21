import { useMemo, type ReactNode } from "react";
import { DeskRoleContext } from "./deskRole";
import { useAuth } from "../auth/authContextDef";

export function DeskRoleProvider({ children }: { children: ReactNode }) {
  const { role } = useAuth();
  const value = useMemo(() => ({ role }), [role]);

  return <DeskRoleContext.Provider value={value}>{children}</DeskRoleContext.Provider>;
}
