import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { getJobPayments } from "@/lib/contractor-payments";

export const Route = createFileRoute("/api/jobs/$jobId/payments")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, session.role === "technician" ? "payments:view_assigned" : "payments:view_all");
          return jsonOk(getJobPayments(params.jobId), session.businessId);
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
