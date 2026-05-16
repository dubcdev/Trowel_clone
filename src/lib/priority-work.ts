import { conversations, getOperationalConversationContext } from "@/lib/voice-sms";
import { dispatchEvents, scheduledJobs } from "@/lib/operations";
import { getPaymentWorkflowSummary, paymentPolicies } from "@/lib/payments";

export type PriorityWorkTone = "urgent" | "important" | "normal";
export type PriorityWorkDestination = "/" | "/calls" | "/jobs" | "/dispatch" | "/customers" | "/settings" | "/onboarding" | "/notifications";

export type PriorityWorkItem = {
  id: string;
  type: "dispatch" | "job" | "call" | "payment" | "setup";
  label: string;
  title: string;
  detail: string;
  priority: PriorityWorkTone;
  destination: PriorityWorkDestination;
  actionLabel: string;
  relatedCustomerId?: string;
  relatedJobId?: string;
  createdAt: string;
};

export function needsConversationReview(conversation: (typeof conversations)[number]) {
  return Boolean(conversation.escalation?.required) ||
    conversation.confidence < 80 ||
    conversation.status === "missed_recovered" ||
    conversation.status === "follow_up";
}

export function getPriorityWorkSummary() {
  const callsNeedingReview = conversations.filter(needsConversationReview);
  const bookedCalls = conversations.filter((conversation) => conversation.status === "booked");
  const urgentCalls = conversations.filter((conversation) => conversation.escalation?.required);
  const activeJobs = scheduledJobs.filter((job) => job.status !== "completed");
  const currentJob = activeJobs.find((job) => job.status === "in_progress") ?? activeJobs[0];
  const emergencyDispatch = dispatchEvents.find((event) => event.urgency === "Critical") ?? dispatchEvents[0];
  const emergencyConversation = emergencyDispatch
    ? conversations.find((conversation) => conversation.customerId === emergencyDispatch.customerId)
    : undefined;
  const emergencyDepositPolicy = paymentPolicies.find((policy) => policy.id === "policy-emergency-plumbing");
  const paymentSummary = getPaymentWorkflowSummary();

  return {
    callsNeedingReview,
    callsNeedingReviewCount: callsNeedingReview.length,
    bookedCallsCount: bookedCalls.length,
    urgentCallsCount: urgentCalls.length,
    activeJobs,
    activeJobsCount: activeJobs.length,
    currentJob,
    emergencyDispatch,
    emergencyConversation,
    emergencyNextAction: emergencyConversation
      ? getOperationalConversationContext(emergencyConversation).nextAction
      : "Review emergency dispatch and notify the technician.",
    emergencyDepositPolicy,
    paymentApprovalCount: paymentSummary.approvalNeeded,
    actionItems: getPriorityActionItems(),
  };
}

export function getPriorityActionItems(): PriorityWorkItem[] {
  const callsNeedingReview = conversations.filter(needsConversationReview);
  const activeJobs = scheduledJobs.filter((job) => job.status !== "completed");
  const currentJob = activeJobs.find((job) => job.status === "in_progress");
  const emergencyDispatch = dispatchEvents.find((event) => event.urgency === "Critical") ?? dispatchEvents[0];
  const emergencyConversation = emergencyDispatch
    ? conversations.find((conversation) => conversation.customerId === emergencyDispatch.customerId)
    : undefined;
  const paymentSummary = getPaymentWorkflowSummary();
  const emergencyDepositPolicy = paymentPolicies.find((policy) => policy.id === "policy-emergency-plumbing");

  const items: PriorityWorkItem[] = [];

  if (emergencyDispatch) {
    items.push({
      id: `priority-${emergencyDispatch.id}`,
      type: "dispatch",
      label: "Emergency",
      title: emergencyDispatch.customer,
      detail: emergencyConversation
        ? getOperationalConversationContext(emergencyConversation).nextAction
        : "Review emergency dispatch and notify the technician.",
      priority: emergencyDispatch.urgency === "Critical" ? "urgent" : "important",
      destination: "/dispatch",
      actionLabel: "Review dispatch",
      relatedCustomerId: emergencyDispatch.customerId,
      relatedJobId: "job-angela-emergency-hold",
      createdAt: emergencyDispatch.received,
    });
  }

  if (currentJob) {
    items.push({
      id: `priority-${currentJob.id}`,
      type: "job",
      label: "On job",
      title: currentJob.customer,
      detail: "Finish this job, collect notes/photos, then move to the next scheduled item.",
      priority: "normal",
      destination: "/jobs",
      actionLabel: "Open jobs",
      relatedCustomerId: currentJob.customerId,
      relatedJobId: currentJob.id,
      createdAt: "Now",
    });
  }

  if (callsNeedingReview.length > 0) {
    const firstCall = callsNeedingReview[0];
    items.push({
      id: "priority-calls-review",
      type: "call",
      label: "Call",
      title: `${callsNeedingReview.length} calls need review`,
      detail: `First: ${firstCall.customerName}. ${getOperationalConversationContext(firstCall).nextAction}`,
      priority: callsNeedingReview.some((conversation) => conversation.escalation?.required) ? "important" : "normal",
      destination: "/calls",
      actionLabel: "Open calls",
      relatedCustomerId: firstCall.customerId,
      createdAt: "Live",
    });
  }

  if (paymentSummary.approvalNeeded > 0) {
    items.push({
      id: "priority-payment-rules",
      type: "payment",
      label: "Payment",
      title: `${emergencyDepositPolicy?.amount ? `$${emergencyDepositPolicy.amount}` : "Payment"} deposit rule`,
      detail: `${paymentSummary.approvalNeeded} payment rule needs owner approval before AI can request money.`,
      priority: "important",
      destination: "/settings",
      actionLabel: "Check setup",
      createdAt: "Open",
    });
  }

  return items.sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority));
}

function priorityWeight(priority: PriorityWorkTone) {
  if (priority === "urgent") return 3;
  if (priority === "important") return 2;
  return 1;
}
