export type VoiceStatus = "not_started" | "ai_number_ready" | "forwarding_pending" | "test_ready" | "live";
export type SmsStatus = "not_started" | "ai_texting_ready" | "active" | "ported";
export type PortingStatus = "not_started" | "offered" | "in_progress" | "ported";
export type CallForwardingStatus = "not_started" | "instructions_ready" | "enabled_by_contractor" | "verified";
export type ProvisioningStatus = "complete" | "current" | "up_next" | "optional" | "blocked";
export type A2PStatus = "not_started" | "profile_draft" | "brand_pending" | "campaign_pending" | "approved" | "rejected";
export type CommunicationMode = "forwarding_plus_ai_sms" | "ported_unified_number";
export type ComplianceFieldStatus = "prefilled" | "needs_confirmation" | "missing" | "submitted";
export type TwilioIsolationMode = "platform_master_with_business_subaccounts";

export type TwilioIsvArchitecture = {
  platformAccountSid: string;
  isolationMode: TwilioIsolationMode;
  sharedNumberPoolAllowed: false;
  sharedMessagingIdentityAllowed: false;
  subaccountPerBusiness: true;
  numberOwnership: "business_subaccount";
  messagingReputationScope: "business_subaccount";
  complianceScope: "business_subaccount";
  rationale: string;
  scaleRule: string;
};

export type TwilioBusinessProvisioning = {
  businessId: string;
  provider: "twilio";
  publicBusinessNumber: string;
  aiVoiceNumber: string;
  aiTextingNumber: string;
  accountSid: string;
  subaccountSid: string;
  architecture: TwilioIsolationMode;
  voicePhoneNumberSid: string;
  smsPhoneNumberSid: string;
  messagingServiceSid: string;
  voiceWebhookUrl: string;
  smsWebhookUrl: string;
  voiceStatus: VoiceStatus;
  smsStatus: SmsStatus;
  a2pStatus: A2PStatus;
  communicationMode: CommunicationMode;
  portingStatus: PortingStatus;
  callForwardingStatus: CallForwardingStatus;
  recordingPolicy: "disabled" | "enabled_after_consent" | "enabled_where_legal";
  retentionPolicy: string;
};

export const twilioIsvArchitecture: TwilioIsvArchitecture = {
  platformAccountSid: "AC_PLATFORM_MASTER",
  isolationMode: "platform_master_with_business_subaccounts",
  sharedNumberPoolAllowed: false,
  sharedMessagingIdentityAllowed: false,
  subaccountPerBusiness: true,
  numberOwnership: "business_subaccount",
  messagingReputationScope: "business_subaccount",
  complianceScope: "business_subaccount",
  rationale:
    "Each contractor needs isolated phone numbers, messaging reputation, compliance registrations, webhook configuration, and lifecycle controls.",
  scaleRule:
    "Never route multiple contractors through one shared number pool, one shared messaging service identity, or one giant Twilio account.",
};

export type ComplianceField = {
  id: string;
  label: string;
  value: string;
  status: ComplianceFieldStatus;
  source: "public_enrichment" | "owner_input" | "system_default";
  editable: boolean;
};

export type A2PComplianceProfile = {
  businessId: string;
  secondaryCustomerProfileSid?: string;
  brandRegistrationSid?: string;
  campaignRegistrationSid?: string;
  status: A2PStatus;
  backgroundProcessing: boolean;
  ownerMessage: string;
  fields: ComplianceField[];
  sampleMessages: string[];
  optInLanguage: string;
};

export type CarrierForwardingInstruction = {
  carrier: string;
  steps: string[];
  testAction: string;
};

export type ProvisioningStep = {
  id: string;
  label: string;
  status: ProvisioningStatus;
  ownerCopy: string;
  systemAction: string;
};

export type CommunicationIdentity = {
  headline: string;
  voicePath: string[];
  smsPath: string[];
  customerFacingMessage: string;
  ownerPromise: string;
};

