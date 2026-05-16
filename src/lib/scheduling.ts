import { DispatchEvent, ScheduledJob, Technician, TechnicianStatus, Trade, dispatchEvents, scheduledJobs, technicians, tradeLabel } from "@/lib/operations";

export type ScheduleSourceKind = "field_service" | "calendar" | "internal" | "manual_approval";
export type SourceHealth = "live" | "limited" | "fallback" | "approval_required";
export type BookingDecision = "book" | "hold_for_approval" | "suggest_alternative" | "do_not_book";

export type ScheduleSource = {
  kind: ScheduleSourceKind;
  label: string;
  status: SourceHealth;
  priority: number;
  description: string;
  examples: string;
};

export type AvailabilityWindow = {
  id: string;
  technicianId: string;
  label: string;
  start: string;
  end: string;
  sourceKind: ScheduleSourceKind;
  confidence: number;
  emergency: boolean;
  notes: string[];
};

export type SchedulingAssessment = {
  source: ScheduleSource;
  decision: BookingDecision;
  confidence: number;
  technician?: Technician;
  window?: AvailabilityWindow;
  conflicts: string[];
  approvalReasons: string[];
  safeNextAction: string;
};

export const scheduleSources: ScheduleSource[] = [
  {
    kind: "field_service",
    label: "Field-service system",
    status: "limited",
    priority: 1,
    description: "Use ServiceTitan, Jobber, Housecall Pro, Workiz, FieldPulse, and similar platforms as the source of truth when connected.",
    examples: "ServiceTitan, Jobber, Housecall Pro, Workiz, FieldPulse",
  },
  {
    kind: "calendar",
    label: "Connected calendar",
    status: "live",
    priority: 2,
    description: "Normalize Google, Outlook, iCloud, Calendly, Cal.com, and Square events into technician availability.",
    examples: "Google Calendar, Outlook, iCloud, Calendly, Cal.com, Square",
  },
  {
    kind: "internal",
    label: "Internal Trowel calendar",
    status: "fallback",
    priority: 3,
    description: "Keep shifts, blocked time, PTO, jobs, emergency holds, service areas, and travel buffers when no system exists.",
    examples: "Shifts, PTO, blocked time, emergency holds",
  },
  {
    kind: "manual_approval",
    label: "Manual approval mode",
    status: "approval_required",
    priority: 4,
    description: "Hold the request and ask owner or dispatcher when sync, payment, availability, or risk is uncertain.",
    examples: "Owner approval, dispatcher approval, callback",
  },
];

export const availabilityWindows: AvailabilityWindow[] = [
  {
    id: "diego-today-emergency",
    technicianId: "diego-r",
    label: "Emergency hold now",
    start: "Now",
    end: "90 min",
    sourceKind: "internal",
    confidence: 91,
    emergency: true,
    notes: ["Emergency slot protected", "Oakland route buffer clear", "Owner approval still required"],
  },
  {
    id: "diego-fri-morning",
    technicianId: "diego-r",
    label: "Fri 10:00 AM - 12:00 PM",
    start: "Fri 10:00 AM",
    end: "Fri 12:00 PM",
    sourceKind: "calendar",
    confidence: 94,
    emergency: false,
    notes: ["Google calendar free", "Drive buffer protected", "Membership continuity fit"],
  },
  {
    id: "sam-after-current-job",
    technicianId: "sam-k",
    label: "After 1:15 PM",
    start: "Today 1:15 PM",
    end: "Today 3:00 PM",
    sourceKind: "calendar",
    confidence: 76,
    emergency: true,
    notes: ["Currently on job", "Can dispatch after blocked time", "High workload warning"],
  },
  {
    id: "marcus-tomorrow",
    technicianId: "marcus-l",
    label: "Tomorrow 7:00 AM - 9:00 AM",
    start: "Tomorrow 7:00 AM",
    end: "Tomorrow 9:00 AM",
    sourceKind: "internal",
    confidence: 66,
    emergency: false,
    notes: ["Internal calendar fallback", "Off duty today", "Electrical and appliance only"],
  },
];

export function getActiveScheduleSource() {
  return scheduleSources.find((source) => source.status === "live") ?? scheduleSources[2];
}

export function getFallbackSources() {
  return scheduleSources.filter((source) => source.kind !== getActiveScheduleSource().kind);
}

export function getScheduleSource(kind: ScheduleSourceKind) {
  return scheduleSources.find((source) => source.kind === kind) ?? scheduleSources[3];
}

export function getWindowsForTechnician(technicianId: string) {
  return availabilityWindows.filter((window) => window.technicianId === technicianId);
}

