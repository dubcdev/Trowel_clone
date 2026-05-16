import { createFileRoute } from "@tanstack/react-router";
import { jsonOk } from "@/lib/api";
import { getWebhookSecurityContract } from "@/lib/webhook-security";

export const Route = createFileRoute("/api/webhooks/stripe-platform")({
  server: {
    handlers: {
      POST: async () => {
        return jsonOk(
          {
            received: true,
            webOnlyPurpose: "platform_saas_billing",
            security: getWebhookSecurityContract("stripe_platform"),
            note: "Live handler must verify Stripe signature before mutating subscription or entitlement state.",
          },
          "platform",
        );
      },
    },
  },
});
