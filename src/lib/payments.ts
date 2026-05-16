export type PaymentStatus =
  | "not_required"
  | "requested"
  | "deposit_collected"
  | "paid"
  | "pending"
  | "failed"
  | "link_sent"
  | "waived"
  | "refunded"
  | "not_requested";

export type PaymentKind = "deposit" | "emergency_deposit" | "diagnostic_fee" | "appointment_confirmation" | "invoice";
export type PaymentPolicyKind = "none" | "diagnostic_fee" | "emergency_deposit" | "booking_deposit" | "full_payment" | "owner_quote";
export type PaymentProvider = "stripe_connect" | "manual" | "zelle_future";
export type PaymentRequestStatus = "not_required" | "requested" | "pending" | "paid" | "failed" | "waived" | "refunded";
export type PaymentEventType = "link_created" | "link_sent" | "paid" | "failed" | "waived" | "refunded" | "job_confirmed";
export type ConfirmationState =
  | "hold_created"
  | "payment_not_required"
  | "payment_required"
  | "payment_requested"
  | "payment_collected"
  | "payment_waived"
  | "booking_confirmed"
  | "dispatch_notified"
  | "failed_payment_follow_up";

export type Payment = {
  status: PaymentStatus;
  kind: PaymentKind;
  amount: number;
  detail?: string;
  when?: string;
};

export type PaymentAccount = {
  id: string;
  businessId: string;
  provider: PaymentProvider;
  providerAccountId?: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  onboardingStatus: "not_started" | "started" | "requirements_due" | "enabled";
  dashboardAccess: "full" | "express" | "none";
  responsibilityModel: string;
};

export type PaymentRequest = {
  id: string;
  businessId: string;
  customerId: string;
  jobId?: string;
  appointmentId?: string;
  amount: number;
  reason: PaymentKind;
  status: PaymentRequestStatus;
  provider: PaymentProvider;
  providerPaymentId?: string;
  checkoutUrl?: string;
  sentAt?: string;
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  waivedAt?: string;
  ownerApproved: boolean;
  aiMaySend: boolean;
};

export type Deposit = {
  id: string;
  paymentRequestId: string;
  jobId: string;
  amount: number;
  requiredBeforeBooking: boolean;
  status: PaymentRequestStatus;
};

export type Invoice = {
  id: string;
  customerId: string;
  jobId?: string;
  amount: number;
  status: PaymentRequestStatus;
  memo: string;
};

export type PaymentEvent = {
  id: string;
  paymentRequestId: string;
  type: PaymentEventType;
  at: string;
  detail: string;
  providerEventId?: string;
};

export type RefundEvent = {
  id: string;
  paymentRequestId: string;
  amount: number;
  status: "ready" | "requested" | "processed" | "failed";
  reason: string;
  providerRefundId?: string;
};

export type PaymentStatusHistory = {
  id: string;
  paymentRequestId: string;
  from?: PaymentRequestStatus;
  to: PaymentRequestStatus;
  at: string;
  actor: "ai" | "owner" | "dispatcher" | "stripe_webhook" | "system";
  note: string;
};

export type PaymentPolicy = {
  id: string;
  name: string;
  kind: PaymentPolicyKind;
  trade?: string;
  amount: number;
  ownerConfirmed: boolean;
  aiMayRequest: boolean;
  explanation: string;
};

export type PaymentAssessment = {
  policy: PaymentPolicy;
  confirmationState: ConfirmationState;
  canConfirmBooking: boolean;
  aiMayRequestPayment: boolean;
  requiresOwnerApproval: boolean;
  nextAction: string;
  safetyNotes: string[];
};

export type PaymentActionPlan = {
  request?: PaymentRequest;
  assessment: PaymentAssessment;
  primaryAction: string;
  allowedActions: string[];
  blockedReason?: string;
  customerMessage?: string;
};

export const STATUS_LABEL: Record<PaymentStatus, string> = {
  not_required: "Not required",
  requested: "Payment requested",
  deposit_collected: "Deposit collected",
  paid: "Paid in full",
  pending: "Payment pending",
  failed: "Payment failed",
  link_sent: "Payment link sent",
  waived: "Deposit waived",
  refunded: "Refunded",
  not_requested: "No payment requested",
};

export const KIND_LABEL: Record<PaymentKind, string> = {
  deposit: "Booking deposit",
  emergency_deposit: "Emergency deposit",
  diagnostic_fee: "Diagnostic fee",
  appointment_confirmation: "Appointment confirmation",
  invoice: "Invoice",
};

