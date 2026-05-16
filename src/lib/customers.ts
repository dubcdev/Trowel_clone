export type CustomerBadge =
  | "VIP"
  | "Maintenance Member"
  | "Repeat Issue"
  | "Repeat Caller"
  | "Previous Escalation"
  | "Emergency History"
  | "New";

export type Sentiment = "positive" | "neutral" | "watch" | "unhappy";

export type TimelineKind =
  | "call"
  | "text"
  | "visit"
  | "estimate"
  | "photo"
  | "note"
  | "escalation";

export type TimelineEvent = {
  id: string;
  kind: TimelineKind;
  when: string;
  title: string;
  detail?: string;
  technician?: string;
  sentiment?: Sentiment;
};

export type Equipment = {
  label: string;
  meta: string;
};

export type MemoryScore = {
  repeatIssue: number;
  callbackRisk: number;
  frustration: number;
  unresolved: number;
};

export type Customer = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  address: string;
  city: string;
  serviceAddress: string;
  communicationPreference: "SMS" | "Call" | "Either";
  prefersText: boolean;
  sinceYear: number;
  jobsCount: number;
  lifetimeValue: string;
  lastInteraction: string;
  sentiment: Sentiment;
  badges: CustomerBadge[];
  preferredTech?: string;
  membershipStatus: "Member" | "None" | "VIP";
  recurringIssue?: string;
  unresolved?: string;
  activeJob?: string;
  nextBestAction: string;
  dispatchNote: string;
  aiMemoryHints: string[];
  memoryScores: MemoryScore;
  equipment: Equipment[];
  timeline: TimelineEvent[];
};

