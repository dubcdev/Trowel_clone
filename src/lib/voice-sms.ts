import { getCustomer } from "@/lib/customers";
import { getConversationContextPack } from "@/lib/customer-memory";
import { DispatchEvent, dispatchEvents, Trade } from "@/lib/operations";
import { getPostCallSmsPreview, phoneProvisioning } from "@/lib/phone-provisioning";

export type Channel = "voice" | "sms" | "webchat" | "whatsapp_future";

export type ConversationStatus =
  | "answered"
  | "booked"
  | "escalated"
  | "captured"
  | "missed_recovered"
  | "follow_up";

export type IntakeIntent =
  | "emergency_service"
  | "routine_booking"
  | "reschedule"
  | "payment_question"
  | "warranty_question"
  | "photo_upload"
  | "unknown";

export type UrgencyLevel = "critical" | "high" | "normal" | "low";

export type VoiceProvider = "twilio_voice" | "mock_voice";
export type MessagingProvider = "twilio_sms" | "mock_sms";

export type ProviderWebhookContract = {
  provider: VoiceProvider | MessagingProvider;
  endpoint: string;
  requiredFields: string[];
  responseAction: string;
  persistenceTarget: string;
  liveReady: boolean;
};

export type TranscriptTurn = {
  speaker: "customer" | "ai" | "owner" | "dispatcher";
  text: string;
  at: string;
  confidence?: number;
};

export type ConversationRecord = {
  id: string;
  customerId?: string;
  customerName: string;
  channel: Channel;
  provider: VoiceProvider | MessagingProvider;
  providerConversationId: string;
  phoneNumber: string;
  receivedAt: string;
  status: ConversationStatus;
  intent: IntakeIntent;
  trade?: Trade;
  urgency: UrgencyLevel;
  confidence: number;
  latencyMs?: number;
  summary: string;
  memoryUsed: string[];
  transcript: TranscriptTurn[];
  smsContinuation?: string;
  photoRequest?: {
    status: "not_needed" | "requested" | "received";
    prompt: string;
  };
  escalation?: EscalationDecision;
};

export type EscalationDecision = {
  required: boolean;
  reason: string;
  notifyRoles: Array<"owner" | "dispatcher" | "office_manager">;
  suggestedAction: string;
};

export type IntakeExtraction = {
  intent: IntakeIntent;
  urgency: UrgencyLevel;
  trade?: Trade;
  confidence: number;
  requiresPhoto: boolean;
  requiresEscalation: boolean;
  safetyRules: string[];
};

export const webhookContracts: ProviderWebhookContract[] = [
  {
    provider: "twilio_voice",
    endpoint: "/api/webhooks/twilio/voice/inbound",
    requiredFields: ["CallSid", "From", "To", "CallStatus", "Direction"],
    responseAction: `Receive forwarded calls from ${phoneProvisioning.publicBusinessNumber} through ${phoneProvisioning.aiVoiceNumber}, then start realtime receptionist session and stream transcript events.`,
    persistenceTarget: "calls, conversations, conversation_turns, ai_summaries",
    liveReady: false,
  },
  {
    provider: "twilio_sms",
    endpoint: "/api/webhooks/twilio/sms/inbound",
    requiredFields: ["MessageSid", "From", "To", "Body", "NumMedia"],
    responseAction: `Send continuity messages from ${phoneProvisioning.aiTextingNumber}, continue existing conversation, or create SMS-only intake.`,
    persistenceTarget: "conversations, messages, uploaded_photos, ai_summaries",
    liveReady: false,
  },
];

