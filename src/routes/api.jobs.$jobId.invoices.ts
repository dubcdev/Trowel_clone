import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { createContractorInvoiceDraft } from "@/lib/contractor-payments";

export const Route = createFileRoute("/api/jobs/$jobId/invoices")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "payments:send_link");
          return jsonOk(createContractorInvoiceDraft(params.jobId), session.businessId);
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
