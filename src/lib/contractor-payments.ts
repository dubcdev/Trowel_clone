import { activeBusiness } from "@/lib/business";
import { scheduledJobs } from "@/lib/operations";

export type ConnectedAccountStatus = "not_started" | "onboarding" | "active" | "restricted" | "disabled";
export type ContractorInvoiceStatus = "draft" | "sent" | "paid" | "past_due" | "void";
export type ContractorPaymentStatus = "not_required" | "requested" | "pending" | "paid" | "failed" | "waived" | "refunded";

export type ContractorConnectedAccount = {
  id: string;
  businessId: string;
  connectedAccountId: string;
  connectOnboardingStatus: ConnectedAccountStatus;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  applicationFeePercent: 0;
  applicationFeeAmount: 0;
};

export type ContractorInvoice = {
  id: string;
  businessId: string;
  customerId: string;
  jobId: string;
  connectedAccountId: string;
  invoiceId?: string;
  amount: number;
  memo: string;
  invoiceStatus: ContractorInvoiceStatus;
  paymentStatus: ContractorPaymentStatus;
};

export type ContractorPaymentLink = {
  id: string;
  businessId: string;
  customerId: string;
  jobId: string;
  connectedAccountId: string;
  paymentLinkId?: string;
  amount: number;
  reason: "diagnostic_fee" | "deposit" | "emergency_deposit" | "job_invoice";
  paymentStatus: ContractorPaymentStatus;
  smsReady: boolean;
};

export type ContractorPayment = {
  id: string;
  businessId: string;
  customerId: string;
  jobId: string;
  paymentIntentId?: string;
  amount: number;
  paymentStatus: ContractorPaymentStatus;
  paidAt?: string;
};

export type ContractorRefund = {
  id: string;
  businessId: string;
  customerId: string;
  jobId: string;
  paymentId: string;
  amount: number;
  status: "requested" | "review_needed" | "refunded" | "failed";
};

export type JobPaymentStatus = {
  jobId: string;
  businessId: string;
  customerId: string;
  invoiceStatus: ContractorInvoiceStatus;
  paymentStatus: ContractorPaymentStatus;
  amountOpen: number;
  lastUpdated: string;
};

export const contractorPaymentPolicy = {
  purpose: "real_world_contractor_services",
  provider: "stripe_connect",
  platformApplicationFeePercent: 0,
  platformApplicationFeeAmount: 0,
  mobileAllowedActions: [
    "create_invoice_for_job",
    "send_invoice_to_customer",
    "request_deposit",
    "send_payment_link",
    "mark_manual_payment_received",
    "view_payment_status",
    "resend_invoice",
  ],
  forbiddenMobileLanguage: ["Subscribe", "Upgrade", "Premium", "Plan", "Unlock", "Buy access"],
} as const;

export const contractorConnectedAccount: ContractorConnectedAccount = {
  id: "connected-bayview",
  businessId: activeBusiness.id,
  connectedAccountId: "acct_contractor_bayview_mock",
  connectOnboardingStatus: "onboarding",
  chargesEnabled: false,
  payoutsEnabled: false,
  applicationFeePercent: 0,
  applicationFeeAmount: 0,
};

export const contractorInvoices: ContractorInvoice[] = [
  {
    id: "contractor-invoice-erica",
    businessId: activeBusiness.id,
    customerId: "erica-patel",
    jobId: "job-erica-tuneup",
    connectedAccountId: contractorConnectedAccount.id,
    invoiceId: "in_contractor_erica_mock",
    amount: 89,
    memo: "AC tune-up diagnostic fee",
    invoiceStatus: "sent",
    paymentStatus: "requested",
  },
];

export const contractorPaymentLinks: ContractorPaymentLink[] = [
  {
    id: "plink-angela-emergency",
    businessId: activeBusiness.id,
    customerId: "angela-brooks",
    jobId: "job-angela-emergency",
    connectedAccountId: contractorConnectedAccount.id,
    paymentLinkId: "plink_contractor_angela_mock",
    amount: 150,
    reason: "emergency_deposit",
    paymentStatus: "pending",
    smsReady: true,
  },
];

export const contractorPayments: ContractorPayment[] = [
  {
    id: "contractor-payment-lily",
    businessId: activeBusiness.id,
    customerId: "lily-park",
    jobId: "job-lily-drain",
    paymentIntentId: "pi_contractor_lily_mock",
    amount: 89,
    paymentStatus: "paid",
    paidAt: "Today 10:42 AM",
  },
];

export const contractorRefunds: ContractorRefund[] = [
  {
    id: "contractor-refund-tom",
    businessId: activeBusiness.id,
    customerId: "tom-reilly",
    jobId: "job-tom-invoice",
    paymentId: "contractor-payment-tom",
    amount: 129,
    status: "review_needed",
  },
];

export function getConnectStatus() {
  return {
    account: contractorConnectedAccount,
    policy: contractorPaymentPolicy,
    nextStep: contractorConnectedAccount.chargesEnabled
      ? "Contractor service payments can be sent from job records."
      : "Finish Stripe Connect onboarding in the web portal before sending live payment links.",
  };
}

export function getJobPayments(jobId: string): JobPaymentStatus {
  const job = scheduledJobs.find((item) => item.id === jobId);
  const invoice = contractorInvoices.find((item) => item.jobId === jobId);
  const paymentLink = contractorPaymentLinks.find((item) => item.jobId === jobId);
  const payment = contractorPayments.find((item) => item.jobId === jobId);

  return {
    jobId,
    businessId: activeBusiness.id,
    customerId: job?.customerId ?? invoice?.customerId ?? paymentLink?.customerId ?? "unknown",
    invoiceStatus: invoice?.invoiceStatus ?? (payment ? "paid" : "draft"),
    paymentStatus: payment?.paymentStatus ?? invoice?.paymentStatus ?? paymentLink?.paymentStatus ?? "not_required",
    amountOpen: payment?.paymentStatus === "paid" ? 0 : invoice?.amount ?? paymentLink?.amount ?? 0,
    lastUpdated: "mock-current",
  };
}

export function createContractorInvoiceDraft(jobId: string) {
  const job = scheduledJobs.find((item) => item.id === jobId);
  return {
    jobId,
    businessId: activeBusiness.id,
    customerId: job?.customerId ?? "unknown",
    connectedAccountId: contractorConnectedAccount.id,
    allowedSurface: "mobile_operations_or_web_portal",
    purpose: "real_world_contractor_services",
    applicationFeeAmount: 0,
    applicationFeePercent: 0,
    status: contractorConnectedAccount.chargesEnabled ? "ready_to_create" : "connect_onboarding_required",
    note: "Creates an invoice under the contractor connected account. This is not platform SaaS billing.",
  };
}

export function createContractorPaymentLinkDraft(jobId: string) {
  const job = scheduledJobs.find((item) => item.id === jobId);
  return {
    jobId,
    businessId: activeBusiness.id,
    customerId: job?.customerId ?? "unknown",
    connectedAccountId: contractorConnectedAccount.id,
    allowedSurface: "mobile_operations_or_web_portal",
    purpose: "real_world_contractor_services",
    applicationFeeAmount: 0,
    applicationFeePercent: 0,
    status: contractorConnectedAccount.chargesEnabled ? "ready_to_create" : "connect_onboarding_required",
    note: "Sends a contractor-owned payment link for the job. No platform cut is applied for MVP.",
  };
}
