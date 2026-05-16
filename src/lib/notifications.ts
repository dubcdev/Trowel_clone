export type NotificationType =
  | "emergency_call"
  | "angry_customer"
  | "booked_job"
  | "failed_booking"
  | "customer_photo"
  | "technician_conflict"
  | "after_hours_lead"
  | "owner_approval"
  | "low_confidence"
  | "repeat_issue"
  | "payment_collected"
  | "payment_failed"
  | "calendar_sync_failure"
  | "booking_conflict"
  | "daily_digest";

export type NotificationPriority = "urgent" | "important" | "normal";
export type NotificationChannel = "push" | "sms" | "email" | "in_app";
export type NotificationStatus = "queued" | "sent" | "opened" | "actioned" | "failed";
export type NotificationDestination = "/" | "/calls" | "/jobs" | "/dispatch" | "/customers" | "/settings" | "/onboarding";

export type NotificationRecord = {
  id: string;
  businessId: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  createdAt: string;
  destination: NotificationDestination;
  actionLabel: string;
  relatedCustomerId?: string;
  relatedJobId?: string;
  relatedPaymentRequestId?: string;
  requiresHumanAction: boolean;
};

export type NotificationPreference = {
  id: string;
  role: "owner" | "manager" | "dispatcher" | "technician";
  type: NotificationType;
  channels: NotificationChannel[];
  enabled: boolean;
  quietHoursBypass: boolean;
};

export type NotificationDeliveryEvent = {
  id: string;
  notificationId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  at: string;
  detail: string;
};

export type DigestMetric = {
  label: string;
  value: string;
  detail: string;
};

export type DailyDigest = {
  id: string;
  businessId: string;
  title: string;
  period: string;
  generatedAt: string;
  summary: string;
  metrics: DigestMetric[];
  followUps: Array<{
    label: string;
    detail: string;
    destination: NotificationDestination;
  }>;
};

export const notifications: NotificationRecord[] = [
  {
    id: "notif-angela-emergency",
    businessId: "business-bayview",
    type: "emergency_call",
    title: "Burst pipe emergency",
    body: "Repeat customer. Prior unresolved leak found. Diego is recommended.",
    priority: "urgent",
    channels: ["push", "sms", "in_app"],
    status: "sent",
    createdAt: "4 min ago",
    destination: "/dispatch",
    actionLabel: "Review dispatch",
    relatedCustomerId: "angela-brooks",
    relatedJobId: "job-angela-emergency-hold",
    requiresHumanAction: true,
  },
  {
    id: "notif-lily-payment",
    businessId: "business-bayview",
    type: "booking_conflict",
    title: "Current job blocks schedule",
    body: "Lily Park is still active. Trowel held the next slot instead of double-booking.",
    priority: "important",
    channels: ["push", "in_app"],
    status: "sent",
    createdAt: "8 min ago",
    destination: "/jobs",
    actionLabel: "Open jobs",
    relatedCustomerId: "lily-park",
    relatedJobId: "job-lily-drain",
    requiresHumanAction: true,
  },
  {
    id: "notif-erica-paid",
    businessId: "business-bayview",
    type: "payment_collected",
    title: "$50 deposit collected",
    body: "Erica Patel's HVAC appointment is confirmed and marked prepaid.",
    priority: "normal",
    channels: ["push", "in_app"],
    status: "opened",
    createdAt: "27 min ago",
    destination: "/jobs",
    actionLabel: "See job",
    relatedCustomerId: "erica-patel",
    relatedJobId: "job-erica-ac",
    relatedPaymentRequestId: "payreq-erica-deposit",
    requiresHumanAction: false,
  },
  {
    id: "notif-photo-upload",
    businessId: "business-bayview",
    type: "customer_photo",
    title: "Photos received",
    body: "Two under-sink photos were attached to Angela Brooks' emergency call.",
    priority: "important",
    channels: ["in_app"],
    status: "sent",
    createdAt: "29 min ago",
    destination: "/customers",
    actionLabel: "Open customer",
    relatedCustomerId: "angela-brooks",
    requiresHumanAction: false,
  },
  {
    id: "notif-after-hours",
    businessId: "business-bayview",
    type: "after_hours_lead",
    title: "After-hours lead booked",
    body: "Garage door spring call was handled by Trowel and booked for tomorrow morning.",
    priority: "normal",
    channels: ["push", "in_app"],
    status: "opened",
    createdAt: "1 hr ago",
    destination: "/calls",
    actionLabel: "Review call",
    requiresHumanAction: false,
  },
  {
    id: "notif-sms-review",
    businessId: "business-bayview",
    type: "calendar_sync_failure",
    title: "Calendar sync needs attention",
    body: "One external calendar update needs review before Trowel can trust that slot.",
    priority: "important",
    channels: ["push", "in_app"],
    status: "queued",
    createdAt: "2 hr ago",
    destination: "/settings",
    actionLabel: "Check setup",
    requiresHumanAction: true,
  },
];

