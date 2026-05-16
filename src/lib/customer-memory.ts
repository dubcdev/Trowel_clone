import { Customer, customers, TimelineEvent } from "@/lib/customers";
import { scheduledJobs, technicians } from "@/lib/operations";

export type MemorySignalType =
  | "unresolved_issue"
  | "repeat_issue"
  | "callback_risk"
  | "frustration"
  | "technician_continuity"
  | "emergency_history"
  | "communication_preference"
  | "membership_priority";

export type MemorySignal = {
  type: MemorySignalType;
  label: string;
  score: number;
  priority: 1 | 2 | 3 | 4 | 5 | 6;
  source: string;
  action: string;
};

export type RepeatIssueDetection = {
  customerId: string;
  repeatIssueFlag: boolean;
  callbackRiskScore: number;
  customerFrustrationScore: number;
  unresolvedIssueScore: number;
  detectedPattern: string;
  operationalReason: string;
};

export type ContinuityRecommendation = {
  customerId: string;
  preferredTechnicianId?: string;
  preferredTechnicianName?: string;
  confidence: number;
  reason: string;
  fallback: string;
};

export type AIContextPack = {
  customerId: string;
  greetingContext: string;
  retrievedSignals: MemorySignal[];
  safePhrases: string[];
  suppressedContext: string[];
  escalationRequired: boolean;
  nextBestAction: string;
};

export type CustomerMemoryRecord = {
  customer: Customer;
  detection: RepeatIssueDetection;
  continuity: ContinuityRecommendation;
  contextPack: AIContextPack;
};

export function getCustomerMemoryRecord(customerId: string) {
  const customer = customers.find((c) => c.id === customerId);
  if (!customer) return undefined;

  return buildCustomerMemoryRecord(customer);
}

export function getCustomerMemoryRecords() {
  return customers.map(buildCustomerMemoryRecord).sort((a, b) => {
    const bTop = Math.max(b.detection.unresolvedIssueScore, b.detection.callbackRiskScore, b.detection.customerFrustrationScore);
    const aTop = Math.max(a.detection.unresolvedIssueScore, a.detection.callbackRiskScore, a.detection.customerFrustrationScore);
    return bTop - aTop;
  });
}

export function getCustomerMemorySummary() {
  const records = getCustomerMemoryRecords();
  const contextPacksReady = records.filter((record) => record.contextPack.retrievedSignals.length > 0).length;
  const repeatIssueFlags = records.filter((record) => record.detection.repeatIssueFlag).length;
  const escalationsRequired = records.filter((record) => record.contextPack.escalationRequired).length;
  const continuityRecommendations = records.filter((record) => record.continuity.preferredTechnicianId).length;

  return {
    customersTracked: records.length,
    contextPacksReady,
    repeatIssueFlags,
    escalationsRequired,
    continuityRecommendations,
    highestRiskCustomer: records[0]?.customer.name ?? "None",
  };
}

export function getConversationContextPack(customerId: string) {
  return getCustomerMemoryRecord(customerId)?.contextPack;
}

function buildCustomerMemoryRecord(customer: Customer): CustomerMemoryRecord {
  const detection = detectRepeatIssue(customer);
  const continuity = getContinuityRecommendation(customer);
  const contextPack = buildContextPack(customer, detection, continuity);

  return {
    customer,
    detection,
    continuity,
    contextPack,
  };
}

function detectRepeatIssue(customer: Customer): RepeatIssueDetection {
  const repeatMentions = customer.timeline.filter((event) => hasRepeatLanguage(event)).length;
  const repeatBadge = customer.badges.some((badge) => badge === "Repeat Issue" || badge === "Repeat Caller");
  const unresolvedIssueScore = clampScore(customer.memoryScores.unresolved + (customer.unresolved ? 8 : 0));
  const callbackRiskScore = clampScore(customer.memoryScores.callbackRisk + repeatMentions * 4);
  const customerFrustrationScore = clampScore(customer.memoryScores.frustration + (customer.sentiment === "unhappy" ? 9 : 0));
  const repeatIssueFlag = repeatBadge || customer.memoryScores.repeatIssue >= 65 || repeatMentions >= 2;

  return {
    customerId: customer.id,
    repeatIssueFlag,
    callbackRiskScore,
    customerFrustrationScore,
    unresolvedIssueScore,
    detectedPattern: customer.recurringIssue ?? summarizeTimelinePattern(customer.timeline),
    operationalReason: getOperationalReason(customer, repeatIssueFlag, unresolvedIssueScore),
  };
}

function getContinuityRecommendation(customer: Customer): ContinuityRecommendation {
  const priorTechnicianName = customer.preferredTech ?? mostRecentTechnician(customer.timeline);
  const technician = technicians.find((tech) => priorTechnicianName && tech.name === priorTechnicianName);
  const activeJob = scheduledJobs.find((job) => job.customerId === customer.id);

  if (technician) {
    return {
      customerId: customer.id,
      preferredTechnicianId: technician.id,
      preferredTechnicianName: technician.name,
      confidence: activeJob?.technicianId === technician.id ? 94 : 82,
      reason: activeJob?.technicianId === technician.id
        ? "Assigned technician matches prior relationship."
        : "Prior technician relationship found in customer memory.",
      fallback: "If unavailable, dispatcher should preserve trade fit and explain the change plainly.",
    };
  }

  return {
    customerId: customer.id,
    confidence: 44,
    reason: "No reliable prior technician relationship found.",
    fallback: "Assign by trade, emergency eligibility, service area, and ETA.",
  };
}

