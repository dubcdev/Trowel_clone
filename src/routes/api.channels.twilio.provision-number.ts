import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { phoneProvisioning, twilioIsvArchitecture } from "@/lib/phone-provisioning";

export const Route = createFileRoute("/api/channels/twilio/provision-number")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "channels:manage");
          return jsonOk(
            {
              businessId: session.businessId,
              architecture: twilioIsvArchitecture,
              provisioned: phoneProvisioning,
              voiceCanActivateBeforeA2PApproval: true,
              note: "Live implementation creates the contractor subaccount, provisions numbers, and configures Voice/SMS webhooks.",
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
