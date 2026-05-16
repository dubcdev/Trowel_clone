import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { createAuditLog, requireTenantPermission } from "@/lib/backend";
import { scheduledJobs } from "@/lib/operations";
import { getAllowedJobTransitions } from "@/lib/job-workflow";

export const Route = createFileRoute("/api/jobs/$jobId/status")({
  server: {
    handlers: {
      PATCH: async ({ params, request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "jobs:update_status");
          const job = scheduledJobs.find((item) => item.id === params.jobId);
          if (!job) return jsonError(new Error("Job not found."), 404);
          const body = await request.json().catch(() => ({})) as { action?: string };
          const transitions = getAllowedJobTransitions(job);
          const requestedTransition = transitions.find((transition) => transition.action === body.action);
          const appliedTransition = requestedTransition?.allowed ? requestedTransition : undefined;
          return jsonOk(
            {
              jobId: job.id,
              currentStatus: job.status,
              requestedAction: body.action ?? "review",
              nextStatus: appliedTransition?.nextStatus ?? job.status,
              applied: Boolean(appliedTransition),
              allowedActions: transitions.filter((transition) => transition.allowed),
              blockedActions: transitions.filter((transition) => !transition.allowed),
              audit: createAuditLog({
                businessId: session.businessId,
                actorUserId: session.userId,
                action: appliedTransition ? `job.status.${appliedTransition.action}` : "job.status.reviewed",
                entityType: "job",
                entityId: job.id,
                severity: "info",
                metadata: {
                  requestedAction: body.action ?? "review",
                  nextStatus: appliedTransition?.nextStatus ?? job.status,
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