export const phoneProvisioning: TwilioBusinessProvisioning = {
  businessId: "business-bayview",
  provider: "twilio",
  publicBusinessNumber: "(510) 555-0142",
  aiVoiceNumber: "(510) 555-0440",
  aiTextingNumber: "(510) 555-0441",
  accountSid: "AC_PLATFORM_MASTER",
  subaccountSid: "AC_BAYVIEW_SUBACCOUNT",
  architecture: "platform_master_with_business_subaccounts",
  voicePhoneNumberSid: "PN_BAYVIEW_AI_VOICE",
  smsPhoneNumberSid: "PN_BAYVIEW_AI_TEXT",
  messagingServiceSid: "MG_BAYVIEW_AI_TEXTING",
  voiceWebhookUrl: "/api/webhooks/twilio/voice/inbound",
  smsWebhookUrl: "/api/webhooks/twilio/sms/inbound",
  voiceStatus: "forwarding_pending",
  smsStatus: "ai_texting_ready",
  a2pStatus: "campaign_pending",
  communicationMode: "forwarding_plus_ai_sms",
  portingStatus: "offered",
  callForwardingStatus: "instructions_ready",
  recordingPolicy: "enabled_after_consent",
  retentionPolicy: "Store call recordings and transcripts only when legally compliant and configured by owner.",
};

export const a2pComplianceProfile: A2PComplianceProfile = {
  businessId: "business-bayview",
  secondaryCustomerProfileSid: "BU_BAYVIEW_SECONDARY_PROFILE_DRAFT",
  brandRegistrationSid: "BN_BAYVIEW_BRAND_PENDING",
  campaignRegistrationSid: "QE_BAYVIEW_CAMPAIGN_PENDING",
  status: "campaign_pending",
  backgroundProcessing: true,
  ownerMessage: "AI Voice Front Desk is live. AI texting verification is processing in the background.",
  fields: [
    complianceField("legal-name", "Legal business name", "Bayview HVAC & Plumbing", "prefilled", "public_enrichment"),
    complianceField("tax-id", "EIN / Tax ID", "Needs owner entry", "missing", "owner_input"),
    complianceField("authorized-contact", "Authorized contact", "Jason Morales", "needs_confirmation", "owner_input"),
    complianceField("contact-email", "Contact email", "office@bayviewhvacplumbing.example", "prefilled", "public_enrichment"),
    complianceField("contact-phone", "Contact phone", "(510) 555-0142", "prefilled", "public_enrichment"),
    complianceField("entity-type", "Entity type", "Private company", "needs_confirmation", "owner_input"),
    complianceField("messaging-use-case", "Messaging use case", "Customer care, appointment updates, photos, payment links, review requests", "prefilled", "system_default"),
    complianceField("opt-in-method", "Opt-in method", "Customer calls business, receives service follow-up SMS, and can reply STOP", "needs_confirmation", "system_default"),
  ],
  sampleMessages: [
    "Thanks for calling Bayview HVAC & Plumbing. You can reply here for scheduling, updates, photos, or questions.",
    "Your appointment is confirmed for Friday from 10 AM to 12 PM. Reply here if you need to make a change.",
    "Please reply with a photo of the issue if it is safe to do so. This helps the technician prepare.",
  ],
  optInLanguage:
    "By calling or requesting service, customers may receive appointment, scheduling, service update, and follow-up texts from the business. Message and data rates may apply. Reply STOP to opt out.",
};

export const carrierForwardingInstructions: CarrierForwardingInstruction[] = [
  {
    carrier: "Most mobile carriers",
    steps: [`Dial **21*${phoneProvisioning.aiVoiceNumber.replace(/\D/g, "")}#`, "Press call", "Wait for confirmation from your carrier"],
    testAction: "Call your existing business number from another phone and confirm the AI answers.",
  },
  {
    carrier: "Office phone or VoIP provider",
    steps: ["Open call forwarding settings", `Set all calls to forward to ${phoneProvisioning.aiVoiceNumber}`, "Save changes"],
    testAction: "Use the live test call step in onboarding.",
  },
];

export const communicationIdentity: CommunicationIdentity = {
  headline: "Activate your AI front desk instantly while keeping your current business number.",
  voicePath: [
    "Customer calls existing business number",
    "Contractor enables simple carrier call forwarding",
    "Calls forward to assigned Twilio AI voice number",
    "AI answers, qualifies, books, escalates, summarizes, and dispatches",
  ],
  smsPath: [
    "Inbound SMS can stay with the existing carrier during MVP setup",
    "Trowel provisions a dedicated AI texting number",
    "Post-call SMS moves the customer into the AI-managed texting thread",
    "Future porting can unify voice and SMS under the original business number",
  ],
  customerFacingMessage:
    "Thanks for calling Bayview HVAC & Plumbing. You can reply here for scheduling, updates, photos, or questions.",
  ownerPromise: "Get operational in minutes. Telecom migration can happen later.",
};

