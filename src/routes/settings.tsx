import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, PermissionNotice, RolePill, ScreenHeader } from "@/components/MobileShell";
import {
  Bell,
  Building2,
  Calendar,
  ChevronRight,
  Clock,
  CreditCard,
  Database,
  Headphones,
  LockKeyhole,
  MapPin,
  Mic,
  Phone,
  Shield,
  Siren,
  Users,
  WandSparkles,
} from "lucide-react";
import { PaymentsSetupCard } from "@/components/PaymentStatus";
import { formatAmount, getPaymentWorkflowSummary, paymentAccount, paymentPolicies, paymentsConnected } from "@/lib/payments";
import { appData } from "@/lib/app-data";
import { getSchedulingSummary, scheduleSources } from "@/lib/scheduling";
import { getGoLiveSteps, getOnboardingSummary } from "@/lib/onboarding";
import { ROLES, useRole } from "@/lib/role";
import { permissionLabel } from "@/lib/rbac";
import { a2pComplianceProfile, communicationIdentity, getA2PComplianceSummary, getPhoneProvisioningSummary, phoneProvisioning, twilioIsvArchitecture } from "@/lib/phone-provisioning";
import { getDemoCallReadiness, getEnrichmentSummary } from "@/lib/enrichment";
import { getNotificationSummary, notificationPreferences } from "@/lib/notifications";
import { getBackendReadiness } from "@/lib/backend";
import { getPersistenceStatus, repositoryPortStatuses } from "@/lib/persistence";
import { getSeedSummary } from "@/lib/seed-data";
import { getEntitlementState } from "@/lib/platform-billing";

export const Route = createFileRoute("/settings")({ component: SettingsScreen });

type SettingsCategory = "goLive" | "phone" | "scheduling" | "team" | "payments" | "alerts" | "security";

const groups = [
  {
    title: "Business info",
    items: [
      { icon: Building2, label: "Business profile", value: "Bayview HVAC & Plumbing - confirmed" },
      { icon: MapPin, label: "Service areas", value: "12 ZIP codes - source attached" },
      { icon: Clock, label: "Business hours", value: "Mon-Sat, 7a-7p - owner editable" },
      { icon: WandSparkles, label: "Where we looked", value: "Website, service pages, FAQs, business info" },
    ],
  },
  {
    title: "Front desk behavior",
    items: [
      { icon: Mic, label: "Voice personality", value: "Warm, calm, concise" },
      { icon: Siren, label: "Emergency rules", value: "Burst pipe, burning smell, active leak, lockout" },
      { icon: Bell, label: "Alerts", value: "Phone alerts and texts when help is needed" },
      { icon: Headphones, label: "Demo call", value: "Listen before going live" },
    ],
  },
  {
    title: "Operations",
    items: [
      { icon: Calendar, label: "Scheduling", value: "Google live, backup calendar ready" },
      { icon: Users, label: "Team access", value: "Owner, office manager, dispatcher, technician" },
      { icon: Database, label: "Customer memory", value: "Repeat issues, equipment, visits, preferences" },
      { icon: Phone, label: "Dispatch and customers", value: "Emergency board and customer records available" },
    ],
  },
  {
    title: "Security",
    items: [
      { icon: LockKeyhole, label: "Call notes", value: "Protected and separated by business" },
      { icon: Shield, label: "Change history", value: "Dispatch, setup, calendar, and payment changes" },
      { icon: CreditCard, label: "Stripe Connect", value: "Optional contractor-owned account" },
    ],
  },
];

