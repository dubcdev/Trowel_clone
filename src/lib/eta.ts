import { DispatchEvent, Technician, technicians } from "@/lib/operations";

export type LocationSource = "technician_app" | "current_job" | "last_known" | "home_base" | "manual";
export type RoutingProvider = "google_maps" | "mapbox" | "internal_estimate";
export type EtaStatus = "available_now" | "after_current_job" | "off_duty" | "not_emergency_eligible" | "unknown";

export type TechnicianLocation = {
  technicianId: string;
  label: string;
  source: LocationSource;
  lastSeen: string;
  confidence: number;
};

export type EtaEstimate = {
  technician: Technician;
  status: EtaStatus;
  display: string;
  arrivalMinutes?: number;
  driveMinutes: number;
  currentJobDelayMinutes: number;
  wrapUpBufferMinutes: number;
  dispatchBufferMinutes: number;
  confidence: number;
  source: LocationSource;
  provider: RoutingProvider;
  freshness: string;
  recommended: boolean;
  reasons: string[];
  warnings: string[];
};

export type DispatchActionPlan = {
  eventId: string;
  recommendedTechnicianId: string;
  eta: EtaEstimate;
  approvalRequired: boolean;
  assignmentStatus: "ready_to_dispatch" | "hold_for_approval" | "not_recommended";
  nextAction: string;
  auditSummary: string;
};

export const technicianLocations: TechnicianLocation[] = [
  {
    technicianId: "diego-r",
    label: "Hayward mobile app ping",
    source: "technician_app",
    lastSeen: "2 min ago",
    confidence: 94,
  },
  {
    technicianId: "sam-k",
    label: "Lily Park current job",
    source: "current_job",
    lastSeen: "8 min ago",
    confidence: 88,
  },
  {
    technicianId: "marcus-l",
    label: "Union City home base",
    source: "home_base",
    lastSeen: "Off duty",
    confidence: 62,
  },
];

export function estimateEta(technician: Technician, event: DispatchEvent): EtaEstimate {
  const location = technicianLocations.find((item) => item.technicianId === technician.id) ?? fallbackLocation(technician);
  const driveMinutes = technician.driveMinutesByZone[event.serviceArea] ?? 60;
  const currentJobDelayMinutes = technician.status === "on_job" ? minutesUntilAvailable(technician.blockedUntil) : 0;
  const wrapUpBufferMinutes = technician.status === "on_job" ? 12 : technician.status === "available" ? 5 : 0;
  const dispatchBufferMinutes = event.urgency === "Critical" ? 5 : 10;
  const canDispatch = technician.status === "available" || technician.status === "on_job";
  const emergencyBlocked = event.urgency === "Critical" && !technician.emergencyEligible;
  const offDuty = technician.status === "off_duty" || technician.status === "pto";
  const arrivalMinutes = canDispatch && !emergencyBlocked && !offDuty ? currentJobDelayMinutes + wrapUpBufferMinutes + driveMinutes + dispatchBufferMinutes : undefined;
  const warnings: string[] = [];
  const reasons: string[] = [];

  if (technician.status === "available") reasons.push("Available now");
  if (technician.status === "on_job") warnings.push(`On current job until ${technician.blockedUntil}`);
  if (offDuty) warnings.push("Off duty");
  if (emergencyBlocked) warnings.push("Not emergency eligible");
  if (driveMinutes <= 35) reasons.push("Closest route");
  if (technician.serviceAreas.includes(event.serviceArea)) reasons.push("Service area fit");
  if (technician.trades.includes(event.trade)) reasons.push("Trade fit");
  if (location.confidence < 75) warnings.push("Location confidence is low");

  const status: EtaStatus = offDuty
    ? "off_duty"
    : emergencyBlocked
      ? "not_emergency_eligible"
      : technician.status === "on_job"
        ? "after_current_job"
        : technician.status === "available"
          ? "available_now"
          : "unknown";

  const confidence = Math.max(
    0,
    Math.min(
      99,
      location.confidence
        + (technician.trades.includes(event.trade) ? 6 : -18)
        + (technician.serviceAreas.includes(event.serviceArea) ? 4 : -12)
        + (technician.emergencyEligible ? 4 : -20)
        - (technician.status === "on_job" ? 8 : 0)
        - (driveMinutes > 50 ? 10 : 0),
    ),
  );

  return {
    technician,
    status,
    display: formatEta(status, arrivalMinutes, technician.blockedUntil, driveMinutes),
    arrivalMinutes,
    driveMinutes,
    currentJobDelayMinutes,
    wrapUpBufferMinutes,
    dispatchBufferMinutes,
    confidence,
    source: location.source,
    provider: location.source === "technician_app" ? "google_maps" : "internal_estimate",
    freshness: location.lastSeen,
    recommended: false,
    reasons,
    warnings,
  };
}

