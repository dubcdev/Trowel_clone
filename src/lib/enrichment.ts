import { onboardingCards, onboardingIdentity, receptionistProfile } from "@/lib/onboarding";
import { a2pComplianceProfile } from "@/lib/phone-provisioning";

export type EnrichmentSourceKind =
  | "official_website"
  | "sitemap"
  | "schema_markup"
  | "faq_page"
  | "public_directory"
  | "google_business_provider"
  | "internal_confirmation";

export type EnrichmentSource = {
  id: string;
  kind: EnrichmentSourceKind;
  label: string;
  url: string;
  status: "approved" | "queued" | "blocked" | "complete";
  robotsAllowed: boolean;
  rateLimit: string;
  lastChecked: string;
  fieldsFound: string[];
};

export type EnrichmentAuditLog = {
  id: string;
  at: string;
  actor: "system" | "owner" | "crawler" | "ai_profile_generator";
  action: string;
  sourceId?: string;
  detail: string;
};

export type OnboardingConfirmation = {
  id: string;
  businessId: string;
  cardId: string;
  fieldId: string;
  originalValue: string;
  confirmedValue: string;
  status: "confirmed" | "needs_review" | "rejected";
  confirmedBy?: string;
  confirmedAt?: string;
  sourceUrl: string;
};

export type IntakeProfile = {
  id: string;
  businessId: string;
  tradeCategories: string[];
  approvedServices: string[];
  emergencySignals: string[];
  requiredQuestions: string[];
  photoRequestRules: string[];
  lowConfidenceFallback: string;
};

export type EscalationRuleDraft = {
  id: string;
  label: string;
  trigger: string;
  action: string;
  status: "owner_confirmed" | "needs_owner_review";
};

export type DemoCallReadiness = {
  ready: boolean;
  score: number;
  blockers: string[];
  nextAction: string;
  sampleOpening: string;
};

const now = "2026-05-15T10:35:00-07:00";

export const enrichmentSources: EnrichmentSource[] = [
  {
    id: "source-official-site",
    kind: "official_website",
    label: "Official website",
    url: onboardingIdentity.website,
    status: "complete",
    robotsAllowed: true,
    rateLimit: "1 page every 3 seconds",
    lastChecked: now,
    fieldsFound: ["business name", "phone", "services", "hours", "service area"],
  },
  {
    id: "source-sitemap",
    kind: "sitemap",
    label: "Sitemap",
    url: `${onboardingIdentity.website}/sitemap.xml`,
    status: "complete",
    robotsAllowed: true,
    rateLimit: "1 sitemap fetch per onboarding run",
    lastChecked: now,
    fieldsFound: ["service pages", "FAQ pages", "emergency page"],
  },
  {
    id: "source-schema",
    kind: "schema_markup",
    label: "Structured schema markup",
    url: onboardingIdentity.website,
    status: "complete",
    robotsAllowed: true,
    rateLimit: "same page parse only",
    lastChecked: now,
    fieldsFound: ["local business type", "address", "phone", "hours"],
  },
  {
    id: "source-google-provider",
    kind: "google_business_provider",
    label: "Public business profile provider",
    url: "provider://google-business-public",
    status: "queued",
    robotsAllowed: true,
    rateLimit: "provider API limits",
    lastChecked: now,
    fieldsFound: ["review summary", "public hours", "category"],
  },
];

export const onboardingConfirmations: OnboardingConfirmation[] = onboardingCards.flatMap((card) =>
  card.fields.map((field) => ({
    id: `confirm-${card.id}-${field.id}`,
    businessId: "business-bayview",
    cardId: card.id,
    fieldId: field.id,
    originalValue: field.value,
    confirmedValue: field.confirmed ? field.value : "",
    status: field.confirmed ? "confirmed" : "needs_review",
    confirmedBy: field.confirmed ? "user-jason-owner" : undefined,
    confirmedAt: field.confirmed ? now : undefined,
    sourceUrl: field.sourceUrl,
  })),
);