export const notificationPreferences: NotificationPreference[] = [
  { id: "pref-owner-emergency", role: "owner", type: "emergency_call", channels: ["push", "sms"], enabled: true, quietHoursBypass: true },
  { id: "pref-dispatch-emergency", role: "dispatcher", type: "emergency_call", channels: ["push", "sms"], enabled: true, quietHoursBypass: true },
  { id: "pref-owner-payments", role: "owner", type: "payment_collected", channels: ["push"], enabled: true, quietHoursBypass: false },
  { id: "pref-manager-conflicts", role: "manager", type: "booking_conflict", channels: ["push"], enabled: true, quietHoursBypass: true },
  { id: "pref-tech-jobs", role: "technician", type: "booked_job", channels: ["push"], enabled: true, quietHoursBypass: false },
];

export const notificationDeliveryEvents: NotificationDeliveryEvent[] = [
  { id: "delivery-angela-push", notificationId: "notif-angela-emergency", channel: "push", status: "sent", at: "4 min ago", detail: "Push delivered to owner and dispatcher." },
  { id: "delivery-angela-sms", notificationId: "notif-angela-emergency", channel: "sms", status: "sent", at: "4 min ago", detail: "SMS fallback delivered to owner." },
  { id: "delivery-lily-push", notificationId: "notif-lily-payment", channel: "push", status: "sent", at: "8 min ago", detail: "Push delivered to dispatcher." },
  { id: "delivery-sync-queued", notificationId: "notif-sms-review", channel: "push", status: "queued", at: "2 hr ago", detail: "Waiting on notification worker." },
];

export const dailyDigest: DailyDigest = {
  id: "digest-today",
  businessId: "business-bayview",
  title: "Today so far",
  period: "Wednesday, May 13",
  generatedAt: "2:15 PM",
  summary: "Trowel answered every call, booked the safe work, and held risky items for a person to review.",
  metrics: [
    { label: "Calls answered", value: "31", detail: "0 missed calls" },
    { label: "Jobs booked", value: "14", detail: "$6,240 protected" },
    { label: "After-hours", value: "7", detail: "3 became jobs" },
    { label: "Needs OK", value: "3", detail: "1 urgent dispatch" },
  ],
  followUps: [
    { label: "Approve Angela dispatch", detail: "Emergency hold is ready, but not booked.", destination: "/dispatch" },
    { label: "Check Lily job wrap-up", detail: "Current job blocks one later slot.", destination: "/jobs" },
    { label: "Review calendar sync", detail: "One calendar update needs a person.", destination: "/settings" },
  ],
};

export function getNotificationSummary() {
  const unread = notifications.filter((item) => item.status === "sent" || item.status === "queued").length;
  const urgent = notifications.filter((item) => item.priority === "urgent").length;
  const actionNeeded = notifications.filter((item) => item.requiresHumanAction).length;
  const failedDeliveries = notificationDeliveryEvents.filter((event) => event.status === "failed").length;

  return {
    total: notifications.length,
    unread,
    urgent,
    actionNeeded,
    failedDeliveries,
    digestReady: true,
  };
}

export function getActionNotifications() {
  const priorityItems = getPriorityActionItems().map((item) => ({
    id: item.id,
    businessId: "business-bayview",
    type: item.type === "dispatch" ? "emergency_call" as const :
      item.type === "job" ? "booking_conflict" as const :
      item.type === "payment" ? "owner_approval" as const :
      item.type === "setup" ? "calendar_sync_failure" as const :
      "low_confidence" as const,
    title: item.title,
    body: item.detail,
    priority: item.priority === "important" ? "important" as const : item.priority === "urgent" ? "urgent" as const : "normal" as const,
    channels: ["in_app"] as NotificationChannel[],
    status: "sent" as const,
    createdAt: item.createdAt,
    destination: (item.destination === "/notifications" ? "/" : item.destination) as NotificationDestination,
    actionLabel: item.actionLabel,
    relatedCustomerId: item.relatedCustomerId,
    relatedJobId: item.relatedJobId,
    requiresHumanAction: item.priority !== "normal",
  }));

  const seen = new Set(priorityItems.map((item) => `${item.type}:${item.relatedJobId ?? item.relatedCustomerId ?? item.title}`));
  const notificationItems = notifications.filter((item) => {
    const key = `${item.type}:${item.relatedJobId ?? item.relatedCustomerId ?? item.title}`;
    return (item.requiresHumanAction || item.priority === "urgent") && !seen.has(key);
  });

  return [...priorityItems, ...notificationItems]
    .filter((item) => item.requiresHumanAction || item.priority !== "normal")
    .sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
}

export function getRecentNotifications(limit = 5) {
  return notifications.slice(0, limit);
}

export function getDailyDigest() {
  return dailyDigest;
}

function priorityWeight(priority: NotificationPriority) {
  if (priority === "urgent") return 3;
  if (priority === "important") return 2;
  return 1;
}
import { getPriorityActionItems } from "@/lib/priority-work";
