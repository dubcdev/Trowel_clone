import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { tenantRepositories } from "@/lib/backend";
import { getActionNotifications, getNotificationSummary, getRecentNotifications } from "@/lib/notifications";

export const Route = createFileRoute("/api/notifications")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          tenantRepositories.getMobileSnapshot(session, session.businessId);
          return jsonOk(
            {
              summary: getNotificationSummary(),
              actionItems: getActionNotifications(),
              notifications: getRecentNotifications(20),
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
