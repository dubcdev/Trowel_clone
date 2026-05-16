import { paymentsConnected, paymentPolicies } from "@/lib/payments";
import { getSchedulingSummary, scheduleSources } from "@/lib/scheduling";
import { technicians } from "@/lib/operations";
import { a2pComplianceProfile, communicationIdentity, getA2PComplianceSummary, getPhoneProvisioningSummary, phoneProvisioning } from "@/lib/phone-provisioning";

export type ConfirmationStatus = "confirmed" | "review" | "missing" | "blocked";
export type PipelineStatus = "complete" | "in_progress" | "needs_confirmation" | "blocked";

export type EnrichedField = {
  id: string;
  label: string;
  value: string;
  confidence: number;
  sourceUrl: string;
  editable: boolean;
  requiresConfirmation: boolean;
  confirmed: boolean;
  timestamp: string;
};

export type OnboardingCard = {
  id: string;
  title: string;
  status: ConfirmationStatus;
  summary: string;
  fields: EnrichedField[];
  ownerAction: string;
};

export type PipelineStep = {
  id: string;
  label: string;
  status: PipelineStatus;
  detail: string;
};

export type GoLiveStep = {
  id: string;
  label: string;
  status: ConfirmationStatus;
  detail: string;
};

export type ReceptionistProfile = {
  voice: string;
  intakeStyle: string;
  schedulingRule: string;
  escalationRule: string;
  paymentRule: string;
  memoryRule: string;
};

export type GeneratedReceptionistProfile = ReceptionistProfile & {
  businessId: string;
  version: number;
  generatedAt: string;
  approvedForDemo: boolean;
  sourceCards: string[];
};

export const onboardingIdentity = {
  businessName: "Bayview HVAC & Plumbing",
  phone: "(510) 555-0142",
  website: "https://bayviewhvacplumbing.example",
  location: "Hayward, CA",
};

const timestamp = "2026-05-14T21:58:00-07:00";

