import { createFileRoute } from "@tanstack/react-router";
import { jsonOk } from "@/lib/api";
import { getWebhookSecurityContract } from "@/lib/webhook-security";

export const Route = createFileRoute("/api/webhooks/stripe-connect")({
  server: {
    handlers: {
      POST: async () => {
        return jsonOk(
          {
            received: true,
            purpose: "contractor_client_payments",
            security: getWebhookSecurityContract("stripe_connect"),
            note: "Live handler updates contractor invoices, payment links, payments, refunds, jobs, customers, and conversations after signature verification.",
          },
          "platform",
        );
      },
    },
  },
});