export const intakeProfile: IntakeProfile = {
  id: "intake-bayview-front-desk",
  businessId: "business-bayview",
  tradeCategories: ["HVAC", "Plumbing"],
  approvedServices: [
    "No cooling",
    "AC tune-up",
    "Thermostat issue",
    "Burst pipe",
    "Clogged drain",
    "Sewer backup",
    "Leak repair",
  ],
  emergencySignals: ["burst pipe", "active leak", "sewer backup", "no heat during unsafe temperature", "burning smell"],
  requiredQuestions: ["Name", "Best phone", "Service address", "Issue summary", "Urgency", "Photos if helpful", "Preferred window"],
  photoRequestRules: ["Ask for leak, equipment, panel, roof, and appliance photos when safe", "Never delay emergency escalation for photos"],
  lowConfidenceFallback: "Hold the request, summarize uncertainty, and ask owner or dispatcher for approval.",
};

export const escalationRuleDrafts: EscalationRuleDraft[] = [
  {
    id: "rule-emergency",
    label: "Emergency dispatch",
    trigger: "Burst pipe, active leak, sewer backup, burning smell, lockout risk, or unsafe no-heat/no-cooling condition.",
    action: "Create emergency event, notify owner/dispatcher, hold nearest eligible technician, and continue gathering safe details.",
    status: "needs_owner_review",
  },
  {
    id: "rule-repeat-issue",
    label: "Repeat unresolved issue",
    trigger: "Customer has unresolved issue, repeat complaint, high callback risk, or recent emergency history.",
    action: "Attach memory context, prioritize dispatcher review, and avoid treating the issue like a new first-time lead.",
    status: "owner_confirmed",
  },
  {
    id: "rule-price",
    label: "Price uncertainty",
    trigger: "Payment policy, warranty, diagnostic fee, refund, or deposit amount is unclear.",
    action: "Do not quote. Hold the booking or offer callback until owner/dispatcher approves.",
    status: "owner_confirmed",
  },
];

export const enrichmentAuditLogs: EnrichmentAuditLog[] = [
  { id: "audit-normalize", at: now, actor: "system", action: "normalized_business_identity", detail: `${onboardingIdentity.businessName}, ${onboardingIdentity.phone}, ${onboardingIdentity.location}` },
  { id: "audit-robots", at: now, actor: "crawler", action: "checked_robots_and_rate_limits", sourceId: "source-official-site", detail: "Official website crawl approved for public pages only." },
  { id: "audit-schema", at: now, actor: "crawler", action: "extracted_schema_markup", sourceId: "source-schema", detail: "Business type, hours, address, and phone extracted with owner confirmation required." },
  { id: "audit-profile", at: now, actor: "ai_profile_generator", action: "generated_receptionist_profile", detail: "Drafted intake, escalation, memory, scheduling, payment, and tone rules." },
];

export function getEnrichmentSummary() {
  const sourcesComplete = enrichmentSources.filter((source) => source.status === "complete").length;
  const fields = onboardingCards.flatMap((card) => card.fields);
  const confirmationNeeded = onboardingConfirmations.filter((item) => item.status === "needs_review").length;
  const confirmed = onboardingConfirmations.filter((item) => item.status === "confirmed").length;
  const ownerReviewedRules = escalationRuleDrafts.filter((rule) => rule.status === "owner_confirmed").length;

  return {
    sources: enrichmentSources.length,
    sourcesComplete,
    fields: fields.length,
    confirmed,
    confirmationNeeded,
    averageConfidence: Math.round(fields.reduce((sum, field) => sum + field.confidence, 0) / fields.length),
    rules: escalationRuleDrafts.length,
    ownerReviewedRules,
    a2pConfirmedFields: a2pComplianceProfile.fields.filter((field) => field.status === "confirmed" || field.status === "prefilled").length,
  };
}

export function getDemoCallReadiness(): DemoCallReadiness {
  const summary = getEnrichmentSummary();
  const blockers: string[] = [];

  if (summary.confirmationNeeded > 4) blockers.push(`${summary.confirmationNeeded} enriched fields need owner review`);
  if (escalationRuleDrafts.some((rule) => rule.status === "needs_owner_review")) blockers.push("Emergency escalation rule needs owner approval");
  if (!receptionistProfile.voice) blockers.push("Voice profile is missing");

  const score = Math.max(0, Math.min(100, 100 - blockers.length * 18 - summary.confirmationNeeded * 2));

  return {
    ready: blockers.length <= 1,
    score,
    blockers,
    nextAction: blockers.length > 0 ? "Approve services, emergency rules, and demo-call script before go-live." : "Run demo call and approve voice personality.",
    sampleOpening: `Thanks for calling ${onboardingIdentity.businessName}. How can I help today?`,
  };
}
