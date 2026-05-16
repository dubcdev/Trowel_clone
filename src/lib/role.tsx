import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { can, getPermissions, mockSessions } from "@/lib/rbac";
import type { Permission, UserSession } from "@/lib/rbac";

export type Role = "owner" | "dispatcher" | "manager" | "technician";

export const ROLES: { id: Role; label: string; sub: string }[] = [
  { id: "owner", label: "Owner", sub: "Full operational control" },
  { id: "dispatcher", label: "Dispatcher", sub: "Schedule & assign" },
  { id: "manager", label: "Office Manager", sub: "Calls & customers" },
  { id: "technician", label: "Technician", sub: "Your jobs only" },
];

type Ctx = {
  role: Role;
  setRole: (r: Role) => void;
  session: UserSession;
  permissions: Permission[];
  can: (permission: Permission) => boolean;
};
const RoleContext = createContext<Ctx>({
  role: "owner",
  setRole: () => {},
  session: mockSessions.owner,
  permissions: getPermissions("owner"),
  can: () => false,
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("owner");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("frontline:role") : null;
    if (stored && ROLES.some((r) => r.id === stored)) setRoleState(stored as Role);
  }, []);
  const setRole = (r: Role) => {
    setRoleState(r);
    if (typeof window !== "undefined") localStorage.setItem("frontline:role", r);
  };
  const session = mockSessions[role];
  const permissions = getPermissions(role);
  return <RoleContext.Provider value={{ role, setRole, session, permissions, can: (permission) => can(role, permission) }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);
