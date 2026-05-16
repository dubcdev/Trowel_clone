import { customers } from "@/lib/customers";
import { dispatchEvents, scheduledJobs, technicians } from "@/lib/operations";
import { onboardingCards, enrichmentPipeline, getGoLiveSteps, getOnboardingSummary } from "@/lib/onboarding";
import {
  deposits,
  getPaymentWorkflowSummary,
  invoices,
  paymentAccount,
  paymentEvents,
  paymentPolicies,
  paymentRequests,
  paymentStatusHistory,
  paymentsConnected,
  refundEvents,
} from "@/lib/payments";
import {
  contractorConnectedAccount,
  contractorInvoices,
  contractorPaymentLinks,
  contractorPaymentPolicy,
  contractorPayments,
  contractorRefunds,
} from "@/lib/contractor-payments";
import { getEntitlementState, getPlatformBillingSummary, platformBillingPolicy } from "@/lib/platform-billing";
import { availabilityWindows, getSchedulingSummary, scheduleSources } from "@/lib/scheduling";
import { getJobWorkflowSummary } from "@/lib/job-workflow";
import { getDispatchEtaSummary, technicianLocations } from "@/lib/eta";
import { getCustomerMemoryRecords, getCustomerMemorySummary } from "@/lib/customer-memory";
import { conversations, getVoiceSmsSummary, webhookContracts } from "@/lib/voice-sms";
import { a2pComplianceProfile, getA2PComplianceSummary, getPhoneProvisioningSummary, phoneProvisioning, twilioIsvArchitecture } from "@/lib/phone-provisioning";
import {
  getDailyDigest,
  getNotificationSummary,
  notificationDeliveryEvents,
  notificationPreferences,
  notifications,
} from "@/lib/notifications";
import { apiEndpointContracts, databaseTables, getBackendReadiness } from "@/lib/backend";
import { getPersistenceStatus, repositoryPortStatuses } from "@/lib/persistence";
import { getSeedSummary } from "@/lib/seed-data";
import { activeBusiness } from "@/lib/business";
import { getPriorityActionItems, getPriorityWorkSummary } from "@/lib/priority-work";
import {
  enrichmentAuditLogs,
  enrichmentSources,
  escalationRuleDrafts,
  getDemoCallReadiness,
  getEnrichmentSummary,
  intakeProfile,
  onboardingConfirmations,
} from "@/lib/enrichment";

export type DataReadinessArea = {
  id: string;
  label: string;
  status: "mocked" | "modeled" | "wired" | "live";
  nextStep: string;
};

export const dataReadiness: DataReadinessArea[] = [
  {
    id: "business",
    label: "Business profile",
    status: "wired",
    nextStep: "Apply PostgreSQL migrations and connect tenant-scoped repositories to live storage.",
  },
  {
    id: "team",
    label: "Team and roles",
    status: "wired",
    nextStep: "Replace mock sessions with Clerk/Auth0 memberships and enforce permissions in server APIs.",
  },
  {
    id: "customers",
    label: "Customer memory",
    status: "wired",
    nextStep: "Persist customer memory records, context packs, and repeat issue detections into tenant-scoped tables.",
  },
  {
    id: "jobs",
    label: "Jobs and dispatch",
    status: "wired",
    nextStep: "Persist job transitions, appointment status history, dispatch approvals, and assignment APIs.",
  },
  {
    id: "dispatch-eta",
    label: "Dispatch ETA",
    status: "wired",
    nextStep: "Replace seeded location pings with technician app GPS, routing provider responses, and persisted dispatch approval actions.",
  },
  {
    id: "scheduling",
    label: "Scheduling engine",
    status: "wired",
    nextStep: "Replace seeded holds with persisted availability reads, booking holds, conflict checks, and provider sync workers.",
  },
  {
    id: "payments",
    label: "Contractor service payments",
    status: "wired",
    nextStep: "Connect Stripe Connect onboarding, payment links, webhook status updates, and refund events.",
  },
  {
    id: "platform-billing",
    label: "Web-only SaaS billing",
    status: "modeled",
    nextStep: "Connect web portal Stripe Checkout, customer portal, subscription webhooks, and entitlement sync.",
  },
  {
    id: "voice-sms",
    label: "Voice and SMS",
    status: "wired",
    nextStep: "Connect real Twilio Voice/SMS webhooks, realtime voice sessions, recording storage, and outbound message sends.",
  },
  {
    id: "phone-provisioning",
    label: "Phone provisioning",
    status: "wired",
    nextStep: "Connect Twilio subaccount creation, number purchase, webhook configuration, and forwarding verification.",
  },
  {
    id: "sms-compliance",
    label: "SMS compliance",
    status: "wired",
    nextStep: "Submit secondary customer profile, A2P brand, and campaign registration asynchronously without blocking voice go-live.",
  },
  {
    id: "notifications-digest",
    label: "Notifications and digest",
    status: "wired",
    nextStep: "Connect push/SMS/email providers, delivery retries, notification preferences, and opened/actioned tracking.",
  },
  {
    id: "audit-security",
    label: "Audit and security",
    status: "modeled",
    nextStep: "Connect audit log writes, encrypted transcript storage, tenant isolation tests, and data retention controls.",
  },
];

