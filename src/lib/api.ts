import { mockSessions, UserSession } from "@/lib/rbac";
import type { Role } from "@/lib/role";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  meta: {
    businessId: string;
    source: "mock";
  };
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export function getMockSessionFromRequest(request: Request): UserSession {
  const role = new URL(request.url).searchParams.get("role") as Role | null;
  if (role && role in mockSessions) return mockSessions[role];
  return mockSessions.owner;
}

export function jsonOk<T>(data: T, businessId: string, init?: ResponseInit) {
  const payload: ApiSuccess<T> = {
    ok: true,
    data,
    meta: {
      businessId,
      source: "mock",
    },
  };
  return Response.json(payload, init);
}

export function jsonError(error: unknown, status = 403) {
  const message = error instanceof Error ? error.message : "Request could not be completed.";
  const payload: ApiFailure = {
    ok: false,
    error: {
      code: status === 404 ? "not_found" : status === 405 ? "method_not_allowed" : "forbidden",
      message,
    },
  };
  return Response.json(payload, { status });
}