export function getBestWindowForTechnician(technicianId: string, emergency = false) {
  const windows = getWindowsForTechnician(technicianId)
    .filter((window) => !emergency || window.emergency)
    .sort((a, b) => b.confidence - a.confidence);

  return windows[0];
}

export function assessScheduledJob(job: ScheduledJob): SchedulingAssessment {
  const technician = technicians.find((tech) => tech.id === job.technicianId);
  const window = getBestWindowForTechnician(job.technicianId, job.emergency);
  const source = getScheduleSource(window?.sourceKind ?? "manual_approval");
  const conflicts = technician ? detectConflicts(technician, job.trade, job.serviceArea, job.emergency) : ["Technician record missing"];
  const approvalReasons = getApprovalReasons(source, conflicts, job.emergency, technician?.status);
  const decision = approvalReasons.length > 0 || job.status === "held" ? "hold_for_approval" : "book";

  return {
    source,
    decision,
    confidence: window?.confidence ?? 40,
    technician,
    window,
    conflicts,
    approvalReasons,
    safeNextAction: decision === "book" ? "Book appointment and sync to source calendar." : "Hold the job and ask owner or dispatcher to approve.",
  };
}

export function assessDispatchEvent(event: DispatchEvent): SchedulingAssessment {
  const ranked = technicians
    .map((technician) => {
      const conflicts = detectConflicts(technician, event.trade, event.serviceArea, true);
      const window = getBestWindowForTechnician(technician.id, true);
      const source = getScheduleSource(window?.sourceKind ?? "manual_approval");
      const approvalReasons = getApprovalReasons(source, conflicts, true, technician.status);
      const confidence = Math.max(0, (window?.confidence ?? 35) - approvalReasons.length * 8 - conflicts.length * 5);
      return { technician, window, source, conflicts, approvalReasons, confidence };
    })
    .sort((a, b) => b.confidence - a.confidence);

  const best = ranked[0];
  const paymentNeedsApproval = event.payment.status === "pending";
  const approvalReasons = paymentNeedsApproval ? [...best.approvalReasons, "Payment rule needs owner approval"] : best.approvalReasons;
  const decision: BookingDecision = approvalReasons.length > 0 ? "hold_for_approval" : "book";

  return {
    source: best.source,
    decision,
    confidence: best.confidence,
    technician: best.technician,
    window: best.window,
    conflicts: best.conflicts,
    approvalReasons,
    safeNextAction: decision === "book" ? "Approve dispatch and notify technician." : "Keep emergency slot held and request owner or dispatcher approval.",
  };
}

export function getSchedulingSummary() {
  const assessments = scheduledJobs.map(assessScheduledJob);
  const dispatchAssessments = dispatchEvents.map(assessDispatchEvent);
  return {
    source: getActiveScheduleSource(),
    connectedSources: scheduleSources.filter((source) => source.status === "live" || source.status === "limited").length,
    internalFallbackReady: scheduleSources.some((source) => source.kind === "internal" && source.status === "fallback"),
    openWindows: availabilityWindows.length,
    conflicts: assessments.reduce((sum, item) => sum + item.conflicts.length, 0),
    approvals: [...assessments, ...dispatchAssessments].filter((item) => item.decision === "hold_for_approval").length,
  };
}

function detectConflicts(technician: Technician, trade: Trade, serviceArea: string, emergency: boolean) {
  const conflicts: string[] = [];

  if (!technician.trades.includes(trade)) conflicts.push(`${tradeLabel(trade)} trade mismatch`);
  if (!technician.serviceAreas.includes(serviceArea)) conflicts.push("Outside usual service area");
  if (technician.status === "off_duty" || technician.status === "pto") conflicts.push(statusLabel(technician.status));
  if (technician.status === "on_job") conflicts.push(`Current job blocks schedule until ${technician.blockedUntil}`);
  if (emergency && !technician.emergencyEligible) conflicts.push("Not emergency eligible");
  if (technician.activeJobs >= 3) conflicts.push("High job load");

  return conflicts;
}

function getApprovalReasons(source: ScheduleSource, conflicts: string[], emergency: boolean, status?: TechnicianStatus) {
  const reasons: string[] = [];
  if (source.status !== "live" && source.kind !== "internal") reasons.push(`${source.label} is not fully live`);
  if (conflicts.length > 0) reasons.push("Scheduling conflict requires review");
  if (emergency) reasons.push("Emergency dispatch approval required");
  if (status === "off_duty" || status === "pto") reasons.push("Technician is not currently on shift");
  return [...new Set(reasons)];
}

function statusLabel(status: TechnicianStatus) {
  if (status === "on_job") return "On job";
  if (status === "off_duty") return "Off duty";
  if (status === "pto") return "PTO";
  return "Available";
}