export const conversations: ConversationRecord[] = [
  {
    id: "conv-angela-voice",
    customerId: "angela-brooks",
    customerName: "Angela Brooks",
    channel: "voice",
    provider: "mock_voice",
    providerConversationId: "CA_mock_angela_001",
    phoneNumber: "(510) 555-0142",
    receivedAt: "Today 9:41 AM",
    status: "escalated",
    intent: "emergency_service",
    trade: "plumbing",
    urgency: "critical",
    confidence: 96,
    latencyMs: 680,
    summary: "Emergency intake complete. Shutoff confirmed, photos requested, and dispatch approval is ready.",
    memoryUsed: ["April kitchen leak unresolved", "Prefers SMS", "Diego continuity preferred"],
    transcript: [
      { speaker: "customer", text: "Water is coming from under my kitchen sink again.", at: "0:04", confidence: 97 },
      { speaker: "ai", text: "I can help. First, are you able to shut off the water safely?", at: "0:07", confidence: 99 },
      { speaker: "customer", text: "Yes, I found the shutoff.", at: "0:19", confidence: 95 },
      { speaker: "ai", text: "Good. I have that noted and will flag this as a repeat issue for the dispatcher.", at: "0:23", confidence: 98 },
    ],
    smsContinuation: getPostCallSmsPreview("Angela"),
    photoRequest: { status: "received", prompt: "Under-sink photo requested by SMS." },
    escalation: {
      required: true,
      reason: "Critical plumbing emergency with unresolved repeat issue.",
      notifyRoles: ["owner", "dispatcher"],
      suggestedAction: "Approve emergency dispatch, then send en-route SMS.",
    },
  },
  {
    id: "conv-erica-voice",
    customerId: "erica-patel",
    customerName: "Erica Patel",
    channel: "voice",
    provider: "mock_voice",
    providerConversationId: "CA_mock_erica_001",
    phoneNumber: "(510) 555-0173",
    receivedAt: "Today 9:18 AM",
    status: "booked",
    intent: "routine_booking",
    trade: "hvac",
    urgency: "normal",
    confidence: 91,
    latencyMs: 640,
    summary: "Booked Friday 10:00 AM with Diego after availability, travel buffer, and membership preference checks.",
    memoryUsed: ["Maintenance member", "Prefers SMS", "Morning windows preferred"],
    transcript: [
      { speaker: "customer", text: "Can I schedule my AC tune-up?", at: "0:03", confidence: 99 },
      { speaker: "ai", text: "Yes. Friday morning with Diego is available and keeps your usual technician.", at: "0:14", confidence: 97 },
    ],
    smsContinuation: "Confirmed: Friday 10:00 AM to 12:00 PM with Diego.",
    photoRequest: { status: "not_needed", prompt: "No photo needed for routine tune-up." },
    escalation: {
      required: false,
      reason: "Routine booking with confirmed availability.",
      notifyRoles: [],
      suggestedAction: "Send confirmation SMS.",
    },
  },
  {
    id: "conv-daniel-voice",
    customerId: "daniel-wu",
    customerName: "Daniel Wu",
    channel: "voice",
    provider: "mock_voice",
    providerConversationId: "CA_mock_daniel_001",
    phoneNumber: "(510) 555-0119",
    receivedAt: "Today 8:52 AM",
    status: "follow_up",
    intent: "emergency_service",
    trade: "electrical",
    urgency: "high",
    confidence: 71,
    latencyMs: 720,
    summary: "Possible electrical panel risk. AI avoided diagnosis and routed to dispatcher review.",
    memoryUsed: ["New customer", "No prior technician relationship", "Safety concern"],
    transcript: [
      { speaker: "customer", text: "My breaker keeps tripping and the panel smells hot.", at: "0:05", confidence: 92 },
      { speaker: "ai", text: "For safety, please avoid the panel. I am going to have our dispatcher confirm the safest next step.", at: "0:11", confidence: 96 },
    ],
    smsContinuation: "If it is safe, please send a photo from a distance. Do not touch the panel.",
    photoRequest: { status: "requested", prompt: "Safe-distance panel photo requested." },
    escalation: {
      required: true,
      reason: "Electrical hazard and low booking confidence.",
      notifyRoles: ["dispatcher"],
      suggestedAction: "Dispatcher reviews before booking.",
    },
  },
  {
    id: "conv-carlos-after-hours",
    customerId: "carlos-mendez",
    customerName: "Carlos Mendez",
    channel: "voice",
    provider: "mock_voice",
    providerConversationId: "CA_mock_carlos_001",
    phoneNumber: "(510) 555-0260",
    receivedAt: "Yesterday 11:42 PM",
    status: "captured",
    intent: "emergency_service",
    trade: "roofing",
    urgency: "high",
    confidence: 88,
    latencyMs: 700,
    summary: "After-hours roof leak captured and morning tarp window held for dispatcher approval.",
    memoryUsed: ["New customer", "Emergency history created", "Insurance concern noted"],
    transcript: [
      { speaker: "customer", text: "Rain is coming through near a ceiling light.", at: "0:06", confidence: 91 },
      { speaker: "ai", text: "Please avoid that area. I can capture this for an emergency tarp review in the morning.", at: "0:12", confidence: 96 },
    ],
    smsContinuation: "Please reply with photos if it is safe. Avoid the ceiling light area.",
    photoRequest: { status: "requested", prompt: "Leak photos requested." },
    escalation: {
      required: true,
      reason: "After-hours active leak with possible electrical proximity.",
      notifyRoles: ["dispatcher"],
      suggestedAction: "Review tarp availability and confirm deposit rule.",
    },
  },
  {
    id: "conv-unknown-recovery",
    customerName: "Unknown caller",
    channel: "sms",
    provider: "mock_sms",
    providerConversationId: "SM_mock_unknown_001",
    phoneNumber: "(415) ... 0211",
    receivedAt: "Yesterday",
    status: "missed_recovered",
    intent: "unknown",
    urgency: "low",
    confidence: 42,
    summary: "Caller hung up after 3 seconds. Recovery SMS sent and lead remains open.",
    memoryUsed: ["No customer match"],
    transcript: [
      { speaker: "ai", text: "Sorry we missed you. What can we help with today?", at: "SMS", confidence: 90 },
    ],
    smsContinuation: "Sorry we missed you. What can we help with today?",
    photoRequest: { status: "not_needed", prompt: "No issue captured yet." },
    escalation: {
      required: false,
      reason: "No issue captured.",
      notifyRoles: [],
      suggestedAction: "Keep recovery thread open.",
    },
  },
];

