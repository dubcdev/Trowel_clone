import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { createPlatformCheckoutSessionDraft } from "@/lib/platform-billing";

export const Route = createFileRoute("/api/billing/checkout-session")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "billing:manage_platform");
          return jsonOk(createPlatformCheckoutSessionDraft(), session.businessId);
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
