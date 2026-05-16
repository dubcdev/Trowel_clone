import { customers } from "@/lib/customers";
import { dispatchEvents, scheduledJobs, technicians } from "@/lib/operations";
import { paymentRequests } from "@/lib/payments";
import { conversations, getVoiceSmsSummary } from "@/lib/voice-sms";
import { getDispatchEtaSummary } from "@/lib/eta";
import { getGoLiveSteps, getOnboardingSummary, onboardingCards } from "@/lib/onboarding";
import { getPhoneProvisioningSummary } from "@/lib/phone-provisioning";
import { getEnrichmentSummary } from "@/lib/enrichment";
import { getPersistenceStatus, repositoryPortStatuses, selectRepository } from "@/lib/persistence";
import { getSeedSummary } from "@/lib/seed-data";
import { createUnavailableDatabaseClient, getPostgresConfig } from "@/lib/postgres";
import { createPostgresTenantRepositories } from "@/lib/postgres-repositories";
import { Permission, UserSession, can, canViewCustomer, canViewJob } from "@/lib/rbac";

export type ApiMethod = "GET" | "POST" | "PATCH" | "DELETE";
export type ApiStatus = "contract_ready" | "mock_backed" | "database_pending" | "live";
export type AuditSeverity = "info" | "sensitive" | "security";

export type ApiEndpointContract = {
  id: string;
  method: ApiMethod;
  path: string;
  permission: Permission;
  status: ApiStatus;
  description: string;
};

export type AuditLogDraft = {
  businessId: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  severity: AuditSeverity;
  metadata?: Record<string, string | number | boolean>;
};

export type TenantRepositoryResult<T> = {
  data: T;
  audit?: AuditLogDraft;
};

export type BackendReadiness = {
  apiContracts: number;
  mockBackedContracts: number;
  databaseTables: number;
  tenantGuardedReads: number;
  writeActionsAudited: number;
  repositoryMode: string;
  repositoryPorts: number;
  seedRecords: number;
  databaseReady: boolean;
  nextStep: string;
};

export const databaseTables = [
  "businesses",
  "business_locations",
  "users",
  "business_memberships",
  "role_permissions",
  "customers",
  "customer_memory",
  "issue_history",
  "equipment_history",
  "repeat_issue_flags",
  "calls",
  "conversations",
  "conversation_messages",
  "uploaded_photos",
  "ai_summaries",
  "jobs",
  "appointments",
  "technicians",
  "technician_availability",
  "technician_assignments",
  "dispatch_events",
  "dispatch_approvals",
  "calendar_providers",
  "calendars",
  "sync_events",
  "sync_failures",
  "payment_accounts",
  "payment_requests",
  "payment_events",
  "platform_customers",
  "platform_subscriptions",
  "platform_invoices",
  "entitlement_states",
  "connected_accounts",
  "contractor_invoices",
  "contractor_payment_links",
  "contractor_payments",
  "contractor_refunds",
  "job_payment_status",
  "twilio_numbers",
  "a2p_registrations",
  "notifications",
  "notification_preferences",
  "notification_delivery_events",
  "operational_audit_logs",
] as const;