export const paymentsConnected = false;

export const paymentAccount: PaymentAccount = {
  id: "payment-account-bayview",
  businessId: "business-bayview",
  provider: "stripe_connect",
  providerAccountId: "acct_connected_pending",
  chargesEnabled: false,
  payoutsEnabled: false,
  onboardingStatus: "requirements_due",
  dashboardAccess: "full",
  responsibilityModel:
    "Accounts v2 planned. Contractor owns the connected Stripe account; platform creates Checkout Sessions or payment links for approved operational payments.",
};

export const paymentPolicies: PaymentPolicy[] = [
  {
    id: "policy-standard-diagnostic",
    name: "Standard diagnostic fee",
    kind: "diagnostic_fee",
    amount: 89,
    ownerConfirmed: true,
    aiMayRequest: true,
    explanation: "Use for standard non-emergency diagnostic visits when no membership waiver applies.",
  },
  {
    id: "policy-emergency-plumbing",
    name: "Plumbing emergency deposit",
    kind: "emergency_deposit",
    trade: "plumbing",
    amount: 150,
    ownerConfirmed: false,
    aiMayRequest: false,
    explanation: "Suggested emergency deposit. Owner confirmation required before AI can request this amount.",
  },
  {
    id: "policy-membership-waiver",
    name: "Membership booking waiver",
    kind: "none",
    amount: 0,
    ownerConfirmed: true,
    aiMayRequest: false,
    explanation: "Do not require payment before booking for active members.",
  },
  {
    id: "policy-owner-quote",
    name: "Owner must quote",
    kind: "owner_quote",
    amount: 0,
    ownerConfirmed: true,
    aiMayRequest: false,
    explanation: "Used when service price or deposit rule is unclear. AI escalates instead of inventing a price.",
  },
];

export const paymentRequests: PaymentRequest[] = [
  {
    id: "payreq-angela-emergency",
    businessId: "business-bayview",
    customerId: "angela-brooks",
    jobId: "job-angela-emergency-hold",
    appointmentId: "appt-angela-emergency-hold",
    amount: 150,
    reason: "emergency_deposit",
    status: "pending",
    provider: "stripe_connect",
    sentAt: "Held 4 min ago",
    ownerApproved: false,
    aiMaySend: false,
  },
  {
    id: "payreq-erica-deposit",
    businessId: "business-bayview",
    customerId: "erica-patel",
    jobId: "job-erica-ac",
    appointmentId: "appt-erica-ac",
    amount: 50,
    reason: "deposit",
    status: "paid",
    provider: "stripe_connect",
    providerPaymentId: "cs_test_erica_deposit",
    checkoutUrl: "https://checkout.stripe.example/erica",
    sentAt: "Today 9:19am",
    paidAt: "Today 9:21am",
    ownerApproved: true,
    aiMaySend: true,
  },
  {
    id: "payreq-lily-diagnostic",
    businessId: "business-bayview",
    customerId: "lily-park",
    jobId: "job-lily-drain",
    appointmentId: "appt-lily-drain",
    amount: 89,
    reason: "diagnostic_fee",
    status: "requested",
    provider: "stripe_connect",
    checkoutUrl: "https://checkout.stripe.example/lily",
    sentAt: "8 min ago",
    ownerApproved: true,
    aiMaySend: true,
  },
];

export const deposits: Deposit[] = [
  { id: "deposit-angela", paymentRequestId: "payreq-angela-emergency", jobId: "job-angela-emergency-hold", amount: 150, requiredBeforeBooking: true, status: "pending" },
  { id: "deposit-erica", paymentRequestId: "payreq-erica-deposit", jobId: "job-erica-ac", amount: 50, requiredBeforeBooking: false, status: "paid" },
];

export const invoices: Invoice[] = [
  { id: "invoice-tom-2418", customerId: "tom-reilly", amount: 129, status: "pending", memo: "Diagnostic fee refund request waiting on owner review." },
];

export const paymentEvents: PaymentEvent[] = [
  { id: "pe-erica-link", paymentRequestId: "payreq-erica-deposit", type: "link_sent", at: "Today 9:19am", detail: "Secure checkout link sent by SMS." },
  { id: "pe-erica-paid", paymentRequestId: "payreq-erica-deposit", type: "paid", at: "Today 9:21am", detail: "$50 deposit collected by Apple Pay.", providerEventId: "evt_erica_paid" },
  { id: "pe-erica-confirmed", paymentRequestId: "payreq-erica-deposit", type: "job_confirmed", at: "Today 9:21am", detail: "Appointment confirmed after deposit event." },
  { id: "pe-lily-link", paymentRequestId: "payreq-lily-diagnostic", type: "link_sent", at: "8 min ago", detail: "$89 diagnostic fee link sent by SMS." },
];

