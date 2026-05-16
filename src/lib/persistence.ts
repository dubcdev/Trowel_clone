export type PersistenceMode = "mock" | "database";
export type RepositoryHealth = "active" | "ready" | "pending";

export type RepositoryPortStatus = {
  name: string;
  mode: PersistenceMode;
  health: RepositoryHealth;
  reads: boolean;
  writes: boolean;
  nextStep: string;
};

export type PersistenceStatus = {
  mode: PersistenceMode;
  configuredMode: PersistenceMode;
  databaseReady: boolean;
  databaseConfigured: boolean;
  seedReady: boolean;
  repositoryPorts: number;
  activeRepositoryPorts: number;
  pendingRepositoryPorts: number;
  nextStep: string;
};

export type RepositoryAdapter<T> = {
  mode: PersistenceMode;
  implementation: T;
};

const configuredMode: PersistenceMode = readConfiguredMode();

export const repositoryPortStatuses: RepositoryPortStatus[] = [
  port("customers", true, false, "Persist customer memory, repeat issue flags, and technician continuity reads."),
  port("calls_conversations", true, false, "Persist voice/SMS turns, transcript metadata, summaries, and media references."),
  port("jobs", true, true, "Persist job status transitions and appointment history."),
  port("dispatch_events", true, true, "Persist emergency approvals, ETA recommendations, overrides, and audit links."),
  port("technicians", true, false, "Persist shifts, status, PTO, emergency eligibility, and service areas."),
  port("payments", true, true, "Persist payment requests, provider IDs, webhook events, waivers, and refunds."),
  port("notifications", true, true, "Persist push/SMS delivery state, opened/actioned events, and preferences."),
  port("onboarding", true, true, "Persist enriched fields, owner confirmations, phone setup, and compliance state."),
  port("audit_logs", true, true, "Write every sensitive operational action into append-only audit storage."),
];

export function selectRepository<T>(mockImplementation: T, databaseImplementation?: T): RepositoryAdapter<T> {
  if (configuredMode === "database") {
    if (!databaseImplementation) {
      throw new Error("Database repository mode is configured, but the PostgreSQL adapter is not connected yet.");
    }

    return {
      mode: "database",
      implementation: databaseImplementation,
    };
  }

  return {
    mode: "mock",
    implementation: mockImplementation,
  };
}

export function getPersistenceStatus(): PersistenceStatus {
  const activeRepositoryPorts = repositoryPortStatuses.filter((repo) => repo.health === "active").length;
  const pendingRepositoryPorts = repositoryPortStatuses.filter((repo) => repo.health === "pending").length;
  const databaseConfigured = false;

  return {
    mode: configuredMode,
    configuredMode,
    databaseReady: configuredMode === "database" && databaseConfigured,
    databaseConfigured,
    seedReady: true,
    repositoryPorts: repositoryPortStatuses.length,
    activeRepositoryPorts,
    pendingRepositoryPorts,
    nextStep: "Connect a PostgreSQL client, run migrations, load seed records, then switch repositories from mock to database mode.",
  };
}

function readConfiguredMode(): PersistenceMode {
  const envMode = import.meta.env.VITE_TROWEL_REPOSITORY_MODE;
  return envMode === "database" ? "database" : "mock";
}

function port(name: string, reads: boolean, writes: boolean, nextStep: string): RepositoryPortStatus {
  return {
    name,
    mode: configuredMode,
    health: "active",
    reads,
    writes,
    nextStep,
  };
}