export const onboardingCards: OnboardingCard[] = [
  {
    id: "business-profile",
    title: "Business profile",
    status: "confirmed",
    summary: "Official business identity is ready for the AI front desk.",
    ownerAction: "Confirmed. Keep editable for corrections.",
    fields: [
      field("business-name", "Business name", "Bayview HVAC & Plumbing", 96, "/"),
      field("public-phone", "Public phone", "(510) 555-0142", 92, "/contact"),
      field("address", "Primary address", "Hayward, CA", 89, "/contact"),
      field("trade-category", "Trade category", "HVAC and plumbing", 91, "/services"),
    ],
  },
  {
    id: "services",
    title: "Services",
    status: "review",
    summary: "Core service menu is detected, but the owner should confirm what the AI may offer.",
    ownerAction: "Confirm services before receptionist books from this list.",
    fields: [
      field("hvac-services", "HVAC services", "No cooling, tune-ups, thermostat issues, emergency heat", 88, "/services/hvac"),
      field("plumbing-services", "Plumbing services", "Burst pipe, clogged drain, sewer backup, leak repair", 90, "/services/plumbing"),
      field("excluded-services", "Excluded services", "Major remodels and warranty pricing not confirmed", 58, "/faq", true, false),
    ],
  },
  {
    id: "hours",
    title: "Hours and after-hours",
    status: "review",
    summary: "Business hours and after-hours lead capture are ready for owner review.",
    ownerAction: "Confirm booking hours, emergency hours, and callback promise.",
    fields: [
      field("business-hours", "Business hours", "Mon-Sat, 7:00 AM - 7:00 PM", 86, "/contact"),
      field("after-hours", "After-hours handling", "Answer every call, qualify, hold emergency slots, escalate urgent work", 81, "/emergency"),
      field("emergency-availability", "Emergency availability", "Plumbing emergencies available with owner approval", 72, "/emergency", true, false),
    ],
  },
  {
    id: "service-area",
    title: "Service area",
    status: "confirmed",
    summary: "Primary cities and ZIP coverage are attached to scheduling and dispatch rules.",
    ownerAction: "Confirmed. Add excluded ZIP codes if needed.",
    fields: [
      field("cities", "Cities served", "Hayward, Oakland, Fremont, San Leandro, Union City", 93, "/service-area"),
      field("zip-codes", "ZIP coverage", "12 ZIP codes detected", 84, "/sitemap.xml"),
      field("travel-buffer", "Travel buffer", "20-45 minutes by zone", 76, "internal://routing"),
    ],
  },
  {
    id: "calendar-rules",
    title: "Calendar rules",
    status: "review",
    summary: "Scheduling source hierarchy is active. Manual approval remains the safety fallback.",
    ownerAction: "Confirm source of truth and emergency hold rules.",
    fields: [
      field("source-of-truth", "Source of truth", "Connected calendar, internal fallback, manual approval for uncertainty", 90, "internal://scheduling"),
      field("technician-count", "Team size", `${technicians.length} technicians`, 100, "internal://team"),
      field("emergency-holds", "Emergency holds", "Protected slots can be held, not confirmed, until dispatcher approval", 95, "internal://dispatch"),
    ],
  },
  {
    id: "communications",
    title: "Phone and texting",
    status: "review",
    summary: "Forwarding-first activation keeps the public business number while Trowel handles AI calls and AI texting.",
    ownerAction: `Enable carrier call forwarding from ${phoneProvisioning.publicBusinessNumber} to ${phoneProvisioning.aiVoiceNumber}.`,
    fields: [
      field("existing-number", "Public business number", `${phoneProvisioning.publicBusinessNumber} stays public`, 100, "internal://communications"),
      field("ai-voice-number", "AI voice number", `${phoneProvisioning.aiVoiceNumber} receives forwarded calls`, 100, "internal://communications"),
      field("ai-texting-number", "AI texting number", `${phoneProvisioning.aiTextingNumber} sends confirmations, photos, payments, and updates`, 100, "internal://communications"),
      field("sms-compliance", "SMS verification", "A2P registration runs in the background and does not block voice activation", 100, "internal://communications"),
      field("porting", "Future porting", "Optional later upgrade. Not required for MVP activation.", 100, "internal://communications"),
    ],
  },
  {
    id: "payments",
    title: "Payment rules",
    status: paymentsConnected ? "review" : "blocked",
    summary: paymentsConnected ? "Payment collection can be enabled after policy confirmation." : "Stripe Connect is not connected, so AI cannot send payment links yet.",
    ownerAction: paymentsConnected ? "Confirm diagnostic and emergency deposit rules." : "Connect Stripe or keep payments optional.",
    fields: paymentPolicies.map((policy) =>
      field(
        policy.id,
        policy.name,
        policy.amount > 0 ? `$${policy.amount} - ${policy.explanation}` : policy.explanation,
        policy.ownerConfirmed ? 100 : 64,
        "internal://payments",
        true,
        policy.ownerConfirmed,
      ),
    ),
  },
];

export const enrichmentPipeline: PipelineStep[] = [
  { id: "normalize", label: "Normalize business identity", status: "complete", detail: "Name, phone, website, and city matched into one business record." },
  { id: "locate-site", label: "Locate official website", status: "complete", detail: "Official website attached as the primary source." },
  { id: "crawl", label: "Crawl approved public pages", status: "complete", detail: "Contact, service, FAQ, emergency, sitemap, and schema pages only." },
  { id: "extract", label: "Extract structured data", status: "complete", detail: "Hours, phone, services, service areas, and emergency claims were parsed." },
  { id: "trade", label: "Identify trade type", status: "complete", detail: "HVAC and plumbing profile selected." },
  { id: "intake", label: "Generate intake profile", status: "needs_confirmation", detail: "Owner must approve services and emergency handling before live use." },
  { id: "rules", label: "Generate escalation rules", status: "needs_confirmation", detail: "Emergency, low-confidence, angry-customer, and price-policy escalations are drafted." },
  { id: "receptionist", label: "Generate AI receptionist profile", status: "needs_confirmation", detail: "Voice, memory, scheduling, and payment rules are staged for demo call." },
];

export const receptionistProfile: ReceptionistProfile = {
  voice: "Warm, calm, concise, and fast. No fake friendliness or long explanations.",
  intakeStyle: "Gather name, phone, service address, issue, urgency, photos when helpful, and preferred window.",
  schedulingRule: "Never invent availability. Use connected source first, internal calendar second, manual approval when uncertain.",
  escalationRule: "Escalate emergencies, angry customers, low confidence, repeat unresolved issues, and payment policy gaps.",
  paymentRule: "Never invent prices. Only request owner-confirmed diagnostic fees or deposits through secure SMS links.",
  memoryRule: "Use recent operational context only: unresolved issues, recent appointments, repeat complaints, technician continuity, and preferences.",
};