export const refundEvents: RefundEvent[] = [
  { id: "refund-tom-ready", paymentRequestId: "invoice-tom-2418", amount: 129, status: "ready", reason: "Owner review requested before refund." },
];

export const paymentStatusHistory: PaymentStatusHistory[] = [
  { id: "psh-erica-requested", paymentRequestId: "payreq-erica-deposit", to: "requested", at: "Today 9:19am", actor: "ai", note: "AI sent approved deposit link." },
  { id: "psh-erica-paid", paymentRequestId: "payreq-erica-deposit", from: "requested", to: "paid", at: "Today 9:21am", actor: "stripe_webhook", note: "Checkout session completed." },
  { id: "psh-angela-pending", paymentRequestId: "payreq-angela-emergency", to: "pending", at: "Held 4 min ago", actor: "ai", note: "AI held payment request because emergency deposit rule is not owner-confirmed." },
];

export function formatAmount(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });
}

export function getPaymentPolicyForJob(input: { trade?: string; emergency?: boolean; membership?: boolean; quoted?: boolean }) {
  if (input.membership) return paymentPolicies.find((policy) => policy.id === "policy-membership-waiver")!;
  if (input.emergency && input.trade === "plumbing") return paymentPolicies.find((policy) => policy.id === "policy-emergency-plumbing")!;
  if (input.quoted === false) return paymentPolicies.find((policy) => policy.id === "policy-owner-quote")!;
  return paymentPolicies.find((policy) => policy.id === "policy-standard-diagnostic")!;
}

export function assessPaymentForBooking(payment: Payment, policy: PaymentPolicy): PaymentAssessment {
  const safetyNotes: string[] = [];
  if (!paymentsConnected) safetyNotes.push("Stripe Connect is not connected");
  if (!policy.ownerConfirmed) safetyNotes.push("Payment rule needs owner confirmation");
  if (!policy.aiMayRequest && policy.amount > 0) safetyNotes.push("AI cannot request this amount yet");

  const isCollected = payment.status === "deposit_collected" || payment.status === "paid";
  const isWaived = payment.status === "waived" || policy.kind === "none" || payment.status === "not_required";
  const isFailed = payment.status === "failed";
  const isRequested = payment.status === "requested" || payment.status === "link_sent" || payment.status === "pending";
  const requiresPayment = policy.kind !== "none" && policy.kind !== "owner_quote" && policy.amount > 0;
  const requiresOwnerApproval = policy.kind === "owner_quote" || !policy.ownerConfirmed || (!policy.aiMayRequest && requiresPayment);

  let confirmationState: ConfirmationState = "hold_created";
  if (isFailed) confirmationState = "failed_payment_follow_up";
  else if (isCollected) confirmationState = "payment_collected";
  else if (isWaived) confirmationState = "payment_waived";
  else if (isRequested) confirmationState = "payment_requested";
  else if (requiresPayment) confirmationState = "payment_required";
  else confirmationState = "payment_not_required";

  const canConfirmBooking = isCollected || isWaived || (!requiresPayment && !requiresOwnerApproval);
  const aiMayRequestPayment = paymentsConnected && policy.ownerConfirmed && policy.aiMayRequest && requiresPayment;

  return {
    policy,
    confirmationState: canConfirmBooking && confirmationState === "payment_collected" ? "booking_confirmed" : confirmationState,
    canConfirmBooking,
    aiMayRequestPayment,
    requiresOwnerApproval,
    nextAction: getPaymentNextAction({ canConfirmBooking, aiMayRequestPayment, requiresOwnerApproval, isFailed, isRequested, policy }),
    safetyNotes,
  };
}

export function getPaymentRequestForJob(jobId: string) {
  return paymentRequests.find((request) => request.jobId === jobId);
}

