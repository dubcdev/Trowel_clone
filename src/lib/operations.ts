import { Payment } from "@/lib/payments";

export type Trade =
  | "hvac"
  | "plumbing"
  | "electrical"
  | "roofing"
  | "garage-door"
  | "appliance"
  | "restoration"
  | "locksmith"
  | "landscaping"
  | "pest"
  | "pool";

export type TechnicianStatus = "available" | "on_job" | "off_duty" | "pto";

export type Technician = {
  id: string;
  name: string;
  initials: string;
  role: "technician" | "lead technician";
  trades: Trade[];
  serviceAreas: string[];
  status: TechnicianStatus;
  currentJobId?: string;
  shift: { start: string; end: string };
  blockedUntil?: string;
  activeJobs: number;
  emergencyEligible: boolean;
  location: string;
  driveMinutesByZone: Record<string, number>;
};

export type ScheduledJob = {
  id: string;
  customerId: string;
  customer: string;
  technicianId: string;
  trade: Trade;
  title: string;
  serviceArea: string;
  window: string;
  status: "scheduled" | "en_route" | "in_progress" | "completed" | "held";
  emergency: boolean;
  memory: string;
  payment: Payment;
};

export type DispatchEvent = {
  id: string;
  customerId: string;
  customer: string;
  issue: string;
  trade: Trade;
  urgency: "Critical" | "High";
  location: string;
  serviceArea: string;
  distance: string;
  received: string;
  summary: string;
  memory: string;
  repeatIssueScore: number;
  callbackRiskScore: number;
  frustrationScore: number;
  unresolvedScore: number;
  safetyRules: string[];
  payment: Payment;
  photos: string;
};

export type TechnicianRecommendation = {
  technician: Technician;
  eta: string;
  confidence: number;
  reasons: string[];
  blockedReasons: string[];
};

export const technicians: Technician[] = [
  {
    id: "diego-r",
    name: "Diego R.",
    initials: "DR",
    role: "lead technician",
    trades: ["plumbing", "hvac"],
    serviceAreas: ["Oakland", "Hayward", "Fremont"],
    status: "available",
    shift: { start: "7:00 AM", end: "6:00 PM" },
    activeJobs: 2,
    emergencyEligible: true,
    location: "Hayward",
    driveMinutesByZone: { Oakland: 34, Hayward: 18, Fremont: 42, "San Leandro": 39 },
  },
  {
    id: "sam-k",
    name: "Sam K.",
    initials: "SK",
    role: "technician",
    trades: ["roofing", "plumbing"],
    serviceAreas: ["Fremont", "San Leandro", "Oakland"],
    status: "on_job",
    currentJobId: "job-lily-drain",
    blockedUntil: "1:15 PM",
    shift: { start: "8:00 AM", end: "7:00 PM" },
    activeJobs: 3,
    emergencyEligible: true,
    location: "Fremont",
    driveMinutesByZone: { Oakland: 51, Hayward: 44, Fremont: 16, "San Leandro": 48 },
  },
  {
    id: "marcus-l",
    name: "Marcus L.",
    initials: "ML",
    role: "technician",
    trades: ["electrical", "appliance"],
    serviceAreas: ["Hayward", "Union City", "Fremont"],
    status: "off_duty",
    shift: { start: "Tomorrow 7:00 AM", end: "Tomorrow 5:00 PM" },
    activeJobs: 0,
    emergencyEligible: false,
    location: "Union City",
    driveMinutesByZone: { Oakland: 58, Hayward: 24, Fremont: 20, "San Leandro": 45 },
  },
];

export const scheduledJobs: ScheduledJob[] = [
  {
    id: "job-erica-ac",
    customerId: "erica-patel",
    customer: "Erica Patel",
    technicianId: "diego-r",
    trade: "hvac",
    title: "AC tune-up",
    serviceArea: "Fremont",
    window: "Fri 10:00 AM - 12:00 PM",
    status: "scheduled",
    emergency: false,
    memory: "Membership customer. Same technician continuity selected.",
    payment: { status: "deposit_collected", kind: "deposit", amount: 50, detail: "Apple Pay - Today 9:21am", when: "Today 9:21am" },
  },
  {
    id: "job-lily-drain",
    customerId: "lily-park",
    customer: "Lily Park",
    technicianId: "sam-k",
    trade: "plumbing",
    title: "Drain cleaning",
    serviceArea: "Fremont",
    window: "Today 12:00 PM - 1:15 PM",
    status: "in_progress",
    emergency: false,
    memory: "Repeat complaint. AI softened tone and prioritized follow-up.",
    payment: { status: "link_sent", kind: "diagnostic_fee", amount: 89, detail: "SMS link sent - viewed", when: "8 min ago" },
  },
  {
    id: "job-angela-emergency-hold",
    customerId: "angela-brooks",
    customer: "Angela Brooks",
    technicianId: "diego-r",
    trade: "plumbing",
    title: "Burst pipe",
    serviceArea: "Oakland",
    window: "Emergency hold",
    status: "held",
    emergency: true,
    memory: "Repeat leak. Callback risk 82. Prior issue attached.",
    payment: { status: "pending", kind: "emergency_deposit", amount: 150, detail: "Payment rule requires approval", when: "Held 4 min ago" },
  },
];

