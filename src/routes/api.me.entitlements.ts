import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { getEntitlementState } from "@/lib/platform-billing";

export const Route = createFileRoute("/api/me/entitlements")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "settings:view");
          return jsonOk(getEntitlementState(), session.businessId);
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
