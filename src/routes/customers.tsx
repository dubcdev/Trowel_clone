import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { AlertTriangle, ChevronRight, Clock, Search, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";
import { appData } from "@/lib/app-data";
import { Avatar, BadgeChip, SentimentDot } from "@/components/CustomerBadges";
import { Customer } from "@/lib/customers";
import { CustomerMemoryRecord, getCustomerMemoryRecords, getCustomerMemorySummary } from "@/lib/customer-memory";

export const Route = createFileRoute("/customers")({ component: CustomersScreen });

type CustomerView = "all" | "unresolved" | "repeat" | "vip" | "emergency";

function CustomersScreen() {
  const { pathname } = useLocation();
  const [activeView, setActiveView] = useState<CustomerView>("unresolved");
  if (pathname !== "/customers") return <Outlet />;

  const customers = appData.customers;
  const memoryRecords = getCustomerMemoryRecords();
  const memoryByCustomer = new Map(memoryRecords.map((record) => [record.customer.id, record]));
  const memorySummary = getCustomerMemorySummary();
  const needsAttention = customers.filter((c) => c.memoryScores.unresolved >= 70 || c.memoryScores.callbackRisk >= 70 || c.sentiment === "unhappy");
  const openIssues = customers.filter((c) => c.unresolved).length;
  const repeatIssues = customers.filter((c) => c.memoryScores.repeatIssue >= 50).length;
  const filteredCustomers = getCustomerRows(activeView, customers, needsAttention);
  const viewCopy = getCustomerViewCopy(activeView);

  return (
    <MobileShell>
      <ScreenHeader eyebrow="Saved customer notes" title="Customers" />

      <section className="px-5">
        <div className="rounded-3xl bg-surface border border-border p-4 mb-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="grid grid-cols-3 gap-2">
            <MemoryStat label="Customers" value={String(customers.length)} />
            <MemoryStat label="Open issues" value={String(openIssues)} tone="warning" />
            <MemoryStat label="Repeat risk" value={String(repeatIssues)} tone="destructive" />
          </div>
          <div className="mt-3 rounded-2xl bg-surface-2 px-3 py-2">
            <div className="flex items-center gap-2 text-[12px] text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {memorySummary.contextPacksReady} saved notes ready
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
              Trowel remembers open problems, recent jobs, repeat issues, preferred techs, emergencies, and contact preferences.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-surface border border-border px-3.5 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search name, address, problem, or phone" className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground" />
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          <FilterChip label="Needs review" value={needsAttention.length} active={activeView === "unresolved"} onClick={() => setActiveView("unresolved")} />
          <FilterChip label="Repeat" value={repeatIssues} active={activeView === "repeat"} onClick={() => setActiveView("repeat")} />
          <FilterChip label="Emergency" value={customers.filter((c) => c.badges.includes("Emergency History")).length} active={activeView === "emergency"} onClick={() => setActiveView("emergency")} />
          <FilterChip label="VIP" value={customers.filter((c) => c.membershipStatus !== "None").length} active={activeView === "vip"} onClick={() => setActiveView("vip")} />
          <FilterChip label="All" value={customers.length} active={activeView === "all"} onClick={() => setActiveView("all")} />
        </div>
      </section>

      <section className="px-5 mt-5 mb-4">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <div>
            <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground">{viewCopy.title}</h2>
            <div className="text-[12px] text-muted-foreground mt-0.5">{viewCopy.sub}</div>
          </div>
        </div>
        <ul className="space-y-2.5">
          {filteredCustomers.map((c) => <CustomerRow key={c.id} c={c} record={memoryByCustomer.get(c.id)} urgent={needsAttention.includes(c)} />)}
        </ul>
      </section>
    </MobileShell>
  );
}

function FilterChip({ label, value, active, onClick }: { label: string; value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full text-[12px] font-medium px-3.5 py-1.5 border transition-colors ${active ? "soft-selected-card" : "bg-surface text-foreground border-border"}`}
    >
      {value} {label}
    </button>
  );
}

function getCustomerRows(view: CustomerView, customers: Customer[], needsAttention: Customer[]) {
  if (view === "unresolved") return needsAttention;
  if (view === "repeat") return customers.filter((c) => c.memoryScores.repeatIssue >= 50);
  if (view === "vip") return customers.filter((c) => c.membershipStatus !== "None");
  if (view === "emergency") return customers.filter((c) => c.badges.includes("Emergency History"));
  return customers;
}

function getCustomerViewCopy(view: CustomerView) {
  if (view === "repeat") return { title: "Repeat problems", sub: "Customers who may be calling about the same issue again." };
  if (view === "vip") return { title: "Members", sub: "Customers who may get priority or special handling." };
  if (view === "emergency") return { title: "Past emergencies", sub: "Customers who had urgent calls before." };
  if (view === "all") return { title: "All customers", sub: "Everyone in your customer list." };
  return { title: "Open issues", sub: "Customers to review before booking or dispatching." };
}

function CustomerRow({ c, record, urgent }: { c: Customer; record?: CustomerMemoryRecord; urgent?: boolean }) {
  const topScore = record
    ? Math.max(record.detection.unresolvedIssueScore, record.detection.callbackRiskScore, record.detection.customerFrustrationScore)
    : Math.max(c.memoryScores.repeatIssue, c.memoryScores.callbackRisk, c.memoryScores.frustration, c.memoryScores.unresolved);
  const topSignal = record?.contextPack.retrievedSignals[0];
  return (
    <li>
      <Link to="/customers/$customerId" params={{ customerId: c.id }} className="block rounded-2xl bg-surface border border-border p-3.5 relative overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
        {urgent && <span className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-destructive" />}
        <div className="flex items-center gap-3">
          <Avatar initials={c.initials} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[15px] font-semibold text-foreground tracking-tight truncate">{c.name}</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
            <div className="text-[12px] text-muted-foreground truncate">{c.city} - {c.jobsCount} jobs - {c.lifetimeValue}</div>
            <div className="mt-1 flex items-center gap-2">
              <SentimentDot sentiment={c.sentiment} />
              <span className="text-[11px] text-muted-foreground">- {c.lastInteraction}</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-[1fr_auto] gap-2 items-start">
          <div className="rounded-2xl bg-surface-2 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              <UserRoundCheck className="h-3 w-3" />
              Open issue
            </div>
            <p className="text-[12px] text-foreground/80 leading-snug mt-0.5">{topSignal?.action ?? c.nextBestAction}</p>
          </div>
          <RiskPill score={topScore} />
        </div>

        {c.badges.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <BadgeChip badge={c.badges[0]} />
          </div>
        )}

        {(c.recurringIssue || c.unresolved) && (
          <div className="mt-2">
            <PatternLine icon={c.recurringIssue ? AlertTriangle : Clock} label={c.recurringIssue ? "Repeat" : "Open"} text={c.recurringIssue ?? c.unresolved ?? ""} />
          </div>
        )}
      </Link>
    </li>
  );
}

function MemoryStat({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warning" | "destructive" }) {
  const color = tone === "destructive" ? "text-destructive" : tone === "warning" ? "text-warning-foreground dark:text-amber-100" : "text-foreground";
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-3 text-center">
      <div className={`font-serif text-2xl leading-none ${color}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function RiskPill({ score }: { score: number }) {
  const tone = score >= 80 ? "bg-destructive/10 text-destructive border-destructive/20" : score >= 50 ? "bg-warning/15 text-warning-foreground border-warning/30 dark:bg-warning/20 dark:text-amber-100 dark:border-warning/60" : "bg-success/12 text-success border-success/20";
  return (
    <span className={`inline-flex flex-col items-center justify-center rounded-2xl border px-2.5 py-2 min-w-14 ${tone}`}>
      <span className="font-serif text-[20px] leading-none">{score}</span>
      <span className="text-[9px] uppercase tracking-wider font-semibold mt-0.5">risk</span>
    </span>
  );
}

function PatternLine({ icon: Icon, label, text }: { icon: React.ComponentType<{ className?: string }>; label: string; text: string }) {
  return (
    <p className="text-[12px] text-foreground/75 leading-snug flex gap-1.5">
      <Icon className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
      <span><span className="font-medium text-foreground">{label}:</span> {text}</span>
    </p>
  );
}
