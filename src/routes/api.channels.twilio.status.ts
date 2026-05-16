import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { getA2PComplianceSummary, getPhoneProvisioningSummary, phoneProvisioning, twilioIsvArchitecture } from "@/lib/phone-provisioning";

export const Route = createFileRoute("/api/channels/twilio/status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "settings:view");
          return jsonOk(
            {
              architecture: twilioIsvArchitecture,
              provisioning: phoneProvisioning,
              summary: getPhoneProvisioningSummary(),
              a2p: getA2PComplianceSummary(),
              onboardingContinuesWhileSmsPending: true,
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
