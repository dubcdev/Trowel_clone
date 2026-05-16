import { createPlatformCheckoutSessionDraft, platformBillingPolicy } from "@/lib/platform-billing";

export type WebsiteStepStatus = "ready" | "stubbed" | "live_pending";

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  bestFor: string;
  included: string[];
  cta: string;
};

export type SignupWorkflowStep = {
  id: string;
  label: string;
  detail: string;
  status: WebsiteStepStatus;
};

export type ContractorUseCase = {
  trade: string;
  trigger: string;
  outcome: string;
};

export type WebsiteFaq = {
  question: string;
  answer: string;
};

export const websiteNav = [
  { label: "Product", to: "/website" },
  { label: "Pricing", to: "/pricing" },
  { label: "Get started", to: "/signup" },
  { label: "Download app", to: "/download-app" },
] as const;

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter-ops",
    name: "Front Desk",
    price: "$500",
    cadence: "per month",
    bestFor: "Owner-operated contractors who need every call answered.",
    included: [
      "AI phone answering",
      "Call forwarding setup",
      "Customer memory",
      "Booking and dispatch holds",
      "Daily summaries",
    ],
    cta: "Start setup",
  },
  {
    id: "growth-ops",
    name: "Dispatch",
    price: "$850",
    cadence: "per month",
    bestFor: "Teams with multiple technicians and after-hours emergencies.",
    included: [
      "Everything in Front Desk",
      "Emergency dispatch queue",
      "Technician availability",
      "Payment-link workflows",
      "Priority owner alerts",
    ],
    cta: "Start setup",
  },
];

export const websiteOutcomeStats = [
  { label: "Calls answered", value: "24/7" },
  { label: "Setup target", value: "Minutes" },
  { label: "Porting needed", value: "No" },
] as const;

export const contractorUseCases: ContractorUseCase[] = [
  {
    trade: "HVAC",
    trigger: "No cooling after hours",
    outcome: "Qualify urgency, check availability, hold the first safe window, and alert the owner if emergency rules apply.",
  },
  {
    trade: "Plumbing",
    trigger: "Burst pipe or sewer backup",
    outcome: "Escalate immediately, capture shutoff status, request photos by text, and recommend the closest eligible technician.",
  },
  {
    trade: "Electrical",
    trigger: "Burning smell or dead panel",
    outcome: "Treat as critical, summarize safety context, and route to dispatcher approval before making promises.",
  },
  {
    trade: "Roofing",
    trigger: "Storm leak or tarp request",
    outcome: "Collect address, leak location, insurance concern, photos, and availability for emergency review.",
  },
];

export const websiteFaqs: WebsiteFaq[] = [
  {
    question: "Do we have to port our phone number right away?",
    answer: "No. The MVP path uses call forwarding first, so your public business number can stay on your website, trucks, and Google profile while calls forward into the AI number.",
  },
  {
    question: "Can the AI book without double-booking my team?",
    answer: "It should only book against configured calendars, holds, working hours, service areas, travel buffers, and approval rules. If it is uncertain, it holds or escalates instead of guessing.",
  },
  {
    question: "Where does subscription payment happen?",
    answer: "The contractor subscription is handled on the web portal through Stripe Checkout. The mobile app is for existing customers and team members to run daily operations.",
  },
  {
    question: "Can we collect customer deposits or invoices?",
    answer: "Yes. Customer payments are separate from the Trowel subscription and use the contractor connected Stripe account for real-world services.",
  },
];

export const websiteTrustPoints = [
  "No workflow builder required",
  "No immediate phone-number port",
  "No invented prices or availability",
  "Owner approval when risk is unclear",
] as const;

export const signupWorkflow: SignupWorkflowStep[] = [
  {
    id: "owner-account",
    label: "Create owner account",
    detail: "Collect business owner identity and login credentials in the web portal.",
    status: "stubbed",
  },
  {
    id: "saas-checkout",
    label: "Secure subscription checkout",
    detail: "Send the contractor to Stripe Checkout for the Trowel SaaS subscription.",
    status: "stubbed",
  },
  {
    id: "business-onboarding",
    label: "Complete setup",
    detail: "Confirm business info, team, calendar, Twilio, A2P, and optional Stripe Connect.",
    status: "ready",
  },
  {
    id: "download-app",
    label: "Download the app",
    detail: "Owner and team members log into the mobile operations dashboard after setup.",
    status: "ready",
  },
];

export const appDownloadOptions = [
  {
    id: "ios",
    label: "iPhone",
    status: "App Store build pending",
    detail: "Use this after the iOS app is packaged. No subscription purchase happens inside the app.",
  },
  {
    id: "android",
    label: "Android",
    status: "Google Play build pending",
    detail: "Use this after the Android app is packaged. No in-app SaaS checkout is shown.",
  },
  {
    id: "web",
    label: "Current prototype",
    status: "Available now",
    detail: "Open the mobile web dashboard on this device for QA and owner review.",
  },
];

export function getSignupStartDraft() {
  return {
    businessAccountStatus: "pending_checkout",
    checkout: createPlatformCheckoutSessionDraft(),
    nextAfterPayment: "/portal",
    appDownloadAfterSetup: "/download-app",
    policy: platformBillingPolicy,
  };
}

export function getWebPortalReadiness() {
  return {
    publicWebsite: "ready",
    pricing: "ready",
    stripeCheckout: "stubbed",
    onboardingHandoff: "ready",
    appDownloadHandoff: "ready",
    mobileSubscriptionStorefront: false,
  };
}
