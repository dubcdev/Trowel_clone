import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { createDispatchApprovalReceipt } from "@/lib/dispatch-approval";
import { dispatchEvents } from "@/lib/operations";

export const Route = createFileRoute("/api/dispatch/$dispatchId/approve")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "dispatch:approve");
          const event = dispatchEvents.find((item) => item.id === params.dispatchId);
          if (!event) return jsonError(new Error("Dispatch event not found."), 404);
          const receipt = createDispatchApprovalReceipt(event, session);
          return jsonOk(
            {
              decision: "approved",
              receipt,
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
