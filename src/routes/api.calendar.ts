import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { requireTenantPermission } from "@/lib/backend";
import { availabilityWindows, getSchedulingSummary, scheduleSources } from "@/lib/scheduling";

export const Route = createFileRoute("/api/calendar")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, session.role === "technician" ? "jobs:view_assigned" : "jobs:view_all");
          return jsonOk(
            {
              summary: getSchedulingSummary(),
              sources: scheduleSources,
              availabilityWindows,
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
