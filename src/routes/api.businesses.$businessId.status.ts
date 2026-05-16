import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { activeBusiness } from "@/lib/business";
import { getConnectStatus } from "@/lib/contractor-payments";
import { getEntitlementState } from "@/lib/platform-billing";
import { getPhoneProvisioningSummary, phoneProvisioning } from "@/lib/phone-provisioning";

export const Route = createFileRoute("/api/businesses/$businessId/status")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, params.businessId, "settings:view");
          return jsonOk(
            {
              business: activeBusiness,
              entitlement: getEntitlementState(),
              channels: {
                summary: getPhoneProvisioningSummary(),
                voiceStatus: phoneProvisioning.voiceStatus,
                smsStatus: phoneProvisioning.smsStatus,
                a2pStatus: phoneProvisioning.a2pStatus,
                communicationMode: phoneProvisioning.communicationMode,
              },
              contractorPayments: getConnectStatus(),
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