function buildContextPack(customer: Customer, detection: RepeatIssueDetection, continuity: ContinuityRecommendation): AIContextPack {
  const signals = getSignals(customer, detection, continuity).sort((a, b) => a.priority - b.priority || b.score - a.score);
  const retrievedSignals = signals.slice(0, 6);
  const suppressedContext = [
    "Do not mention lifetime value to the customer.",
    "Do not mention internal risk scores.",
    "Do not quote warranty, deposit, or arrival policy unless configured.",
  ];

  return {
    customerId: customer.id,
    greetingContext: buildGreetingContext(customer),
    retrievedSignals,
    safePhrases: customer.aiMemoryHints,
    suppressedContext,
    escalationRequired:
      detection.unresolvedIssueScore >= 80 ||
      detection.customerFrustrationScore >= 85 ||
      customer.activeJob?.toLowerCase().includes("low-confidence") === true,
    nextBestAction: customer.nextBestAction,
  };
}

function getSignals(customer: Customer, detection: RepeatIssueDetection, continuity: ContinuityRecommendation): MemorySignal[] {
  const signals: MemorySignal[] = [];

  if (customer.unresolved) {
    signals.push({
      type: "unresolved_issue",
      label: customer.unresolved,
      score: detection.unresolvedIssueScore,
      priority: 1,
      source: "unresolved_issue_tracking",
      action: "Surface before offering a new booking.",
    });
  }

  if (detection.repeatIssueFlag) {
    signals.push({
      type: "repeat_issue",
      label: detection.detectedPattern,
      score: customer.memoryScores.repeatIssue,
      priority: 2,
      source: "repeat_issue_detection",
      action: "Ask whether this is the same problem area before treating it as new.",
    });
  }

  if (detection.callbackRiskScore >= 60) {
    signals.push({
      type: "callback_risk",
      label: `Callback risk ${detection.callbackRiskScore}`,
      score: detection.callbackRiskScore,
      priority: 3,
      source: "issue_history",
      action: "Preserve notes and route to dispatcher review if booking is uncertain.",
    });
  }

  if (continuity.preferredTechnicianName) {
    signals.push({
      type: "technician_continuity",
      label: `${continuity.preferredTechnicianName} continuity preferred`,
      score: continuity.confidence,
      priority: 4,
      source: "technician_relationships",
      action: "Offer same technician only if availability is confirmed.",
    });
  }

  if (customer.badges.includes("Emergency History")) {
    signals.push({
      type: "emergency_history",
      label: "Prior emergency context exists",
      score: 72,
      priority: 5,
      source: "emergency_history",
      action: "Classify urgency before routine scheduling.",
    });
  }

  signals.push({
    type: "communication_preference",
    label: `Prefers ${customer.communicationPreference}`,
    score: 70,
    priority: 6,
    source: "customer_preferences",
    action: customer.prefersText ? "Continue by SMS when appropriate." : "Offer a callback when needed.",
  });

  if (customer.membershipStatus !== "None") {
    signals.push({
      type: "membership_priority",
      label: `${customer.membershipStatus} customer`,
      score: customer.membershipStatus === "VIP" ? 92 : 74,
      priority: 6,
      source: "customer_preferences",
      action: "Apply confirmed membership priority rules only.",
    });
  }

  return signals;
}

function buildGreetingContext(customer: Customer) {
  if (customer.jobsCount === 0) return "New customer. Keep greeting simple and avoid implying prior service.";
  if (customer.recurringIssue) return `Returning customer. Acknowledge prior help without sounding invasive: ${customer.recurringIssue}.`;
  if (customer.preferredTech) return `Returning customer. Prior technician relationship: ${customer.preferredTech}.`;
  return "Returning customer. Use recent service history only if it helps the current request.";
}

function getOperationalReason(customer: Customer, repeatIssueFlag: boolean, unresolvedIssueScore: number) {
  if (unresolvedIssueScore >= 80) return "Unresolved issue should be handled before routine booking.";
  if (customer.sentiment === "unhappy") return "Customer sentiment requires owner or office review before policy response.";
  if (repeatIssueFlag) return "Repeated contact pattern detected across calls, visits, or badges.";
  return "No high-risk repeat pattern detected.";
}

function summarizeTimelinePattern(timeline: TimelineEvent[]) {
  const recent = timeline.find((event) => event.detail || event.title);
  return recent?.detail ?? recent?.title ?? "No repeat pattern detected.";
}

function hasRepeatLanguage(event: TimelineEvent) {
  const text = `${event.title} ${event.detail ?? ""}`.toLowerCase();
  return ["again", "repeat", "fourth", "same", "follow-up", "not closed", "unresolved"].some((needle) => text.includes(needle));
}

function mostRecentTechnician(timeline: TimelineEvent[]) {
  return timeline.find((event) => event.technician)?.technician;
}

function clampScore(score: number) {
  return Math.max(0, Math.min(99, score));
}
