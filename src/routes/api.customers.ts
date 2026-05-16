import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { tenantRepositories } from "@/lib/backend";

export const Route = createFileRoute("/api/customers")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          const result = tenantRepositories.listCustomers(session, session.businessId);
          return jsonOk(result.data, session.businessId);
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});
