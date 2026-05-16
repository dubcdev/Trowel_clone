import { createFileRoute } from "@tanstack/react-router";
import { jsonOk } from "@/lib/api";
import { getWebhookSecurityContract } from "@/lib/webhook-security";

export const Route = createFileRoute("/api/webhooks/twilio/voice")({
  server: {
    handlers: {
      POST: async () => {
        return jsonOk(
          {
            received: true,
            security: getWebhookSecurityContract("twilio_voice"),
            routeTo: "ai_receptionist_pipeline",
            note: "Live handler answers forwarded calls, starts realtime AI, logs transcript, summarizes, and escalates when needed.",
          },
          "platform",
        );
      },
    },
  },
});
