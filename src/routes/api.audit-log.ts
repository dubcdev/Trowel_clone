import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { createAuditLog, requireTenantPermission } from "@/lib/backend";

export const Route = createFileRoute("/api/audit-log")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "audit:view");
          return jsonOk(
            [
              createAuditLog({
                businessId: session.businessId,
                actorUserId: "user-jason-owner",
                action: "dispatch.approved",
                entityType: "dispatch_event",
                entityId: "dispatch-angela-burst-pipe",
                severity: "sensitive",
                metadata: { source: "mock_api" },
              }),
              createAuditLog({
                businessId: session.businessId,
                actorUserId: "user-jason-owner",
                action: "onboarding.confirmed",
                entityType: "business",
                entityId: session.businessId,
                severity: "info",
                metadata: { source: "mock_api" },
              }),
            ],
            session.businessId,
          );
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