export const dispatchEvents: DispatchEvent[] = [
  {
    id: "dispatch-angela-burst-pipe",
    customerId: "angela-brooks",
    customer: "Angela Brooks",
    issue: "Burst pipe under kitchen sink",
    trade: "plumbing",
    urgency: "Critical",
    location: "Oakland, 94606",
    serviceArea: "Oakland",
    distance: "8.4 mi",
    received: "4 min ago",
    summary:
      "Customer shut off water, sent under-sink photo, and confirmed active water damage. AI held the emergency slot but did not book until owner approval.",
    memory: "Repeat customer. April kitchen leak follow-up was never closed.",
    repeatIssueScore: 92,
    callbackRiskScore: 82,
    frustrationScore: 61,
    unresolvedScore: 88,
    safetyRules: ["Emergency hold only", "No price invented", "Deposit needs approval"],
    payment: { status: "pending", kind: "emergency_deposit", amount: 150, detail: "Owner approval required before request" },
    photos: "2 photos attached",
  },
  {
    id: "dispatch-carlos-roof-leak",
    customerId: "carlos-mendez",
    customer: "Carlos Mendez",
    issue: "Active roof leak after storm",
    trade: "roofing",
    urgency: "High",
    location: "San Leandro, 94577",
    serviceArea: "San Leandro",
    distance: "11.4 mi",
    received: "12 min ago",
    summary:
      "After-hours caller reported dripping near a ceiling light. AI advised avoiding the area, captured insurance concern, and held a morning tarp window.",
    memory: "New customer. Emergency history created from after-hours call.",
    repeatIssueScore: 0,
    callbackRiskScore: 33,
    frustrationScore: 18,
    unresolvedScore: 47,
    safetyRules: ["Do not inspect electrical risk by phone", "Confirm tarp deposit rule", "Dispatcher approval before booking"],
    payment: { status: "not_requested", kind: "deposit", amount: 0, detail: "Awaiting callback before deposit request" },
    photos: "Photo request sent",
  },
];

export function getTechnicianLoad(technicianId: string) {
  return scheduledJobs.filter((job) => job.technicianId === technicianId && job.status !== "completed").length;
}

export function recommendTechnicianForEmergency(event: DispatchEvent): TechnicianRecommendation {
  const ranked = technicians
    .map((technician) => scoreTechnician(technician, event))
    .sort((a, b) => b.confidence - a.confidence);

  return ranked[0];
}

export function getTechnicianRecommendations(event: DispatchEvent) {
  return technicians
    .map((technician) => scoreTechnician(technician, event))
    .sort((a, b) => b.confidence - a.confidence);
}

function scoreTechnician(technician: Technician, event: DispatchEvent): TechnicianRecommendation {
  const reasons: string[] = [];
  const blockedReasons: string[] = [];
  let score = 35;

  const tradeFit = technician.trades.includes(event.trade);
  if (tradeFit) {
    score += 25;
    reasons.push(`${tradeLabel(event.trade)} fit`);
  } else {
    score -= 22;
    blockedReasons.push("Trade mismatch");
  }

  if (technician.emergencyEligible) {
    score += 12;
    reasons.push("Emergency eligible");
  } else {
    score -= 30;
    blockedReasons.push("Not emergency eligible");
  }

  if (technician.serviceAreas.includes(event.serviceArea)) {
    score += 12;
    reasons.push("Service area clear");
  } else {
    score -= 12;
    blockedReasons.push("Outside usual area");
  }

  if (technician.status === "available") {
    score += 16;
    reasons.push("Available now");
  } else if (technician.status === "on_job") {
    score -= 8;
    blockedReasons.push(`On job until ${technician.blockedUntil}`);
  } else {
    score -= 35;
    blockedReasons.push(statusLabel(technician.status));
  }

  if (technician.id === "diego-r" && event.customerId === "angela-brooks") {
    score += 10;
    reasons.push("Worked prior leak");
  }

  const driveMinutes = technician.driveMinutesByZone[event.serviceArea] ?? 60;
  if (driveMinutes <= 35) {
    score += 10;
    reasons.push("Closest tech");
  } else if (driveMinutes <= 50) {
    score += 3;
    reasons.push("Route buffer protected");
  } else {
    score -= 8;
    blockedReasons.push("Long drive time");
  }

  const load = getTechnicianLoad(technician.id);
  if (load <= 2) {
    score += 5;
    reasons.push("Workload safe");
  } else {
    score -= 6;
    blockedReasons.push("High workload");
  }

  return {
    technician,
    eta: technician.status === "off_duty" || technician.status === "pto" ? "-" : `${driveMinutes} min`,
    confidence: Math.max(0, Math.min(99, score)),
    reasons,
    blockedReasons,
  };
}

export function getDispatchSummary() {
  const available = technicians.filter((tech) => tech.status === "available").length;
  const heldSlots = dispatchEvents.length;
  const approvals = dispatchEvents.filter((event) => event.payment.status === "pending" || event.urgency === "Critical").length;
  return { available, heldSlots, approvals };
}

export function tradeLabel(trade: Trade) {
  return trade
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function statusLabel(status: TechnicianStatus) {
  if (status === "on_job") return "On job";
  if (status === "off_duty") return "Off duty";
  if (status === "pto") return "PTO";
  return "Available";
}
