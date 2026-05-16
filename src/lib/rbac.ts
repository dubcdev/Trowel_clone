import type { Role } from "@/lib/role";

export type Permission =
  | "business:manage"
  | "team:manage"
  | "calls:view"
  | "calls:takeover"
  | "customers:view_all"
  | "customers:view_assigned"
  | "jobs:view_all"
  | "jobs:view_assigned"
  | "jobs:update_status"
  | "jobs:assign"
  | "jobs:reschedule"
  | "dispatch:view"
  | "dispatch:approve"
  | "dispatch:override"
  | "payments:view_all"
  | "payments:view_assigned"
  | "payments:configure"
  | "payments:send_link"
  | "payments:waive"
  | "payments:refund"
  | "billing:manage_platform"
  | "connect:manage"
  | "channels:manage"
  | "admin:platform"
  | "settings:view"
  | "settings:manage"
  | "onboarding:confirm"
  | "audit:view";

export type UserSession = {
  userId: string;
  name: string;
  businessId: string;
  role: Role;
  assignedTechnicianId?: string;
};

export type PermissionCheck = {
  permission: Permission;
  allowed: boolean;
  reason: string;
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    "business:manage",
    "team:manage",
    "calls:view",
    "calls:takeover",
    "customers:view_all",
    "jobs:view_all",
    "jobs:update_status",
    "jobs:assign",
    "jobs:reschedule",
    "dispatch:view",
    "dispatch:approve",
    "dispatch:override",
    "payments:view_all",
    "payments:configure",
    "payments:send_link",
    "payments:waive",
    "payments:refund",
    "billing:manage_platform",
    "connect:manage",
    "channels:manage",
    "settings:view",
    "settings:manage",
    "onboarding:confirm",
    "audit:view",
  ],
  dispatcher: [
    "calls:view",
    "calls:takeover",
    "customers:view_all",
    "jobs:view_all",
    "jobs:update_status",
    "jobs:assign",
    "jobs:reschedule",
    "dispatch:view",
    "dispatch:approve",
    "payments:view_all",
    "payments:send_link",
    "payments:waive",
    "connect:manage",
    "channels:manage",
    "settings:view",
  ],
  manager: [
    "calls:view",
    "calls:takeover",
    "customers:view_all",
    "jobs:view_all",
    "jobs:update_status",
    "dispatch:view",
    "payments:view_all",
    "payments:send_link",
    "connect:manage",
    "settings:view",
    "onboarding:confirm",
  ],
  technician: [
    "customers:view_assigned",
    "jobs:view_assigned",
    "jobs:update_status",
    "payments:view_assigned",
  ],
};

export const mockSessions: Record<Role, UserSession> = {
  owner: {
    userId: "user-jason-owner",
    name: "Jason",
    businessId: "business-bayview",
    role: "owner",
  },
  dispatcher: {
    userId: "user-nina-dispatch",
    name: "Nina",
    businessId: "business-bayview",
    role: "dispatcher",
  },
  manager: {
    userId: "user-maya-manager",
    name: "Maya",
    businessId: "business-bayview",
    role: "manager",
  },
  technician: {
    userId: "user-diego-tech",
    name: "Diego",
    businessId: "business-bayview",
    role: "technician",
    assignedTechnicianId: "diego-r",
  },
};

export function getPermissions(role: Role) {
  return ROLE_PERMISSIONS[role];
}

export function can(role: Role, permission: Permission) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function checkPermission(role: Role, permission: Permission): PermissionCheck {
  const allowed = can(role, permission);
  return {
    permission,
    allowed,
    reason: allowed ? "Role can perform this action." : "Role does not have permission for this action.",
  };
}

export function canViewJob(role: Role, jobTechnicianId: string, assignedTechnicianId?: string) {
  if (can(role, "jobs:view_all")) return true;
  return can(role, "jobs:view_assigned") && assignedTechnicianId === jobTechnicianId;
}

export function canViewCustomer(role: Role, customerId: string, assignedCustomerIds: string[] = []) {
  if (can(role, "customers:view_all")) return true;
  return can(role, "customers:view_assigned") && assignedCustomerIds.includes(customerId);
}

export function permissionLabel(permission: Permission) {
  return permission
    .split(":")
    .map((part) => part.replace("_", " "))
    .join(" - ");
}
