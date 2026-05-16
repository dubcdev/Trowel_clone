import { activeBusiness } from "@/lib/business";

export type EntitlementStatus =
  | "active"
  | "onboarding_pending"
  | "payment_failed"
  | "suspended"
  | "canceled"
  | "trialing"
  | "contact_support";

export type PlatformSubscriptionStatus =
  | "incomplete"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid";

export type PlatformCustomer = {
  id: string;
  businessId: string;
  platformCustomerId: string;
  ownerUserId: string;
  billingEmail: string;
};

export type PlatformSubscription = {
  id: string;
  businessId: string;
  subscriptionId: string;
  subscriptionStatus: PlatformSubscriptionStatus;
  priceId: string;
  currentPeriodEnd: string;
  failedPaymentStatus?: "none" | "retrying" | "requires_support";
  entitlementStatus: EntitlementStatus;
};

export type PlatformInvoice = {
  id: string;
  businessId: string;
  platformInvoiceId: string;
  subscriptionId: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  amountDue: number;
  hostedInvoiceUrl?: string;
};

export type EntitlementState = {
  businessId: string;
  status: EntitlementStatus;
  mobileAccess: "full" | "limited" | "blocked";
  mobileMessage: string;
  supportAction: "none" | "contact_support" | "request_access";
  webBillingOnly: true;
};

export const platformBillingPolicy = {
  webOnlySubscriptionBilling: true,
  mobileSaasCheckoutAllowed: false,
  mobileUpgradeLanguageAllowed: false,
  stripeMode: "billing_checkout",
  note:
    "SaaS signup, subscription checkout, customer portal, upgrades, downgrades, and failed-payment recovery stay in the web portal. Mobile only reads entitlement status.",
} as const;

export const platformCustomer: PlatformCustomer = {
  id: "platform-customer-bayview",
  businessId: activeBusiness.id,
  platformCustomerId: "cus_platform_bayview_mock",
  ownerUserId: activeBusiness.ownerUserId,
  billingEmail: "owner@bayviewhvac.example",
};

export const platformSubscription: PlatformSubscription = {
  id: "platform-sub-bayview",
  businessId: activeBusiness.id,
  subscriptionId: "sub_platform_bayview_mock",
  subscriptionStatus: "active",
  priceId: "price_contractor_ops_ai_monthly_mock",
  currentPeriodEnd: "2026-06-15",
  failedPaymentStatus: "none",
  entitlementStatus: "active",
};

export const platformInvoices: PlatformInvoice[] = [
  {
    id: "platform-invoice-bayview-may",
    businessId: activeBusiness.id,
    platformInvoiceId: "in_platform_bayview_mock",
    subscriptionId: platformSubscription.id,
    status: "paid",
    amountDue: 500,
  },
];

export function getEntitlementState(status: EntitlementStatus = platformSubscription.entitlementStatus): EntitlementState {
  const base = {
    businessId: activeBusiness.id,
    status,
    webBillingOnly: true as const,
  };

  if (status === "active" || status === "trialing") {
    return {
      ...base,
      mobileAccess: "full",
      mobileMessage: status === "active" ? "Your account is active." : "Your account is active during setup.",
      supportAction: "none",
    };
  }

  if (status === "onboarding_pending") {
    return {
      ...base,
      mobileAccess: "limited",
      mobileMessage: "Setup is still in progress. Core account status is available here.",
      supportAction: "contact_support",
    };
  }

  return {
    ...base,
    mobileAccess: status === "payment_failed" ? "limited" : "blocked",
    mobileMessage: "Contact support to review account access.",
    supportAction: "contact_support",
  };
}

export function getPlatformBillingSummary() {
  return {
    policy: platformBillingPolicy,
    customer: platformCustomer,
    subscription: platformSubscription,
    entitlement: getEntitlementState(),
    invoices: platformInvoices,
  };
}

export function createPlatformCheckoutSessionDraft() {
  return {
    webOnly: true,
    provider: "stripe_checkout",
    mode: "subscription",
    businessId: activeBusiness.id,
    priceId: platformSubscription.priceId,
    allowedSurface: "web_portal",
    mobileBlockedReason: "Mobile app is an existing-customer operations dashboard, not a SaaS subscription storefront.",
  };
}

export function createPlatformCustomerPortalDraft() {
  return {
    webOnly: true,
    provider: "stripe_customer_portal",
    businessId: activeBusiness.id,
    allowedSurface: "web_portal",
    handles: ["payment_method", "subscription_status", "subscription_invoices", "cancel_or_reactivate"],
  };
}
