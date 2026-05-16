import type { ApiEndpointContract, BackendReadiness } from "@/lib/backend";
import type { Customer } from "@/lib/customers";
import type { DailyDigest, NotificationRecord } from "@/lib/notifications";
import type { DispatchEvent, ScheduledJob, Technician } from "@/lib/operations";
import type { ConversationRecord } from "@/lib/voice-sms";
import type { OnboardingCard, GoLiveStep } from "@/lib/onboarding";
import type { PersistenceStatus, RepositoryPortStatus } from "@/lib/persistence";
import type { EntitlementState } from "@/lib/platform-billing";

export type ApiEnvelope<T> =
  | {
      ok: true;
      data: T;
      meta: {
        businessId: string;
        source: "mock" | "database" | "live";
      };
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

export type MobileSnapshotPayload = {
  business: {
    id: string;
    name: string;
    location: string;
    status: string;
  };
  counts: Record<string, number>;
  dailyDigest: DailyDigest;
  backend: BackendReadiness;
  entitlement: EntitlementState;
};

export type MePayload = {
  userId: string;
  name: string;
  role: string;
  businessId: string;
  entitlement: EntitlementState;
};

export type CallsPayload = {
  summary: Record<string, string | number | boolean>;
  conversations: ConversationRecord[];
};

export type DispatchPayload = {
  summary: Record<string, string | number | boolean>;
  dispatchEvents: DispatchEvent[];
  technicians: Technician[];
};

export type TeamPayload = {
  technicians: Technician[];
  counts: {
    total: number;
    available: number;
    emergencyEligible: number;
    onJob: number;
  };
};

export type OnboardingPayload = {
  summary: Record<string, string | number | boolean>;
  phone: Record<string, string | number | boolean>;
  enrichment: Record<string, string | number | boolean>;
  cards: OnboardingCard[];
  goLiveSteps: GoLiveStep[];
};

export type SettingsReadinessPayload = {
  backend: BackendReadiness;
  persistence: PersistenceStatus;
  seed: {
    businessId: string;
    records: number;
    tables: number;
    tableCounts: Record<string, number>;
    readyForDatabaseLoad: boolean;
  };
  repositoryPorts: RepositoryPortStatus[];
  endpoints: ApiEndpointContract[];
  tables: readonly string[];
};

export const mobileApi = {
  me: () => getJson<MePayload>("/api/me"),
  entitlements: () => getJson<EntitlementState>("/api/me/entitlements"),
  snapshot: () => getJson<MobileSnapshotPayload>("/api/mobile/snapshot"),
  customers: () => getJson<Customer[]>("/api/customers"),
  jobs: () => getJson<ScheduledJob[]>("/api/jobs"),
  calls: () => getJson<CallsPayload>("/api/calls"),
  dispatch: () => getJson<DispatchPayload>("/api/dispatch"),
  team: () => getJson<TeamPayload>("/api/team"),
  onboarding: () => getJson<OnboardingPayload>("/api/onboarding"),
  notifications: () => getJson<{ summary: Record<string, number | boolean>; notifications: NotificationRecord[] }>("/api/notifications"),
  settingsReadiness: () => getJson<SettingsReadinessPayload>("/api/settings/readiness"),
};

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!payload.ok) {
    throw new Error(payload.error.message);
  }

  return payload.data;
}