export function getEtaEstimates(event: DispatchEvent): EtaEstimate[] {
  const estimates = technicians
    .map((technician) => estimateEta(technician, event))
    .sort((a, b) => etaRank(b) - etaRank(a));
  const recommendedId = estimates[0]?.technician.id;

  return estimates.map((estimate) => ({
    ...estimate,
    recommended: estimate.technician.id === recommendedId,
  }));
}

export function getDispatchActionPlan(event: DispatchEvent): DispatchActionPlan {
  const eta = getEtaEstimates(event)[0];
  const approvalRequired = event.urgency === "Critical" || event.payment.status === "pending";
  const assignmentStatus = !eta.arrivalMinutes || eta.warnings.includes("Not emergency eligible")
    ? "not_recommended"
    : approvalRequired
      ? "hold_for_approval"
      : "ready_to_dispatch";

  return {
    eventId: event.id,
    recommendedTechnicianId: eta.technician.id,
    eta,
    approvalRequired,
    assignmentStatus,
    nextAction: assignmentStatus === "ready_to_dispatch"
      ? `Dispatch ${eta.technician.name} and notify customer.`
      : assignmentStatus === "hold_for_approval"
        ? `Hold ${eta.technician.name}'s slot until owner or dispatcher approves.`
        : "Choose another technician or request manual approval.",
    auditSummary: `${eta.technician.name} recommended from ${eta.source.replace("_", " ")} with ${eta.display} and ${eta.confidence}% ETA confidence.`,
  };
}

export function getDispatchEtaSummary() {
  const totalLocations = technicianLocations.length;
  const staleLocations = technicianLocations.filter((location) => location.confidence < 75 || location.source === "home_base").length;
  const liveLocations = technicianLocations.filter((location) => location.source === "technician_app").length;

  return {
    totalLocations,
    liveLocations,
    staleLocations,
    provider: "google_maps" as RoutingProvider,
    fallbackProvider: "internal_estimate" as RoutingProvider,
  };
}

function etaRank(estimate: EtaEstimate) {
  if (!estimate.arrivalMinutes) return estimate.confidence - 200;
  return estimate.confidence - estimate.arrivalMinutes * 0.8 - estimate.warnings.length * 10;
}

function minutesUntilAvailable(blockedUntil?: string) {
  if (!blockedUntil) return 0;
  if (blockedUntil.includes("1:15")) return 45;
  return 30;
}

function formatEta(status: EtaStatus, arrivalMinutes?: number, blockedUntil?: string, driveMinutes?: number) {
  if (status === "off_duty") return "Tomorrow earliest";
  if (status === "not_emergency_eligible") return "Not eligible";
  if (status === "after_current_job") return `After ${blockedUntil ?? "current job"} + ${driveMinutes ?? 0} min drive`;
  if (arrivalMinutes !== undefined) return `${arrivalMinutes} min ETA`;
  return "Manual ETA needed";
}

function fallbackLocation(technician: Technician): TechnicianLocation {
  return {
    technicianId: technician.id,
    label: technician.location,
    source: "last_known",
    lastSeen: "Unknown",
    confidence: 50,
  };
}