export function extractIntakeFromText(text: string): IntakeExtraction {
  const normalized = text.toLowerCase();
  const isEmergency = ["burst", "leak", "water", "smell", "sparking", "no heat", "no cooling", "sewer", "ceiling light"].some((term) =>
    normalized.includes(term),
  );
  const isElectrical = ["breaker", "panel", "sparking", "burning", "smell"].some((term) => normalized.includes(term));
  const isPlumbing = ["pipe", "water", "leak", "sink", "sewer", "drain"].some((term) => normalized.includes(term));
  const isRoofing = ["roof", "storm", "tarp", "ceiling"].some((term) => normalized.includes(term));
  const isHvac = ["ac", "cooling", "heat", "furnace", "thermostat"].some((term) => normalized.includes(term));

  const trade: Trade | undefined = isElectrical ? "electrical" : isPlumbing ? "plumbing" : isRoofing ? "roofing" : isHvac ? "hvac" : undefined;
  const urgency: UrgencyLevel = isElectrical || normalized.includes("burst") || normalized.includes("active leak") ? "critical" : isEmergency ? "high" : "normal";
  const intent: IntakeIntent = isEmergency ? "emergency_service" : normalized.includes("reschedule") ? "reschedule" : normalized.includes("pay") || normalized.includes("invoice") ? "payment_question" : "routine_booking";
  const confidence = trade ? 86 : 58;

  return {
    intent,
    urgency,
    trade,
    confidence,
    requiresPhoto: urgency === "critical" || urgency === "high",
    requiresEscalation: urgency === "critical" || urgency === "high" || confidence < 75,
    safetyRules: getSafetyRules(trade, urgency),
  };
}

export function getVoiceSmsSummary() {
  const answered = conversations.filter((conversation) => conversation.channel === "voice" && conversation.status !== "missed_recovered").length;
  const booked = conversations.filter((conversation) => conversation.status === "booked").length;
  const escalated = conversations.filter((conversation) => conversation.escalation?.required).length;
  const afterHours = conversations.filter((conversation) => conversation.receivedAt.toLowerCase().includes("yesterday 11")).length;
  const avgLatencyMs = Math.round(
    conversations.filter((conversation) => conversation.latencyMs).reduce((sum, conversation) => sum + (conversation.latencyMs ?? 0), 0) /
      conversations.filter((conversation) => conversation.latencyMs).length,
  );

  return {
    answered,
    booked,
    escalated,
    afterHours,
    avgLatencyMs,
    avgLatencyDisplay: `${(avgLatencyMs / 1000).toFixed(2)}s`,
    smsContinuations: conversations.filter((conversation) => conversation.smsContinuation).length,
    photoRequests: conversations.filter((conversation) => conversation.photoRequest?.status === "requested" || conversation.photoRequest?.status === "received").length,
    liveProviderReady: webhookContracts.every((contract) => contract.liveReady),
  };
}

export function getConversationByCustomer(customerId: string) {
  return conversations.find((conversation) => conversation.customerId === customerId);
}

export function getOperationalConversationContext(conversation: ConversationRecord) {
  const customer = conversation.customerId ? getCustomer(conversation.customerId) : undefined;
  const contextPack = conversation.customerId ? getConversationContextPack(conversation.customerId) : undefined;
  const relatedDispatch = conversation.customerId ? dispatchEvents.find((event) => event.customerId === conversation.customerId) : undefined;

  return {
    customer,
    contextPack,
    relatedDispatch,
    canAutoBook: canAutoBook(conversation, relatedDispatch),
    nextAction: getNextAction(conversation, relatedDispatch),
  };
}

function canAutoBook(conversation: ConversationRecord, relatedDispatch?: DispatchEvent) {
  if (conversation.escalation?.required) return false;
  if (conversation.confidence < 80) return false;
  if (relatedDispatch?.urgency === "Critical") return false;
  return conversation.status === "booked" || conversation.intent === "routine_booking";
}

function getNextAction(conversation: ConversationRecord, relatedDispatch?: DispatchEvent) {
  if (conversation.escalation?.required) return conversation.escalation.suggestedAction;
  if (relatedDispatch) return "Review dispatch hold before confirming appointment.";
  if (conversation.smsContinuation) return "Send SMS continuation and keep the thread attached to the call.";
  return "No action needed.";
}

function getSafetyRules(trade: Trade | undefined, urgency: UrgencyLevel) {
  const rules = ["Do not invent availability", "Do not invent prices"];
  if (urgency === "critical") rules.push("Escalate before final booking");
  if (trade === "electrical") rules.push("Do not provide electrical troubleshooting beyond basic safety guidance");
  if (trade === "plumbing") rules.push("Ask about shutoff status for active leaks");
  if (trade === "roofing") rules.push("Ask customer to avoid unsafe inspection areas");
  return rules;
}
