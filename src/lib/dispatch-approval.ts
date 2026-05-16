import { DispatchEvent } from "@/lib/operations";
import { getDispatchActionPlan } from "@/lib/eta";
import type { UserSession } from "@/lib/rbac";

export type DispatchApprovalReceipt = {
  id: string;
  dispatchEventId: string;
  approvedAt: string;
  approvedBy: string;
  customer: string;
  issue: string;
  assignedTechnician: {
    id: string;
    name: string;
    eta: string;
    etaSource: string;
    etaConfidence: number;
  };
  jobStatus: "locked_for_dispatch";
  customerSmsStatus: "ready_to_send";
  technicianNotificationStatus: "ready_to_send";
  paymentStatus: string;
  auditSummary: string;
  nextActions: Array<{
    label: string;
    detail: string;
    destination: "/jobs" | "/customers" | "/dispatch";
  }>;
  audit: {
    businessId: string;
    actorUserId: string;
    action: string;
    entityType: string;
    entityId: string;
    severity: "sensitive";
    metadata: Record<string, string | number>;
  };
};

export function createDispatchApprovalReceipt(event: DispatchEvent, session: UserSession): DispatchApprovalReceipt {
  const plan = getDispatchActionPlan(event);
  const eta = plan.eta;

  return {
    id: `approval-${event.id}`,
    dispatchEventId: event.id,
    approvedAt: "Just now",
    approvedBy: session.name,
    customer: event.customer,
    issue: event.issue,
    assignedTechnician: {
      id: eta.technician.id,
      name: eta.technician.name,
      eta: eta.display,
      etaSource: `${eta.source.replace("_", " ")} - ${eta.freshness} - ${eta.provider.replace("_", " ")}`,
      etaConfidence: eta.confidence,
    },
    jobStatus: "locked_for_dispatch",
    customerSmsStatus: "ready_to_send",
    technicianNotificationStatus: "ready_to_send",
    paymentStatus: event.payment.status.replaceAll("_", " "),
    auditSummary: plan.auditSummary,
    nextActions: [
      {
        label: "View job",
        detail: "Open the emergency job record and dispatch status.",
        destination: "/jobs",
      },
      {
        label: "Text customer",
        detail: "Send the en-route SMS from the AI texting number.",
        destination: "/dispatch",
      },
      {
        label: "Open customer",
        detail: "Review memory, unresolved issue history, and photos.",
        destination: "/customers",
      },
    ],
    audit: {
      businessId: session.businessId,
      actorUserId: session.userId,
      action: "dispatch.approved",
      entityType: "dispatch_event",
      entityId: event.id,
      severity: "sensitive",
      metadata: {
        technicianId: eta.technician.id,
        eta: eta.display,
        confidence: eta.confidence,
        customerSmsStatus: "ready_to_send",
        technicianNotificationStatus: "ready_to_send",
      },
    },
  };
}