export const appData = {
  business: activeBusiness,
  customers,
  technicians,
  jobs: scheduledJobs,
  dispatchEvents,
  scheduleSources,
  availabilityWindows,
  technicianLocations,
  customerMemoryRecords: getCustomerMemoryRecords(),
  conversations,
  webhookContracts,
  phoneProvisioning,
  twilioIsvArchitecture,
  a2pComplianceProfile,
  enrichmentSources,
  onboardingConfirmations,
  intakeProfile,
  escalationRuleDrafts,
  enrichmentAuditLogs,
  notifications,
  notificationPreferences,
  notificationDeliveryEvents,
  apiEndpointContracts,
  databaseTables,
  paymentPolicies,
  paymentAccount,
  paymentRequests,
  deposits,
  invoices,
  paymentEvents,
  refundEvents,
  paymentStatusHistory,
  contractorPaymentPolicy,
  contractorConnectedAccount,
  contractorInvoices,
  contractorPaymentLinks,
  contractorPayments,
  contractorRefunds,
  platformBillingPolicy,
  onboardingCards,
  enrichmentPipeline,
};

export function getAppSnapshot() {
  const scheduling = getSchedulingSummary();
  const onboarding = getOnboardingSummary();
  const workflow = getJobWorkflowSummary();
  const eta = getDispatchEtaSummary();
  const customerMemory = getCustomerMemorySummary();
  const voiceSms = getVoiceSmsSummary();
  const phone = getPhoneProvisioningSummary();
  const smsCompliance = getA2PComplianceSummary();
  const payments = getPaymentWorkflowSummary();
  const platformBilling = getPlatformBillingSummary();
  const enrichment = getEnrichmentSummary();
  const notificationSummary = getNotificationSummary();
  const dailyDigest = getDailyDigest();
  const backend = getBackendReadiness();
  const persistence = getPersistenceStatus();
  const seed = getSeedSummary();
  const demoCall = getDemoCallReadiness();
  const goLiveSteps = getGoLiveSteps();
  const priorityWork = getPriorityWorkSummary();
  const priorityActions = getPriorityActionItems();
  const openJobs = scheduledJobs.filter((job) => job.status !== "completed");
  const emergencyHolds = scheduledJobs.filter((job) => job.emergency && job.status === "held");
  const unresolvedCustomers = customers.filter((customer) => customer.unresolved);

  return {
    business: activeBusiness,
    counts: {
      customers: customers.length,
      technicians: technicians.length,
      jobs: openJobs.length,
      dispatchEvents: dispatchEvents.length,
      emergencyHolds: emergencyHolds.length,
      unresolvedCustomers: unresolvedCustomers.length,
      onboardingCompletion: onboarding.completion,
      schedulingApprovals: scheduling.approvals,
      callsNeedingReview: priorityWork.callsNeedingReviewCount,
      priorityActions: priorityActions.length,
    },
    priorityWork: {
      callsNeedingReview: priorityWork.callsNeedingReviewCount,
      activeJobs: priorityWork.activeJobsCount,
      urgentCalls: priorityWork.urgentCallsCount,
      paymentApprovals: priorityWork.paymentApprovalCount,
      actionItems: priorityActions,
    },
    readiness: dataReadiness,
    scheduling,
    workflow,
    eta,
    customerMemory,
    voiceSms,
    phone,
    twilioArchitecture: twilioIsvArchitecture,
    smsCompliance,
    payments,
    platformBilling,
    entitlement: getEntitlementState(),
    enrichment,
    notifications: notificationSummary,
    dailyDigest,
    backend,
    persistence,
    seed,
    demoCall,
    onboarding,
    goLiveSteps,
  };
}

export function getProductionCompletion() {
  const weights: Record<DataReadinessArea["status"], number> = {
    mocked: 0.1,
    modeled: 0.25,
    wired: 0.45,
    live: 1,
  };
  const score = dataReadiness.reduce((sum, area) => sum + weights[area.status], 0) / dataReadiness.length;

  return {
    percentage: Math.round(score * 100),
    frontendPrototypePercentage: 75,
    summary: "The product experience and domain model are strong enough to guide backend work, but production services are still mostly mocked.",
  };
}

export { customers, dispatchEvents, repositoryPortStatuses, scheduledJobs, technicians };
