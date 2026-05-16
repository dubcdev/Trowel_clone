import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { getAppSnapshot } from "@/lib/app-data";
import { tenantRepositories } from "@/lib/backend";

export const Route = createFileRoute("/api/mobile/snapshot")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          tenantRepositories.getMobileSnapshot(session, session.businessId);
          return jsonOk(getAppSnapshot(), session.businessId);
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
