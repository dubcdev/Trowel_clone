import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { createAuditLog, requireTenantPermission } from "@/lib/backend";
import { getPaymentActionPlan, getPaymentPolicyForJob, getPaymentRequestForJob } from "@/lib/payments";
import { scheduledJobs } from "@/lib/operations";

export const Route = createFileRoute("/api/payments/requests")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "payments:send_link");
          const body = await safeJson(request);
          const job = scheduledJobs.find((item) => item.id === body.jobId) ?? scheduledJobs[0];
          const policy = getPaymentPolicyForJob({ trade: job.trade, emergency: job.emergency, membership: false, quoted: true });
          const existingRequest = getPaymentRequestForJob(job.id);
          const plan = getPaymentActionPlan(job.payment, policy, existingRequest);
          return jsonOk(
            {
              jobId: job.id,
              customerId: job.customerId,
              plan,
              audit: createAuditLog({
                businessId: session.businessId,
                actorUserId: session.userId,
                action: "payment.request.reviewed",
                entityType: "job",
                entityId: job.id,
                severity: "sensitive",
                metadata: {
                  policyId: policy.id,
                  aiMayRequest: plan.assessment.aiMayRequestPayment,
                },
              }),
            },
            session.businessId,
          );
        } catch (error) {
          return jsonError(error);
        }
      },
    },
  },
});

async function safeJson(request: Request): Promise<{ jobId?: string }> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
