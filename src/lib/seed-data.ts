import { activeBusiness } from "@/lib/business";
import { customers } from "@/lib/customers";
import { conversations } from "@/lib/voice-sms";
import { dispatchEvents, scheduledJobs, technicians } from "@/lib/operations";
import { notifications, notificationDeliveryEvents } from "@/lib/notifications";
import { paymentEvents, paymentRequests, paymentStatusHistory } from "@/lib/payments";
import { onboardingCards } from "@/lib/onboarding";
import { mockSessions } from "@/lib/rbac";

export type SeedRecord = {
  table: string;
  id: string;
  businessId?: string;
  data: Record<string, unknown>;
};

const businessId = activeBusiness.id;

export const seedRecords: SeedRecord[] = [
  {
    table: "businesses",
    id: activeBusiness.id,
    businessId,
    data: {
      name: activeBusiness.name,
      legal_name: activeBusiness.legalName,
      public_phone: activeBusiness.publicPhone,
      website: activeBusiness.website,
      timezone: activeBusiness.timezone,
      status: activeBusiness.status,
    },
  },
  ...Object.values(mockSessions).map((session) => ({
    table: "users",
    id: session.userId,
    data: {
      auth_provider_user_id: `mock:${session.userId}`,
      name: session.name,
      email: `${session.userId.replace("user-", "")}@example.invalid`,
    },
  })),
  ...Object.values(mockSessions).map((session) => ({
    table: "business_memberships",
    id: `membership-${session.userId}`,
    businessId,
    data: {
      user_id: session.userId,
      role: session.role,
      assigned_technician_id: session.assignedTechnicianId ?? null,
      active: true,
    },
  })),
  ...customers.map((customer) => ({
    table: "customers",
    id: customer.id,
    businessId,
    data: {
      name: customer.name,
      phone: customer.phone,
      service_address: customer.serviceAddress,
      membership_status: customer.membershipStatus,
      preferred_channel: customer.communicationPreference,
      sentiment: customer.sentiment,
      unresolved: Boolean(customer.unresolved),
    },
  })),
  ...customers.map((customer) => ({
    table: "repeat_issue_flags",
    id: `repeat-${customer.id}`,
    businessId,
    data: {
      customer_id: customer.id,
      repeat_issue_flag: customer.memoryScores.repeatIssue >= 50,
      callback_risk_score: customer.memoryScores.callbackRisk,
      customer_frustration_score: customer.memoryScores.frustration,
      unresolved_issue_score: customer.memoryScores.unresolved,
    },
  })),
  ...technicians.map((technician) => ({
    table: "technicians",
    id: technician.id,
    businessId,
    data: {
      name: technician.name,
      role: technician.role,
      trades: technician.trades,
      service_areas: technician.serviceAreas,
      status: technician.status,
      emergency_eligible: technician.emergencyEligible,
      shift: technician.shift,
      current_job_id: technician.currentJobId ?? null,
    },
  })),
  ...scheduledJobs.map((job) => ({
    table: "jobs",
    id: job.id,
    businessId,
    data: {
      customer_id: job.customerId,
      technician_id: job.technicianId,
      trade: job.trade,
      title: job.title,
      service_area: job.serviceArea,
      window_label: job.window,
      status: job.status,
      emergency: job.emergency,
      payment_status: job.payment.status,
    },
  })),
  ...dispatchEvents.map((event) => ({
    table: "dispatch_events",
    id: event.id,
    businessId,
    data: {
      customer_id: event.customerId,
      urgency: event.urgency,
      issue_summary: event.issue,
      service_area: event.serviceArea,
      confidence_score: Math.max(event.repeatIssueScore, event.unresolvedScore),
      repeat_issue_score: event.repeatIssueScore,
      callback_risk_score: event.callbackRiskScore,
      frustration_score: event.frustrationScore,
      unresolved_score: event.unresolvedScore,
    },
  })),
  ...conversations.map((conversation) => ({
    table: "conversations",
    id: conversation.id,
    businessId,
    data: {
      customer_id: conversation.customerId ?? null,
      channel: conversation.channel,
      provider: conversation.provider,
      provider_conversation_id: conversation.providerConversationId,
      status: conversation.status,
      urgency: conversation.urgency,
      confidence: conversation.confidence,
      summary: conversation.summary,
    },
  })),
  ...paymentRequests.map((request) => ({
    table: "payment_requests",
    id: request.id,
    businessId,
    data: {
      customer_id: request.customerId,
      job_id: request.jobId,
      amount_cents: request.amount * 100,
      reason: request.reason,
      status: request.status,
      provider: request.provider,
      provider_payment_id: request.providerPaymentId ?? null,
    },
  })),
  ...paymentEvents.map((event) => ({
    table: "payment_events",
    id: event.id,
    businessId,
    data: {
      payment_request_id: event.paymentRequestId,
      provider_event_id: event.providerEventId ?? null,
      type: event.type,
      payload: {
        at: event.at,
        detail: event.detail,
      },
    },
  })),
  ...paymentStatusHistory.map((event) => ({
    table: "payment_status_history",
    id: event.id,
    businessId,
    data: {
      payment_request_id: event.paymentRequestId,
      from_status: event.from ?? null,
      to_status: event.to,
      actor: event.actor,
      note: event.note,
      occurred_at_label: event.at,
    },
  })),
  ...notifications.map((notification) => ({
    table: "notifications",
    id: notification.id,
    businessId,
    data: {
      type: notification.type,
      title: notification.title,
      body: notification.body,
      priority: notification.priority,
      destination: notification.destination,
      status: notification.status,
    },
  })),
  ...notificationDeliveryEvents.map((event) => ({
    table: "notification_delivery_events",
    id: event.id,
    businessId,
    data: {
      notification_id: event.notificationId,
      channel: event.channel,
      status: event.status,
      detail: `${event.at} - ${event.detail}`,
    },
  })),
  ...onboardingCards.map((card) => ({
    table: "onboarding_confirmations",
    id: card.id,
    businessId,
    data: {
      card_id: card.id,
      status: card.status,
      fields: card.fields,
    },
  })),
];

