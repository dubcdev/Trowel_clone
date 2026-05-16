import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { getPlatformBillingSummary } from "@/lib/platform-billing";

export const Route = createFileRoute("/api/billing/subscription")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "billing:manage_platform");
          return jsonOk(getPlatformBillingSummary(), session.businessId);
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
