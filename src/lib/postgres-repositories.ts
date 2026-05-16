import { createAuditLog, requireTenantPermission, type AuditLogDraft, type TenantRepositoryResult } from "@/lib/backend";
import { getBackendReadiness, apiEndpointContracts, databaseTables } from "@/lib/backend";
import { getPersistenceStatus, repositoryPortStatuses } from "@/lib/persistence";
import { getSeedSummary } from "@/lib/seed-data";
import type { DatabaseClient } from "@/lib/postgres";
import type { UserSession } from "@/lib/rbac";

export function createPostgresTenantRepositories(client: DatabaseClient) {
  return {
    async getMobileSnapshot(session: UserSession, businessId: string): Promise<TenantRepositoryResult<unknown>> {
      requireTenantPermission(session, businessId, "settings:view");
      const counts = await client.query<{ table_name: string; total: number }>(
        "select table_name, 0 as total from information_schema.tables where table_schema = 'public' limit 1",
      );
      return { data: { businessId, counts: { databaseProbeRows: counts.rowCount } } };
    },

    async listCustomers(session: UserSession, businessId: string) {
      requireTenantPermission(session, businessId, session.role === "technician" ? "customers:view_assigned" : "customers:view_all");
      return client.query("select * from customers where business_id = $1 order by updated_at desc", [businessId]);
    },

    async listJobs(session: UserSession, businessId: string) {
      requireTenantPermission(session, businessId, session.role === "technician" ? "jobs:view_assigned" : "jobs:view_all");
      return client.query("select * from jobs where business_id = $1 order by updated_at desc", [businessId]);
    },

    async listCalls(session: UserSession, businessId: string) {
      requireTenantPermission(session, businessId, "calls:view");
      return client.query("select * from conversations where business_id = $1 order by created_at desc", [businessId]);
    },

    async listDispatchEvents(session: UserSession, businessId: string) {
      requireTenantPermission(session, businessId, "dispatch:view");
      return client.query("select * from dispatch_events where business_id = $1 order by created_at desc", [businessId]);
    },

    async listTeam(session: UserSession, businessId: string) {
      requireTenantPermission(session, businessId, "settings:view");
      return client.query("select * from technicians where business_id = $1 order by name asc", [businessId]);
    },

    async getOnboardingState(session: UserSession, businessId: string) {
      requireTenantPermission(session, businessId, "settings:view");
      return client.query("select * from onboarding_confirmations where business_id = $1 order by updated_at desc", [businessId]);
    },

    getSettingsReadiness(session: UserSession, businessId: string) {
      requireTenantPermission(session, businessId, "settings:view");
      return {
        data: {
          backend: getBackendReadiness(),
          persistence: getPersistenceStatus(),
          seed: getSeedSummary(),
          repositoryPorts: repositoryPortStatuses,
          endpoints: apiEndpointContracts,
          tables: databaseTables,
        },
      };
    },

    async listPaymentRequests(session: UserSession, businessId: string) {
      requireTenantPermission(session, businessId, session.role === "technician" ? "payments:view_assigned" : "payments:view_all");
      return client.query("select * from payment_requests where business_id = $1 order by created_at desc", [businessId]);
    },
  };
}

export async function writePostgresAuditLog(client: DatabaseClient, audit: AuditLogDraft) {
  await client.query(
    `insert into operational_audit_logs (business_id, actor_user_id, action, entity_type, entity_id, severity, metadata)
     values ($1, $2, $3, $4, $5, $6, $7)`,
    [audit.businessId, audit.actorUserId, audit.action, audit.entityType, audit.entityId, audit.severity, audit.metadata ?? {}],
  );
  return createAuditLog(audit);
}
