import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { getConnectStatus } from "@/lib/contractor-payments";

export const Route = createFileRoute("/api/connect/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, session.role === "technician" ? "payments:view_assigned" : "payments:view_all");
          return jsonOk(getConnectStatus(), session.businessId);
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
