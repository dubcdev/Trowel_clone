import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { tenantRepositories } from "@/lib/backend";

export const Route = createFileRoute("/api/inbox")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          return jsonOk(tenantRepositories.listCalls(session, session.businessId).data, session.businessId);
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
