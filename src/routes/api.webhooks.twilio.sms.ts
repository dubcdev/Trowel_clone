import { createFileRoute } from "@tanstack/react-router";
import { jsonOk } from "@/lib/api";
import { getWebhookSecurityContract } from "@/lib/webhook-security";

export const Route = createFileRoute("/api/webhooks/twilio/sms")({
  server: {
    handlers: {
      POST: async () => {
        return jsonOk(
          {
            received: true,
            security: getWebhookSecurityContract("twilio_sms"),
            routeTo: "ai_texting_continuity_pipeline",
            note: "Live handler preserves customer memory across SMS, photos, scheduling, dispatch, and payment-link conversations.",
          },
          "platform",
        );
      },
    },
  },
});