export const generatedReceptionistProfile: GeneratedReceptionistProfile = {
  ...receptionistProfile,
  businessId: "business-bayview",
  version: 1,
  generatedAt: timestamp,
  approvedForDemo: false,
  sourceCards: onboardingCards.map((card) => card.id),
};

export function getOnboardingSummary() {
  const cards = onboardingCards;
  const confirmed = cards.filter((card) => card.status === "confirmed").length;
  const blocked = cards.filter((card) => card.status === "blocked").length;
  const review = cards.filter((card) => card.status === "review").length;
  const totalFields = cards.reduce((sum, card) => sum + card.fields.length, 0);
  const confirmedFields = cards.reduce((sum, card) => sum + card.fields.filter((field) => field.confirmed).length, 0);
  const scheduling = getSchedulingSummary();
  const phone = getPhoneProvisioningSummary();
  const compliance = getA2PComplianceSummary();

  return {
    confirmed,
    review,
    blocked,
    total: cards.length,
    totalFields,
    confirmedFields,
    completion: Math.round((confirmedFields / totalFields) * 100),
    readyForDemo: blocked === 0 && review <= 2,
    scheduleSource: scheduling.source.label,
    phoneActivation: phone.completion,
    smsCompliance: compliance.completion,
    activeSources: scheduleSources.filter((source) => source.status === "live" || source.status === "limited").length,
    profileVersion: generatedReceptionistProfile.version,
    approvedForDemo: generatedReceptionistProfile.approvedForDemo,
  };
}

export function getGoLiveSteps(): GoLiveStep[] {
  const summary = getOnboardingSummary();

  return [
    { id: "business", label: "Business found", status: "confirmed", detail: "Identity, phone, and website are attached." },
    { id: "services", label: "Services confirmed", status: "review", detail: "Owner should approve services the AI may book." },
    { id: "hours", label: "Hours and emergency rules", status: "review", detail: "After-hours and emergency escalation rules need final approval." },
    { id: "team", label: "Team and roles", status: "confirmed", detail: `${technicians.length} technicians with roles, shifts, trades, service areas, and emergency eligibility.` },
    { id: "calendar", label: "Scheduling source", status: summary.activeSources > 0 ? "confirmed" : "review", detail: `${summary.scheduleSource} is active with internal fallback and manual approval mode.` },
    { id: "phone", label: "AI phone number", status: "confirmed", detail: `AI voice ${phoneProvisioning.aiVoiceNumber} and AI texting ${phoneProvisioning.aiTextingNumber} are provisioned.` },
    { id: "forwarding", label: "Call forwarding", status: "review", detail: `Keep ${phoneProvisioning.publicBusinessNumber} public and forward calls to ${phoneProvisioning.aiVoiceNumber}.` },
    { id: "test-call", label: "Live test call", status: "review", detail: "Call the existing business number to verify the AI answers through forwarding." },
    { id: "ai-texting", label: "AI texting", status: "review", detail: communicationIdentity.customerFacingMessage },
    { id: "sms-compliance", label: "SMS verification", status: "review", detail: `${a2pComplianceProfile.status.replaceAll("_", " ")}. Runs in background and does not block voice operations.` },
    { id: "porting", label: "Future porting", status: "review", detail: "Optional later upgrade. Voice and SMS unify after the business number ports." },
    { id: "voice", label: "AI voice demo", status: "missing", detail: "Owner has not heard and approved the demo call yet." },
    { id: "payments", label: "Optional payments", status: paymentsConnected ? "review" : "blocked", detail: paymentsConnected ? "Confirm payment policies before collecting fees." : "Payment setup is optional and does not block call handling." },
    { id: "go-live", label: "Go live", status: summary.readyForDemo ? "review" : "blocked", detail: "Go live after owner confirms services, hours, phone, and demo call." },
  ];
}

function field(
  id: string,
  label: string,
  value: string,
  confidence: number,
  sourcePath: string,
  editable = true,
  confirmed = true,
): EnrichedField {
  const isInternal = sourcePath.startsWith("internal://");
  const sourceUrl = isInternal ? sourcePath : `${onboardingIdentity.website}${sourcePath}`;
  return {
    id,
    label,
    value,
    confidence,
    sourceUrl,
    editable,
    requiresConfirmation: !confirmed || confidence < 90,
    confirmed,
    timestamp,
  };
}