export function createPaymentRequestDraft(input: {
  businessId: string;
  customerId: string;
  jobId?: string;
  appointmentId?: string;
  policy: PaymentPolicy;
}): PaymentRequest {
  return {
    id: `draft-${input.customerId}-${input.policy.id}`,
    businessId: input.businessId,
    customerId: input.customerId,
    jobId: input.jobId,
    appointmentId: input.appointmentId,
    amount: input.policy.amount,
    reason: policyKindToPaymentKind(input.policy.kind),
    status: input.policy.kind === "none" ? "not_required" : "pending",
    provider: "stripe_connect",
    ownerApproved: input.policy.ownerConfirmed,
    aiMaySend: paymentsConnected && input.policy.ownerConfirmed && input.policy.aiMayRequest && input.policy.amount > 0,
  };
}

export function getPaymentActionPlan(payment: Payment, policy: PaymentPolicy, existingRequest?: PaymentRequest): PaymentActionPlan {
  const assessment = assessPaymentForBooking(payment, policy);
  const request = existingRequest ?? createPaymentRequestDraft({
    businessId: "business-bayview",
    customerId: "unknown",
    policy,
  });
  const allowedActions: string[] = [];

  if (assessment.aiMayRequestPayment) allowedActions.push("send_payment_link");
  if (assessment.requiresOwnerApproval) allowedActions.push("request_owner_approval");
  if (payment.status === "pending" || payment.status === "requested" || payment.status === "link_sent") allowedActions.push("send_reminder");
  if (payment.status === "failed") allowedActions.push("failed_payment_follow_up");
  if (payment.status !== "paid" && payment.status !== "deposit_collected") allowedActions.push("waive_if_permitted");
  if (payment.status === "paid" || payment.status === "deposit_collected") allowedActions.push("confirm_job");

  return {
    request,
    assessment,
    primaryAction: assessment.nextAction,
    allowedActions,
    blockedReason: assessment.safetyNotes[0],
    customerMessage: assessment.aiMayRequestPayment
      ? `To confirm your appointment, we will send a secure payment link for ${formatAmount(policy.amount)}.`
      : undefined,
  };
}

export function getPaymentWorkflowSummary() {
  const requested = paymentRequests.filter((request) => request.status === "requested" || request.status === "pending").length;
  const paid = paymentRequests.filter((request) => request.status === "paid").length;
  const failed = paymentRequests.filter((request) => request.status === "failed").length;
  const approvalNeeded = paymentRequests.filter((request) => !request.ownerApproved || !request.aiMaySend).length;
  const collected = paymentRequests.reduce((sum, request) => request.status === "paid" ? sum + request.amount : sum, 0);

  return {
    connected: paymentsConnected,
    accountStatus: paymentAccount.onboardingStatus,
    chargesEnabled: paymentAccount.chargesEnabled,
    requested,
    paid,
    failed,
    approvalNeeded,
    collected,
    paymentRequests: paymentRequests.length,
    events: paymentEvents.length,
    refundsReady: refundEvents.filter((event) => event.status === "ready").length,
  };
}

export function confirmationLabel(state: ConfirmationState) {
  const labels: Record<ConfirmationState, string> = {
    hold_created: "Hold created",
    payment_not_required: "Payment not required",
    payment_required: "Payment required",
    payment_requested: "Payment requested",
    payment_collected: "Payment collected",
    payment_waived: "Payment waived",
    booking_confirmed: "Booking confirmed",
    dispatch_notified: "Dispatch notified",
    failed_payment_follow_up: "Failed payment follow-up",
  };
  return labels[state];
}

function getPaymentNextAction(input: {
  canConfirmBooking: boolean;
  aiMayRequestPayment: boolean;
  requiresOwnerApproval: boolean;
  isFailed: boolean;
  isRequested: boolean;
  policy: PaymentPolicy;
}) {
  if (input.canConfirmBooking) return "Confirm appointment and notify technician.";
  if (input.isFailed) return "Send failed payment follow-up or ask owner to waive.";
  if (input.requiresOwnerApproval) return "Ask owner or dispatcher to approve payment rule.";
  if (input.aiMayRequestPayment) return `Send secure SMS payment link for ${formatAmount(input.policy.amount)}.`;
  if (input.isRequested) return "Wait for payment or send reminder.";
  return "Hold booking until payment policy is clear.";
}

function policyKindToPaymentKind(kind: PaymentPolicyKind): PaymentKind {
  if (kind === "emergency_deposit") return "emergency_deposit";
  if (kind === "diagnostic_fee") return "diagnostic_fee";
  if (kind === "full_payment") return "invoice";
  if (kind === "booking_deposit") return "deposit";
  return "appointment_confirmation";
}