function SettingsScreen() {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>("goLive");
  const { role, session, permissions, can } = useRole();
  const availableTechnicians = appData.technicians.filter((tech) => tech.status === "available").length;
  const scheduling = getSchedulingSummary();
  const onboarding = getOnboardingSummary();
  const phoneSummary = getPhoneProvisioningSummary();
  const complianceSummary = getA2PComplianceSummary();
  const paymentSummary = getPaymentWorkflowSummary();
  const alertSummary = getNotificationSummary();
  const backendSummary = getBackendReadiness();
  const persistenceSummary = getPersistenceStatus();
  const seedSummary = getSeedSummary();
  const enrichmentSummary = getEnrichmentSummary();
  const demoCall = getDemoCallReadiness();
  const setupSteps = getGoLiveSteps().slice(0, 3);
  const entitlement = getEntitlementState();

  return (
    <MobileShell>
      <ScreenHeader eyebrow="Setup" title="Settings" trailing={<RolePill />} />

      {!can("settings:manage") && (
        <section className="px-5 mb-4">
          <PermissionNotice text={`${session.name} can look at setup, but only the owner can change locked items.`} />
        </section>
      )}

      <section className="px-5">
        <div className="rounded-3xl bg-surface border border-border p-5 flex items-center gap-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center font-serif text-primary text-2xl">B</div>
          <div className="flex-1 min-w-0">
            <div className="text-[16px] font-semibold tracking-tight truncate">Bayview HVAC & Plumbing</div>
            <div className="text-[12px] text-muted-foreground">Hayward, CA - {appData.technicians.length} technicians - {role} account</div>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-semibold rounded-full bg-success/12 border border-success/20 px-2 py-0.5" style={{ color: "oklch(0.4 0.1 155)" }}>
            {entitlement.status === "active" ? "Account active" : "Contact support"}
          </span>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="grid grid-cols-3 gap-2">
          <CategoryButton label="Setup" value={`${onboarding.completion}%`} active={activeCategory === "goLive"} onClick={() => setActiveCategory("goLive")} />
          <CategoryButton label="Phone" value={`${phoneSummary.completion}%`} active={activeCategory === "phone"} onClick={() => setActiveCategory("phone")} />
          <CategoryButton label="Calendar" value={String(scheduling.approvals)} active={activeCategory === "scheduling"} onClick={() => setActiveCategory("scheduling")} />
          <CategoryButton label="Team" value={String(appData.technicians.length)} active={activeCategory === "team"} onClick={() => setActiveCategory("team")} />
          <CategoryButton label="Payments" value={paymentsConnected ? "Live" : "Setup"} active={activeCategory === "payments"} onClick={() => setActiveCategory("payments")} />
          <CategoryButton label="Alerts" value={String(alertSummary.actionNeeded)} active={activeCategory === "alerts"} onClick={() => setActiveCategory("alerts")} />
          <CategoryButton label="Safety" value="Locked" active={activeCategory === "security"} onClick={() => setActiveCategory("security")} />
        </div>
      </section>

      {activeCategory === "scheduling" && <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-foreground">Calendars</div>
              <div className="text-[12px] text-muted-foreground">{scheduling.source.label} is active. {scheduling.approvals} items need an OK.</div>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            {scheduleSources.map((source) => (
              <div key={source.kind} className="rounded-2xl bg-surface-2 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-medium text-foreground">{source.label}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{source.status.replace("_", " ")}</div>
                </div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{source.examples}</div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {activeCategory === "phone" && <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold tracking-tight text-foreground">Turn on phone answering</div>
              <div className="text-[12px] text-muted-foreground mt-0.5">{communicationIdentity.ownerPromise}</div>
            </div>
            <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">
              {phoneSummary.completion}%
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            <CommRow label="Phone setup" value="One phone setup per business" />
            <CommRow label="Shared numbers" value={twilioIsvArchitecture.sharedNumberPoolAllowed ? "Allowed" : "Not allowed"} />
            <CommRow label="Keep public number" value={phoneProvisioning.publicBusinessNumber} />
            <CommRow label="Forward calls to" value={phoneProvisioning.aiVoiceNumber} />
            <CommRow label="Texting number" value={phoneProvisioning.aiTextingNumber} />
            <CommRow label="Texting review" value={`${a2pComplianceProfile.status.replaceAll("_", " ")} - in the background`} />
            <CommRow label="Porting" value="Optional later upgrade, not required for MVP" />
          </div>
          <div className="mt-3 rounded-2xl bg-success/10 border border-success/20 px-3 py-2">
            <div className="text-[12px] font-semibold text-foreground">Phone answering can start before texting is fully approved.</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Texting setup is {complianceSummary.completion}% ready and keeps moving while calls, jobs, customers, and summaries work.
            </div>
          </div>
          <Link to="/onboarding" className="mt-3 flex items-center justify-between rounded-2xl bg-secondary border border-border px-3 py-2">
            <div>
              <div className="text-[13px] font-semibold text-foreground">Open phone setup</div>
              <div className="text-[11px] text-muted-foreground">Forward calls, test a call, and turn on texting.</div>
            </div>
            <ChevronRight className="h-4 w-4 text-primary" />
          </Link>
        </div>
      </section>}

      {activeCategory === "goLive" && <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-foreground">Setup checklist</div>
              <div className="text-[12px] text-muted-foreground">{onboarding.completion}% ready. 2 items need review before launch.</div>
            </div>
            <Link to="/onboarding" className={`rounded-full text-[12px] font-medium px-3 py-1.5 ${can("onboarding:confirm") ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}>
              {can("onboarding:confirm") ? "Go live" : "Review"}
            </Link>
          </div>
          <div className="mt-3 rounded-2xl soft-amber-card border px-3 py-2">
            <div className="text-[12px] font-semibold soft-amber-label">Launch blockers</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Phone is 50% complete. Demo call has not been heard.</div>
          </div>
          <div className="mt-4 space-y-2">
            {setupSteps.map((step) => (
              <div key={step.label} className="flex items-center justify-between rounded-2xl bg-surface-2 px-3 py-2">
                <div className="text-[13px] font-medium text-foreground">{step.label}</div>
                <div className="text-[11px] text-muted-foreground capitalize">{step.status}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <PolicyMetric label="Sources" value={`${enrichmentSummary.sourcesComplete}/${enrichmentSummary.sources}`} />
            <PolicyMetric label="Review" value={String(enrichmentSummary.confirmationNeeded)} />
            <PolicyMetric label="Demo" value={`${demoCall.score}%`} />
          </div>
          <Link to="/onboarding" className="mt-3 flex items-center justify-between rounded-2xl bg-primary/10 border border-primary/20 px-3 py-2">
            <div>
              <div className="text-[13px] font-semibold text-foreground">Open setup helper</div>
              <div className="text-[11px] text-muted-foreground">Check business info, demo call, phone, calendar, and payments.</div>
            </div>
            <ChevronRight className="h-4 w-4 text-primary" />
          </Link>
        </div>
      </section>}

      {activeCategory === "payments" && <section className="px-5 mt-5">
        <div className="space-y-3">
          <PaymentsSetupCard />
          <Link to="/invoices" className="flex items-center justify-between rounded-2xl bg-primary/10 border border-primary/20 px-3 py-2">
            <div>
              <div className="text-[13px] font-semibold text-foreground">Open job invoices</div>
              <div className="text-[11px] text-muted-foreground">Send deposits, service invoices, and payment links to customers.</div>
            </div>
            <ChevronRight className="h-4 w-4 text-primary" />
          </Link>
        </div>
      </section>}

      {activeCategory === "alerts" && <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-foreground">Alerts</div>
              <div className="text-[12px] text-muted-foreground">{alertSummary.actionNeeded} need action. {alertSummary.unread} unread.</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <PolicyMetric label="Urgent" value={String(alertSummary.urgent)} />
            <PolicyMetric label="Unread" value={String(alertSummary.unread)} />
            <PolicyMetric label="Rules" value={String(notificationPreferences.length)} />
          </div>
          <Link to="/notifications" className="mt-3 flex items-center justify-between rounded-2xl bg-primary/10 border border-primary/20 px-3 py-2">
            <div>
              <div className="text-[13px] font-semibold text-foreground">Open alerts</div>
              <div className="text-[11px] text-muted-foreground">See emergencies, payment updates, booking holds, and sync problems.</div>
            </div>
            <ChevronRight className="h-4 w-4 text-primary" />
          </Link>
        </div>
      </section>}

      {activeCategory === "team" && <section className="px-5 mt-5 grid grid-cols-2 gap-3">
        <Link to="/team" className="rounded-2xl bg-surface border border-border p-3.5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <Users className="h-4 w-4 text-primary" />
          <div className="font-serif text-[21px] leading-none mt-2 text-foreground">Team</div>
          <div className="text-[11px] text-muted-foreground mt-1">{appData.technicians.length} technicians - {availableTechnicians} available</div>
        </Link>
        <Link to="/dispatch" className="rounded-2xl bg-surface border border-border p-3.5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <Siren className="h-4 w-4 text-destructive" />
          <div className="font-serif text-[21px] leading-none mt-2 text-foreground">Dispatch</div>
          <div className="text-[11px] text-muted-foreground mt-1">{appData.dispatchEvents.length} approvals waiting</div>
        </Link>
      </section>}

      {activeCategory === "team" && <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-foreground">Who can do what</div>
              <div className="text-[12px] text-muted-foreground">Current session: {session.name} - {ROLES.find((item) => item.id === role)?.label}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {ROLES.map((item) => (
              <div key={item.id} className={`rounded-2xl border px-3 py-2 ${item.id === role ? "bg-primary/10 border-primary/25" : "bg-surface-2 border-border"}`}>
                <div className="text-[13px] font-semibold text-foreground">{item.label}</div>
                <div className="text-[11px] text-muted-foreground">{item.sub}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-2xl bg-surface-2 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">This person can</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {permissions.slice(0, 10).map((permission) => (
                <span key={permission} className="rounded-full bg-secondary border border-border px-2 py-0.5 text-[10px] text-foreground/75">
                  {permissionLabel(permission)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>}

      {activeCategory === "payments" && <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-foreground">Payment rules</div>
              <div className="text-[12px] text-muted-foreground">{paymentsConnected ? "Payments are live" : paymentAccount.onboardingStatus.replaceAll("_", " ")} - Trowel only asks for prices the owner approved.</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <PolicyMetric label="Requests" value={String(paymentSummary.paymentRequests)} />
            <PolicyMetric label="Collected" value={formatAmount(paymentSummary.collected)} />
            <PolicyMetric label="Approval" value={String(paymentSummary.approvalNeeded)} />
          </div>
          <div className="mt-3 space-y-2">
            {paymentPolicies.map((policy) => (
              <div key={policy.id} className="rounded-2xl bg-surface-2 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-medium text-foreground">{policy.name}</div>
                  <div className="text-[11px] text-muted-foreground">{policy.amount > 0 ? formatAmount(policy.amount) : "No charge"}</div>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold">
                  <span className={`rounded-full border px-2 py-0.5 ${policy.ownerConfirmed ? "bg-success/12 text-success border-success/25" : "bg-warning/15 text-warning-foreground border-warning/30 dark:bg-warning/20 dark:text-amber-100 dark:border-warning/60"}`}>
                    {policy.ownerConfirmed ? "Confirmed" : "Needs approval"}
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 ${policy.aiMayRequest ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary text-foreground/70 border-border"}`}>
                    {policy.aiMayRequest ? "AI may request" : "AI must hold"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>}

      {activeCategory === "security" && <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold tracking-tight text-foreground">Backend storage</div>
              <div className="text-[12px] text-muted-foreground">Mock data is active. Database schema and seed records are staged.</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <PolicyMetric label="Mode" value={persistenceSummary.mode} />
            <PolicyMetric label="Seed" value={String(seedSummary.records)} />
            <PolicyMetric label="Ports" value={String(persistenceSummary.repositoryPorts)} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <PolicyMetric label="APIs" value={String(backendSummary.apiContracts)} />
            <PolicyMetric label="Tables" value={String(backendSummary.databaseTables)} />
            <PolicyMetric label="Guards" value={String(backendSummary.tenantGuardedReads)} />
          </div>
          <div className="mt-3 rounded-2xl bg-surface-2 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Repository status</div>
            <div className="mt-2 space-y-1.5">
              {repositoryPortStatuses.slice(0, 5).map((repo) => (
                <div key={repo.name} className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-foreground capitalize">{repo.name.replaceAll("_", " ")}</span>
                  <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">{repo.mode}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-[12px] leading-snug text-muted-foreground">{persistenceSummary.nextStep}</p>
        </div>
      </section>}

      {(activeCategory === "goLive" ? groups.filter((g) => g.title === "Business info" || g.title === "Front desk behavior") : activeCategory === "security" ? groups.filter((g) => g.title === "Security" || g.title === "Operations") : []).map((g) => (
        <section key={g.title} className="px-5 mt-7">
          <h2 className="text-[13px] font-semibold uppercase text-foreground mb-3" style={{ letterSpacing: "0.06em" }}>
            {g.title}
          </h2>
          <ul className="rounded-3xl bg-surface border border-border overflow-hidden divide-y divide-border" style={{ boxShadow: "var(--shadow-soft)" }}>
            {g.items.map((it) => {
              const Icon = it.icon;
              return (
                <li key={it.label} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5 text-foreground/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-foreground tracking-tight">{it.label}</div>
                    <div className="text-[12px] text-muted-foreground truncate">{it.value}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="px-5 mt-8 mb-2 text-center text-[11px] text-muted-foreground">
        Trowel - v1.0 - A dependable front desk employee inside your phone.
      </div>
    </MobileShell>
  );
}

function CommRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-3 py-2">
      <div className="text-[12px] text-muted-foreground">{label}</div>
      <div className="text-[13px] font-medium text-foreground text-right">{value}</div>
    </div>
  );
}

function CategoryButton({ label, value, active, onClick }: { label: string; value: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border px-3 py-3 text-left transition-colors ${active ? "soft-selected-card" : "bg-surface text-foreground border-border"}`}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="font-serif text-[19px] leading-none truncate text-foreground">{value}</div>
      <div className={`text-[10px] uppercase tracking-wider mt-1 ${active ? "soft-selected-label" : "text-muted-foreground"}`}>{label}</div>
    </button>
  );
}

function PolicyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-2">
      <div className="font-serif text-[19px] leading-none text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