export function getSeedSummary() {
  const tableCounts = seedRecords.reduce<Record<string, number>>((counts, record) => {
    counts[record.table] = (counts[record.table] ?? 0) + 1;
    return counts;
  }, {});

  return {
    businessId,
    records: seedRecords.length,
    tables: Object.keys(tableCounts).length,
    tableCounts,
    readyForDatabaseLoad: true,
  };
}

export function buildSeedSql(records: SeedRecord[] = seedRecords) {
  const lines = [
    "-- Generated by scripts/export-seed-sql.ts. Review before loading into a real database.",
    "begin;",
    "",
  ];

  for (const record of records) {
    lines.push(...recordToSql(record), "");
  }

  lines.push("commit;", "");
  return lines.join("\n");
}

function recordToSql(record: SeedRecord) {
  const baseColumns = ["id"];
  const baseValues = [record.id];
  const dataColumns = Object.keys(record.data);
  const dataValues = dataColumns.map((column) => record.data[column]);

  if (record.businessId && record.table !== "businesses" && record.table !== "users") {
    baseColumns.push("business_id");
    baseValues.push(record.businessId);
  }

  const columns = [...baseColumns, ...dataColumns];
  const values = [...baseValues, ...dataValues];

  return [
    `insert into ${record.table} (${columns.join(", ")})`,
    `values (${values.map(sqlValue).join(", ")})`,
    "on conflict (id) do nothing;",
  ];
}

function sqlValue(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) {
    if (value.some((item) => typeof item === "object")) {
      return `${quote(JSON.stringify(value))}::jsonb`;
    }
    return `array[${value.map(sqlValue).join(", ")}]`;
  }
  if (typeof value === "object") return `${quote(JSON.stringify(value))}::jsonb`;
  return quote(String(value));
}

function quote(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}
