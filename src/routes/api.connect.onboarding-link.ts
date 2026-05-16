import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { contractorConnectedAccount } from "@/lib/contractor-payments";

export const Route = createFileRoute("/api/connect/onboarding-link")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "connect:manage");
          return jsonOk(
            {
              businessId: session.businessId,
              connectedAccountId: contractorConnectedAccount.connectedAccountId,
              allowedSurface: "web_portal",
              url: "https://connect.stripe.example/onboarding/mock",
              note: "Live implementation creates an account link for the contractor connected account.",
            },
            session.businessId,
          );
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
