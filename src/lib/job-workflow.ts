import { ScheduledJob, Technician, scheduledJobs, technicians } from "@/lib/operations";
import { AvailabilityWindow, ScheduleSourceKind, assessScheduledJob, availabilityWindows, getScheduleSource } from "@/lib/scheduling";

export type JobStatus = ScheduledJob["status"];
export type JobTransitionAction = "start_route" | "start_job" | "complete_job" | "hold_for_approval" | "reschedule" | "cancel";
export type HoldStatus = "available" | "held" | "blocked" | "requires_approval";
export type ProviderCapability = "read_availability" | "create_hold" | "book_appointment" | "reschedule" | "cancel" | "webhook_sync";

export type BookingHold = {
  id: string;
  businessId: string;
  jobId: string;
  technicianId: string;
  windowId: string;
  status: HoldStatus;
  expiresAt: string;
  sourceKind: ScheduleSourceKind;
  conflicts: string[];
  approvalRequired: boolean;
  auditSummary: string;
};

export type JobTransition = {
  action: JobTransitionAction;
  label: string;
  allowed: boolean;
  nextStatus: JobStatus;
  reason: string;
};

export type CalendarProviderAdapter = {
  id: string;
  label: string;
  sourceKind: Extract<ScheduleSourceKind, "field_service" | "calendar" | "internal">;
  capabilities: ProviderCapability[];
  syncStatus: "not_connected" | "connected" | "limited" | "failing";
  sourceOfTruth: boolean;
  nextBackendStep: string;
};

export type InternalCalendarState = {
  shifts: number;
  openWindows: number;
  blockedWindows: number;
  emergencyHolds: number;
  fallbackReady: boolean;
};

export const providerAdapters: CalendarProviderAdapter[] = [
  {
    id: "servicetitan",
    label: "ServiceTitan / field-service adapter",
    sourceKind: "field_service",
    capabilities: ["read_availability", "create_hold", "book_appointment", "reschedule", "cancel", "webhook_sync"],
    syncStatus: "limited",
    sourceOfTruth: true,
    nextBackendStep: "Implement OAuth/API credential storage, availability reads, hold creation, booking writes, and webhook reconciliation.",
  },
  {
    id: "google-calendar",
    label: "Google Calendar adapter",
    sourceKind: "calendar",
    capabilities: ["read_availability", "create_hold", "book_appointment", "reschedule", "cancel", "webhook_sync"],
    syncStatus: "connected",
    sourceOfTruth: true,
    nextBackendStep: "Replace seeded availability with Google freebusy, event write, watch channels, and sync failure tracking.",
  },
  {
    id: "trowel-internal",
    label: "Internal Trowel calendar",
    sourceKind: "internal",
    capabilities: ["read_availability", "create_hold", "book_appointment", "reschedule", "cancel"],
    syncStatus: "connected",
    sourceOfTruth: false,
    nextBackendStep: "Persist shifts, blocked time, PTO, emergency holds, drive buffers, and technician assignments.",
  },
];

export function getInternalCalendarState(): InternalCalendarState {
  return {
    shifts: technicians.length,
    openWindows: availabilityWindows.length,
    blockedWindows: technicians.filter((tech) => tech.status === "on_job" || tech.status === "off_duty" || tech.status === "pto").length,
    emergencyHolds: scheduledJobs.filter((job) => job.emergency && job.status === "held").length,
    fallbackReady: true,
  };
}

export function createBookingHold(job: ScheduledJob): BookingHold {
  const assessment = assessScheduledJob(job);
  const window = assessment.window ?? fallbackWindow(job.technicianId);
  const source = getScheduleSource(window.sourceKind);
  const approvalRequired = assessment.decision !== "book" || job.emergency || job.status === "held";

  return {
    id: `hold-${job.id}`,
    businessId: "business-bayview",
    jobId: job.id,
    technicianId: job.technicianId,
    windowId: window.id,
    status: approvalRequired ? "requires_approval" : "held",
    expiresAt: job.emergency ? "15 min" : "30 min",
    sourceKind: source.kind,
    conflicts: assessment.conflicts,
    approvalRequired,
    auditSummary: approvalRequired
      ? "Hold created but booking requires owner or dispatcher approval."
      : "Hold can be converted to appointment after final customer confirmation.",
  };
}

export function getAllowedJobTransitions(job: ScheduledJob): JobTransition[] {
  const assessment = assessScheduledJob(job);
  const clearToBook = assessment.decision === "book" && job.status !== "held";

  return [
    {
      action: "start_route",
      label: "Start route",
      allowed: job.status === "scheduled" && clearToBook,
      nextStatus: "en_route",
      reason: clearToBook ? "Schedule and technician checks are clear." : "Job is not clear to route yet.",
    },
    {
      action: "start_job",
      label: "Start job",
      allowed: job.status === "en_route" || job.status === "scheduled" || job.status === "in_progress",
      nextStatus: "in_progress",
      reason: "Technician can mark the job in progress from assigned work queue.",
    },
    {
      action: "complete_job",
      label: "Complete",
      allowed: job.status === "in_progress",
      nextStatus: "completed",
      reason: job.status === "in_progress" ? "Active job can be completed after notes/photos." : "Only active jobs can be completed.",
    },
    {
      action: "hold_for_approval",
      label: "Hold",
      allowed: assessment.decision !== "book" || job.emergency,
      nextStatus: "held",
      reason: "Use when availability, emergency, conflict, or payment state is uncertain.",
    },
    {
      action: "reschedule",
      label: "Reschedule",
      allowed: job.status !== "completed",
      nextStatus: "scheduled",
      reason: "Reschedule requires availability check and provider sync.",
    },
    {
      action: "cancel",
      label: "Cancel",
      allowed: job.status !== "completed" && job.status !== "in_progress",
      nextStatus: "completed",
      reason: "Cancellation must write appointment status history and provider sync event.",
    },
  ];
}

export function getPrimaryJobAction(job: ScheduledJob) {
  const transitions = getAllowedJobTransitions(job);
  return transitions.find((transition) => transition.allowed) ?? transitions[0];
}

export function getJobWorkflowSummary() {
  const holds = scheduledJobs.map(createBookingHold);
  const internal = getInternalCalendarState();

  return {
    providerAdapters,
    internal,
    holds,
    activeHolds: holds.filter((hold) => hold.status === "held" || hold.status === "requires_approval").length,
    approvalHolds: holds.filter((hold) => hold.approvalRequired).length,
    transitionCount: scheduledJobs.reduce((sum, job) => sum + getAllowedJobTransitions(job).filter((transition) => transition.allowed).length, 0),
  };
}

function fallbackWindow(technicianId: string): AvailabilityWindow {
  return {
    id: `manual-${technicianId}`,
    technicianId,
    label: "Manual approval window",
    start: "Manual",
    end: "Manual",
    sourceKind: "manual_approval",
    confidence: 40,
    emergency: false,
    notes: ["No provider-confirmed availability. Dispatcher approval required."],
  };
}