export const apiEndpointContracts: ApiEndpointContract[] = [
  {
    id: "api-me",
    method: "GET",
    path: "/api/me",
    permission: "settings:view",
    status: "mock_backed",
    description: "Existing-customer identity, role, business, and neutral mobile account status.",
  },
  {
    id: "api-me-entitlements",
    method: "GET",
    path: "/api/me/entitlements",
    permission: "settings:view",
    status: "mock_backed",
    description: "Mobile-safe entitlement status. No SaaS pricing, checkout, upgrade, or payment routing.",
  },
  {
    id: "api-business-status",
    method: "GET",
    path: "/api/businesses/:businessId/status",
    permission: "settings:view",
    status: "mock_backed",
    description: "Business readiness, entitlement state, channel state, and Connect status.",
  },
  {
    id: "api-dashboard-snapshot",
    method: "GET",
    path: "/api/mobile/snapshot",
    permission: "settings:view",
    status: "mock_backed",
    description: "Small mobile payload for Today, badges, digest, and readiness counts.",
  },
  {
    id: "api-signup-start",
    method: "POST",
    path: "/api/signup/start",
    permission: "billing:manage_platform",
    status: "contract_ready",
    description: "Web portal signup handoff that creates a pending business and Stripe Checkout session draft.",
  },
  {
    id: "api-platform-checkout-session",
    method: "POST",
    path: "/api/billing/checkout-session",
    permission: "billing:manage_platform",
    status: "contract_ready",
    description: "Web-only Stripe Checkout session for the platform SaaS subscription.",
  },
  {
    id: "api-platform-subscription",
    method: "GET",
    path: "/api/billing/subscription",
    permission: "billing:manage_platform",
    status: "mock_backed",
    description: "Web-only platform subscription and invoice state.",
  },
  {
    id: "api-platform-customer-portal",
    method: "POST",
    path: "/api/billing/customer-portal",
    permission: "billing:manage_platform",
    status: "contract_ready",
    description: "Web-only Stripe customer portal for SaaS billing management.",
  },
  {
    id: "api-stripe-platform-webhook",
    method: "POST",
    path: "/api/webhooks/stripe-platform",
    permission: "admin:platform",
    status: "contract_ready",
    description: "Stripe platform Billing webhook boundary with signature verification requirement.",
  },
  {
    id: "api-connect-onboarding",
    method: "POST",
    path: "/api/connect/onboarding-link",
    permission: "connect:manage",
    status: "contract_ready",
    description: "Web portal Stripe Connect onboarding link for contractor client payments.",
  },
  {
    id: "api-connect-status",
    method: "GET",
    path: "/api/connect/status",
    permission: "payments:view_all",
    status: "mock_backed",
    description: "Connected account readiness for contractor-owned service payments.",
  },
  {
    id: "api-job-invoices",
    method: "POST",
    path: "/api/jobs/:jobId/invoices",
    permission: "payments:send_link",
    status: "contract_ready",
    description: "Creates a contractor service invoice under the connected account. Not SaaS billing.",
  },
  {
    id: "api-job-payment-link",
    method: "POST",
    path: "/api/jobs/:jobId/payment-link",
    permission: "payments:send_link",
    status: "contract_ready",
    description: "Creates a contractor service payment link with zero platform fee for MVP.",
  },
  {
    id: "api-job-payments",
    method: "GET",
    path: "/api/jobs/:jobId/payments",
    permission: "payments:view_assigned",
    status: "mock_backed",
    description: "Reads job-level contractor invoice/payment status for mobile operations.",
  },
  {
    id: "api-stripe-connect-webhook",
    method: "POST",
    path: "/api/webhooks/stripe-connect",
    permission: "admin:platform",
    status: "contract_ready",
    description: "Stripe Connect webhook boundary for contractor invoices, payment links, payments, and refunds.",
  },
  {
    id: "api-twilio-status",
    method: "GET",
    path: "/api/channels/twilio/status",
    permission: "settings:view",
    status: "mock_backed",
    description: "Voice, SMS, A2P, forwarding, and porting status for instant activation.",
  },
  {
    id: "api-twilio-provision",
    method: "POST",
    path: "/api/channels/twilio/provision-number",
    permission: "channels:manage",
    status: "contract_ready",
    description: "Creates contractor Twilio subaccount/AI number setup boundary.",
  },
  {
    id: "api-twilio-a2p-submit",
    method: "POST",
    path: "/api/channels/twilio/a2p/submit",
    permission: "channels:manage",
    status: "contract_ready",
    description: "Submits or prepares A2P/10DLC profile while onboarding continues asynchronously.",
  },
  {
    id: "api-twilio-voice-webhook",
    method: "POST",
    path: "/api/webhooks/twilio/voice",
    permission: "admin:platform",
    status: "contract_ready",
    description: "Twilio Voice webhook boundary for AI receptionist routing.",
  },
  {
    id: "api-twilio-sms-webhook",
    method: "POST",
    path: "/api/webhooks/twilio/sms",
    permission: "admin:platform",
    status: "contract_ready",
    description: "Twilio SMS webhook boundary for AI texting continuity.",
  },
  {
    id: "api-inbox",
    method: "GET",
    path: "/api/inbox",
    permission: "calls:view",
    status: "mock_backed",
    description: "Unified calls/texts/customer conversation inbox for mobile.",
  },
  {
    id: "api-calendar",
    method: "GET",
    path: "/api/calendar",
    permission: "jobs:view_all",
    status: "mock_backed",
    description: "Normalized calendar/availability payload for mobile scheduling views.",
  },
  {
    id: "api-dispatch-assign",
    method: "POST",
    path: "/api/dispatch/:dispatchId/assign",
    permission: "jobs:assign",
    status: "contract_ready",
    description: "Assigns or reassigns dispatch event to technician with audit boundary.",
  },
  {
    id: "api-customers-list",
    method: "GET",
    path: "/api/customers",
    permission: "customers:view_all",
    status: "mock_backed",
    description: "Tenant-scoped customer list with memory risk badges.",
  },
  {
    id: "api-jobs-list",
    method: "GET",
    path: "/api/jobs",
    permission: "jobs:view_all",
    status: "mock_backed",
    description: "Tenant-scoped jobs queue for owner, office, dispatcher, and technician views.",
  },
  {
    id: "api-calls-list",
    method: "GET",
    path: "/api/calls",
    permission: "calls:view",
    status: "mock_backed",
    description: "Tenant-scoped voice/SMS conversation list for mobile call review buckets.",
  },
  {
    id: "api-dispatch-list",
    method: "GET",
    path: "/api/dispatch",
    permission: "dispatch:view",
    status: "mock_backed",
    description: "Emergency dispatch queue with ETA summary and technician recommendation inputs.",
  },
  {
    id: "api-team-list",
    method: "GET",
    path: "/api/team",
    permission: "settings:view",
    status: "mock_backed",
    description: "Technician roster, current status, shifts, service areas, and emergency eligibility.",
  },
  {
    id: "api-onboarding-state",
    method: "GET",
    path: "/api/onboarding",
    permission: "settings:view",
    status: "mock_backed",
    description: "Mobile onboarding state including enriched cards, go-live steps, phone, and enrichment readiness.",
  },
  {
    id: "api-settings-readiness",
    method: "GET",
    path: "/api/settings/readiness",
    permission: "settings:view",
    status: "mock_backed",
    description: "Compact settings payload for backend readiness, API contracts, and production completion.",
  },
  {
    id: "api-job-status",
    method: "PATCH",
    path: "/api/jobs/:jobId/status",
    permission: "jobs:update_status",
    status: "mock_backed",
    description: "Updates route/start/done state and writes appointment status history.",
  },
  {
    id: "api-dispatch-approve",
    method: "POST",
    path: "/api/dispatch/:dispatchId/approve",
    permission: "dispatch:approve",
    status: "mock_backed",
    description: "Approves emergency recommendation, assigns technician, and audits the decision.",
  },
  {
    id: "api-payment-request",
    method: "POST",
    path: "/api/payments/requests",
    permission: "payments:send_link",
    status: "mock_backed",
    description: "Creates approved operational payment request without inventing a price.",
  },
  {
    id: "api-notifications",
    method: "GET",
    path: "/api/notifications",
    permission: "settings:view",
    status: "mock_backed",
    description: "Returns mobile alerts, unread counts, and deep-link destinations.",
  },
  {
    id: "api-audit-log",
    method: "GET",
    path: "/api/audit-log",
    permission: "audit:view",
    status: "mock_backed",
    description: "Owner-only operational audit log for sensitive actions.",
  },
];

