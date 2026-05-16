import { createFileRoute } from "@tanstack/react-router";
import { getMockSessionFromRequest, jsonError, jsonOk } from "@/lib/api";
import { createAuditLog, requireTenantPermission } from "@/lib/backend";
import { dispatchEvents, technicians } from "@/lib/operations";

export const Route = createFileRoute("/api/dispatch/$dispatchId/assign")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const session = getMockSessionFromRequest(request);
        try {
          requireTenantPermission(session, session.businessId, "jobs:assign");
          const event = dispatchEvents.find((item) => item.id === params.dispatchId);
          if (!event) return jsonError(new Error("Dispatch event not found."), 404);
          const body = (await request.json().catch(() => ({}))) as { technicianId?: string };
          const technician = technicians.find((item) => item.id === body.technicianId) ?? technicians.find((item) => item.emergencyEligible);
          return jsonOk(
            {
              dispatchId: event.id,
              assignedTechnicianId: technician?.id ?? "manual_review",
              assignmentStatus: technician ? "held_for_dispatch_approval" : "needs_dispatcher_review",
              audit: createAuditLog({
                businessId: session.businessId,
                actorUserId: session.userId,
                action: "dispatch.assigned",
                entityType: "dispatch_event",
                entityId: event.id,
                severity: "sensitive",
                metadata: {
                  technicianId: technician?.id ?? "manual_review",
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
