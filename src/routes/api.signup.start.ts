import { createFileRoute } from "@tanstack/react-router";
import { jsonOk } from "@/lib/api";
import { getSignupStartDraft, getWebPortalReadiness } from "@/lib/web-portal";

export const Route = createFileRoute("/api/signup/start")({
  server: {
    handlers: {
      POST: async () => {
        return jsonOk(
          {
            signup: getSignupStartDraft(),
            readiness: getWebPortalReadiness(),
          },
          "pending-business",
        );
      },
    },
  },
});
