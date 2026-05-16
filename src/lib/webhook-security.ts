export type WebhookProvider = "stripe_platform" | "stripe_connect" | "twilio_voice" | "twilio_sms";

export function getWebhookSecurityContract(provider: WebhookProvider) {
  const header =
    provider === "stripe_platform" || provider === "stripe_connect" ? "stripe-signature" : "x-twilio-signature";

  return {
    provider,
    signatureHeader: header,
    verificationRequiredBeforeLive: true,
    secretsMustStayServerSide: true,
    tenantIsolationRequired: true,
    clientExposureAllowed: false,
  };
}