export function getProvisioningSteps(): ProvisioningStep[] {
  return [
    {
      id: "account",
      label: "Create isolated contractor subaccount",
      status: "complete",
      ownerCopy: "Business account is ready with its own communication identity.",
      systemAction: "Create business record under the platform master account and isolate the contractor in a dedicated Twilio subaccount.",
    },
    {
      id: "provision-number",
      label: "Provision AI numbers",
      status: "complete",
      ownerCopy: `AI voice ${phoneProvisioning.aiVoiceNumber} and AI texting ${phoneProvisioning.aiTextingNumber} are ready.`,
      systemAction: "Buy or assign numbers inside the contractor subaccount, configure a contractor-specific messaging service, and store SIDs.",
    },
    {
      id: "receptionist",
      label: "Configure AI receptionist",
      status: "complete",
      ownerCopy: "Receptionist behavior, memory, scheduling, dispatch, and payment safety rules are staged.",
      systemAction: "Attach business profile, customer memory, scheduling rules, and escalation thresholds.",
    },
    {
      id: "sms-compliance",
      label: "Start SMS verification",
      status: "complete",
      ownerCopy: "AI texting is configured. SMS compliance continues in the background.",
      systemAction: "Create contractor-specific messaging service, draft secondary customer profile, prepare brand and campaign registration under the subaccount.",
    },
    {
      id: "forwarding",
      label: "Enable call forwarding",
      status: "current",
      ownerCopy: `Forward ${phoneProvisioning.publicBusinessNumber} to ${phoneProvisioning.aiVoiceNumber}. Keep your public number.`,
      systemAction: "Show carrier-specific forwarding instructions and wait for test call verification.",
    },
    {
      id: "test-call",
      label: "Run live test call",
      status: "up_next",
      ownerCopy: "Call your existing business number and make sure the AI answers.",
      systemAction: "Verify Twilio inbound call reaches the AI voice webhook and produces a summary.",
    },
    {
      id: "sms",
      label: "Activate AI texting",
      status: "up_next",
      ownerCopy: "After each AI-handled call, send a helpful SMS from the dedicated AI texting number.",
      systemAction: "Enable SMS continuation, photo uploads, payment links, technician updates, and missed-call recovery.",
    },
    {
      id: "porting",
      label: "Offer future number porting",
      status: "optional",
      ownerCopy: "Later, port your business number so voice and SMS use the same public identity.",
      systemAction: "Track porting status and promote the ported number when complete.",
    },
  ];
}

export function getPhoneProvisioningSummary() {
  const steps = getProvisioningSteps();
  const complete = steps.filter((step) => step.status === "complete").length;
  const current = steps.find((step) => step.status === "current");

  return {
    complete,
    total: steps.length,
    completion: Math.round((complete / steps.length) * 100),
    currentStep: current?.label ?? "Ready",
    voiceReady: phoneProvisioning.voiceStatus !== "not_started",
    smsReady: phoneProvisioning.smsStatus !== "not_started",
    a2pStatus: phoneProvisioning.a2pStatus,
    communicationMode: phoneProvisioning.communicationMode,
    architecture: twilioIsvArchitecture.isolationMode,
    isolatedSubaccount: Boolean(phoneProvisioning.subaccountSid),
    sharedIdentityAllowed: false,
    smsApprovalBlocksOnboarding: false,
    portingRequiredForMvp: false,
    ownerMessage: communicationIdentity.ownerPromise,
  };
}

export function getA2PComplianceSummary() {
  const total = a2pComplianceProfile.fields.length;
  const confirmed = a2pComplianceProfile.fields.filter((field) => field.status === "prefilled" || field.status === "submitted").length;
  const missing = a2pComplianceProfile.fields.filter((field) => field.status === "missing").length;

  return {
    status: a2pComplianceProfile.status,
    backgroundProcessing: a2pComplianceProfile.backgroundProcessing,
    confirmed,
    total,
    missing,
    completion: Math.round((confirmed / total) * 100),
    blocksVoiceActivation: false,
    blocksOnboarding: false,
    message: a2pComplianceProfile.ownerMessage,
  };
}

export function getCommunicationModeLabel(mode = phoneProvisioning.communicationMode) {
  if (mode === "ported_unified_number") return "Ported number: original business number handles voice and SMS";
  return "MVP mode: call forwarding plus dedicated AI texting number";
}

export function getPostCallSmsPreview(_customerName = "there") {
  return "Thanks for calling Bayview HVAC & Plumbing. You can reply here for scheduling, updates, photos, or questions.";
}

function complianceField(
  id: string,
  label: string,
  value: string,
  status: ComplianceFieldStatus,
  source: ComplianceField["source"],
  editable = true,
): ComplianceField {
  return { id, label, value, status, source, editable };
}