export function requireTenantPermission(session: UserSession, businessId: string, permission: Permission) {
  if (session.businessId !== businessId) {
    throw new Error("This user does not belong to the requested business.");
  }

  if (!can(session.role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}

const mockTenantRepositories = {
  getMobileSnapshot(session: UserSession, businessId: string): TenantRepositoryResult<{
    businessId: string;
    counts: { customers: number; technicians: number; jobs: number; dispatchEvents: number; paymentRequests: number };
  }> {
    requireTenantPermission(session, businessId, "settings:view");
    return {
      data: {
        businessId,
        counts: {
          customers: customers.length,
          technicians: technicians.length,
          jobs: scheduledJobs.length,
          dispatchEvents: dispatchEvents.length,
          paymentRequests: paymentRequests.length,
        },
      },
    };
  },

  listCustomers(session: UserSession, businessId: string) {
    requireTenantPermission(session, businessId, session.role === "technician" ? "customers:view_assigned" : "customers:view_all");
    const assignedCustomerIds = scheduledJobs
      .filter((job) => job.technicianId === session.assignedTechnicianId)
      .map((job) => job.customerId);
    return {
      data: customers.filter((customer) => canViewCustomer(session.role, customer.id, assignedCustomerIds)),
    };
  },

  listJobs(session: UserSession, businessId: string) {
    requireTenantPermission(session, businessId, session.role === "technician" ? "jobs:view_assigned" : "jobs:view_all");
    return {
      data: scheduledJobs.filter((job) => canViewJob(session.role, job.technicianId, session.assignedTechnicianId)),
    };
  },

  listCalls(session: UserSession, businessId: string) {
    requireTenantPermission(session, businessId, "calls:view");
    return {
      data: {
        summary: getVoiceSmsSummary(),
        conversations,
      },
    };
  },

  listDispatchEvents(session: UserSession, businessId: string) {
    requireTenantPermission(session, businessId, "dispatch:view");
    return {
      data: {
        summary: getDispatchEtaSummary(),
        dispatchEvents,
        technicians,
      },
    };
  },

  listTeam(session: UserSession, businessId: string) {
    requireTenantPermission(session, businessId, "settings:view");
    return {
      data: {
        technicians,
        counts: {
          total: technicians.length,
          available: technicians.filter((technician) => technician.status === "available").length,
          emergencyEligible: technicians.filter((technician) => technician.emergencyEligible).length,
          onJob: technicians.filter((technician) => technician.status === "on_job").length,
        },
      },
    };
  },

  getOnboardingState(session: UserSession, businessId: string) {
    requireTenantPermission(session, businessId, "settings:view");
    return {
      data: {
        summary: getOnboardingSummary(),
        phone: getPhoneProvisioningSummary(),
        enrichment: getEnrichmentSummary(),
        cards: onboardingCards,
        goLiveSteps: getGoLiveSteps(),
      },
    };
  },

  getSettingsReadiness(session: UserSession, businessId: string) {
    requireTenantPermission(session, businessId, "settings:view");
    return {
      data: {
        backend: getBackendReadiness(),
        persistence: getPersistenceStatus(),
        database: getPostgresConfig(),
        seed: getSeedSummary(),
        repositoryPorts: repositoryPortStatuses,
        endpoints: apiEndpointContracts,
        tables: databaseTables,
      },
    };
  },

  listPaymentRequests(session: UserSession, businessId: string) {
    requireTenantPermission(session, businessId, session.role === "technician" ? "payments:view_assigned" : "payments:view_all");
    if (session.role !== "technician") return { data: paymentRequests };
    const assignedJobIds = scheduledJobs
      .filter((job) => job.technicianId === session.assignedTechnicianId)
      .map((job) => job.id);
    return { data: paymentRequests.filter((request) => request.jobId && assignedJobIds.includes(request.jobId)) };
  },
};

const postgresTenantRepositories = createPostgresTenantRepositories(createUnavailableDatabaseClient());

export const tenantRepositories = selectRepository(mockTenantRepositories, postgresTenantRepositories).implementation;

export function createAuditLog(input: AuditLogDraft): AuditLogDraft {
  return input;
}

export function getBackendReadiness(): BackendReadiness {
  const mockBackedContracts = apiEndpointContracts.filter((endpoint) => endpoint.status === "mock_backed").length;
  const persistence = getPersistenceStatus();
  const seed = getSeedSummary();
  const database = getPostgresConfig();
  return {
    apiContracts: apiEndpointContracts.length,
    mockBackedContracts,
    databaseTables: databaseTables.length,
    tenantGuardedReads: Object.keys(tenantRepositories).length,
    writeActionsAudited: 5,
    repositoryMode: persistence.mode,
    repositoryPorts: persistence.repositoryPorts,
    seedRecords: seed.records,
    databaseReady: database.ready && persistence.configuredMode === "database",
    nextStep: database.ready ? persistence.nextStep : `Configure ${database.missing.join(", ")} before switching repository mode to database.`,
  };
}

export function getBackendApiSummary() {
  return {
    businessId: "business-bayview",
    readiness: getBackendReadiness(),
    persistence: getPersistenceStatus(),
    database: getPostgresConfig(),
    seed: getSeedSummary(),
    repositoryPorts: repositoryPortStatuses,
    endpoints: apiEndpointContracts,
    tables: databaseTables,
  };
}
