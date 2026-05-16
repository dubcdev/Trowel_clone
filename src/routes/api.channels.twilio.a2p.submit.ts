import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { a2pComplianceProfile } from "@/lib/phone-provisioning";

export const Route = createFileRoute("/api/channels/twilio/a2p/submit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "channels:manage");
          return jsonOk(
            {
              businessId: session.businessId,
              profile: a2pComplianceProfile,
              backgroundProcessing: true,
              onboardingBlocked: false,
              note: "A2P/10DLC submission runs asynchronously; voice forwarding and operations can continue.",
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