export const customers: Customer[] = [
  {
    id: "angela-brooks",
    name: "Angela Brooks",
    initials: "AB",
    phone: "(510) 555-0142",
    address: "1284 Birch Lane",
    city: "Oakland, CA 94606",
    serviceAddress: "1284 Birch Lane, Oakland, CA 94606",
    communicationPreference: "SMS",
    prefersText: true,
    sinceYear: 2022,
    jobsCount: 6,
    lifetimeValue: "$3,910",
    lastInteraction: "4 min ago - emergency call",
    sentiment: "watch",
    badges: ["Repeat Issue", "Repeat Caller", "Emergency History"],
    preferredTech: "Diego R.",
    membershipStatus: "None",
    recurringIssue: "Kitchen sink leak reported 3 times in 45 days",
    unresolved: "April leak follow-up was never closed",
    activeJob: "Burst pipe emergency - dispatch approval pending",
    nextBestAction: "Approve emergency dispatch and attach April leak notes",
    dispatchNote: "Customer shut off water. Photos requested by SMS. Emergency slot is held, not booked.",
    aiMemoryHints: [
      "I see we helped with a leak in April. Is this in the same area?",
      "I have your shutoff status noted and will flag this as a repeat issue for the dispatcher.",
    ],
    memoryScores: { repeatIssue: 92, callbackRisk: 82, frustration: 61, unresolved: 88 },
    equipment: [
      { label: "Kitchen sink supply line", meta: "Leak reported Apr 12 and Apr 28 - no closure note" },
      { label: "Bradford White water heater", meta: "Installed Mar 2022 - 3 visits" },
    ],
    timeline: [
      { id: "t1", kind: "call", when: "Today - 9:41 AM", title: "Burst pipe emergency", detail: "AI confirmed shutoff, gathered address, requested photos, and held emergency slot.", sentiment: "watch" },
      { id: "t2", kind: "photo", when: "Today - 9:45 AM", title: "Customer photo uploaded", detail: "Under-sink photo attached for dispatcher and technician." },
      { id: "t3", kind: "visit", when: "Apr 28 - Diego R.", title: "Kitchen leak inspection", detail: "Technician noted slow drip. Follow-up task was not closed.", technician: "Diego R.", sentiment: "neutral" },
      { id: "t4", kind: "call", when: "Apr 12 - 11:18 AM", title: "First leak report", detail: "Customer asked if the same tech could return.", sentiment: "watch" },
    ],
  },
  {
    id: "tom-reilly",
    name: "Tom Reilly",
    initials: "TR",
    phone: "(510) 555-0188",
    address: "42 Ocean View Dr",
    city: "Newark, CA 94560",
    serviceAddress: "42 Ocean View Dr, Newark, CA 94560",
    communicationPreference: "Call",
    prefersText: false,
    sinceYear: 2021,
    jobsCount: 9,
    lifetimeValue: "$7,240",
    lastInteraction: "Yesterday - escalation",
    sentiment: "unhappy",
    badges: ["Previous Escalation", "Maintenance Member", "Repeat Caller"],
    preferredTech: "Sam K.",
    membershipStatus: "Member",
    recurringIssue: "Furnace short-cycling reported 4 times this season",
    unresolved: "Refund request waiting on owner review",
    activeJob: "Warranty/payment question - low-confidence escalation",
    nextBestAction: "Owner should review invoice #2418 before AI replies",
    dispatchNote: "Do not quote warranty policy. Customer sentiment is declining.",
    aiMemoryHints: [
      "I see Sam was out Monday. I can flag this for the owner before we discuss the invoice.",
      "I do not want to guess on warranty coverage, so I will have our office confirm it.",
    ],
    memoryScores: { repeatIssue: 78, callbackRisk: 86, frustration: 91, unresolved: 93 },
    equipment: [
      { label: "Carrier 80k BTU furnace", meta: "Installed 2019 - 5 visits - short-cycling pattern" },
    ],
    timeline: [
      { id: "t1", kind: "escalation", when: "Yesterday - 4:12 PM", title: "Refund request - invoice #2418", detail: "Customer unhappy with diagnostic charge. AI flagged for owner.", sentiment: "unhappy" },
      { id: "t2", kind: "visit", when: "Mon - Sam K.", title: "Furnace inspection", detail: "No fault found. Customer disputed $129 charge.", technician: "Sam K.", sentiment: "watch" },
      { id: "t3", kind: "call", when: "May 2", title: "Furnace short-cycling again", detail: "Fourth report this season. Callback risk increased.", sentiment: "watch" },
      { id: "t4", kind: "visit", when: "Feb 18 - Sam K.", title: "Annual maintenance", technician: "Sam K.", sentiment: "positive" },
    ],
  },
  {
    id: "erica-patel",
    name: "Erica Patel",
    initials: "EP",
    phone: "(510) 555-0173",
    address: "88 Magnolia Ct",
    city: "Fremont, CA 94538",
    serviceAddress: "88 Magnolia Ct, Fremont, CA 94538",
    communicationPreference: "SMS",
    prefersText: true,
    sinceYear: 2023,
    jobsCount: 3,
    lifetimeValue: "$1,140",
    lastInteraction: "Today - booked",
    sentiment: "positive",
    badges: ["Maintenance Member"],
    preferredTech: "Diego M.",
    membershipStatus: "Member",
    activeJob: "AC tune-up - Friday 10 AM",
    nextBestAction: "Keep Diego assigned for continuity",
    dispatchNote: "Morning windows preferred. Payment collected.",
    aiMemoryHints: ["Welcome back, Erica. Friday morning with Diego is available again."],
    memoryScores: { repeatIssue: 8, callbackRisk: 12, frustration: 6, unresolved: 0 },
    equipment: [{ label: "Trane 3-ton AC", meta: "Tuned Oct 2024 - membership maintenance" }],
    timeline: [
      { id: "t1", kind: "call", when: "Today - 9:18 AM", title: "Booked AC tune-up", detail: "Friday 10:00 AM with Diego. Deposit collected.", sentiment: "positive" },
      { id: "t2", kind: "visit", when: "Oct 11 - Diego M.", title: "Fall AC tune-up", technician: "Diego M.", sentiment: "positive" },
    ],
  },
  {
    id: "daniel-wu",
    name: "Daniel Wu",
    initials: "DW",
    phone: "(510) 555-0119",
    address: "655 Pine Hill Rd",
    city: "Union City, CA 94587",
    serviceAddress: "655 Pine Hill Rd, Union City, CA 94587",
    communicationPreference: "Call",
    prefersText: false,
    sinceYear: 2024,
    jobsCount: 1,
    lifetimeValue: "$0",
    lastInteraction: "Today - safety follow-up",
    sentiment: "neutral",
    badges: ["New"],
    membershipStatus: "None",
    activeJob: "Electrical panel concern - dispatcher review",
    nextBestAction: "Dispatcher should confirm panel safety before booking",
    dispatchNote: "AI detected possible electrical hazard and avoided diagnosis.",
    aiMemoryHints: ["I have your breaker concern noted and will have our dispatcher confirm the safest next step."],
    memoryScores: { repeatIssue: 0, callbackRisk: 24, frustration: 12, unresolved: 31 },
    equipment: [],
    timeline: [
      { id: "t1", kind: "call", when: "Today - 8:52 AM", title: "Breaker issue intake", detail: "AI escalated possible panel risk instead of offering unsafe troubleshooting." },
      { id: "t2", kind: "text", when: "Today - 8:55 AM", title: "Photo request sent", detail: "Customer asked to send panel photo if safe to do so." },
    ],
  },
  {
    id: "lily-park",
    name: "Lily Park",
    initials: "LP",
    phone: "(510) 555-0211",
    address: "12 Redwood Pl",
    city: "Fremont, CA 94539",
    serviceAddress: "12 Redwood Pl, Fremont, CA 94539",
    communicationPreference: "SMS",
    prefersText: true,
    sinceYear: 2020,
    jobsCount: 14,
    lifetimeValue: "$11,820",
    lastInteraction: "Yesterday - rescheduled",
    sentiment: "positive",
    badges: ["VIP", "Maintenance Member"],
    preferredTech: "Sam K.",
    membershipStatus: "VIP",
    activeJob: "Drain cleaning - Thursday 1 PM",
    nextBestAction: "Preserve Sam continuity and VIP priority",
    dispatchNote: "High-value customer. Avoid moving appointment without approval.",
    aiMemoryHints: ["Hi Lily. I can keep Sam assigned and move the drain cleaning to Thursday at 1 PM."],
    memoryScores: { repeatIssue: 18, callbackRisk: 9, frustration: 4, unresolved: 0 },
    equipment: [{ label: "Whole-home water filtration", meta: "Installed 2020 - 6 visits - VIP plan" }],
    timeline: [
      { id: "t1", kind: "text", when: "Yesterday", title: "Rescheduled drain cleaning", detail: "Moved to Thursday 1 PM with Sam.", sentiment: "positive" },
      { id: "t2", kind: "visit", when: "Mar 4 - Sam K.", title: "Filtration system service", technician: "Sam K.", sentiment: "positive" },
    ],
  },
  {
    id: "carlos-mendez",
    name: "Carlos Mendez",
    initials: "CM",
    phone: "(510) 555-0260",
    address: "901 Sycamore St",
    city: "San Leandro, CA 94577",
    serviceAddress: "901 Sycamore St, San Leandro, CA 94577",
    communicationPreference: "Call",
    prefersText: false,
    sinceYear: 2025,
    jobsCount: 0,
    lifetimeValue: "$0",
    lastInteraction: "11:42 PM - captured",
    sentiment: "neutral",
    badges: ["New", "Emergency History"],
    membershipStatus: "None",
    activeJob: "Roof leak - emergency tarp morning window",
    nextBestAction: "Confirm tarp window and collect photos",
    dispatchNote: "After-hours lead captured. Insurance concern noted.",
    aiMemoryHints: ["Calling back about the roof leak you reported overnight. I can help confirm the emergency tarp window."],
    memoryScores: { repeatIssue: 0, callbackRisk: 33, frustration: 18, unresolved: 47 },
    equipment: [],
    timeline: [
      { id: "t1", kind: "call", when: "Yesterday - 11:42 PM", title: "After-hours roof leak", detail: "AI gathered details and booked morning emergency tarp window." },
    ],
  },
];

export function getCustomer(id: string) {
  return customers.find((c) => c.id === id);
}

export const repeatIssueCustomers = customers.filter((c) =>
  c.badges.some((b) => b === "Repeat Issue" || b === "Previous Escalation"),
);
