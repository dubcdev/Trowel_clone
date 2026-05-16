import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import {
  AlertTriangle,
  Calendar,
  Camera,
  ChevronLeft,
  Clock,
  FileText,
  MapPin,
  MessageCircle,
  MessageSquare,
  NotebookPen,
  Phone,
  PhoneCall,
  ShieldAlert,
  Sparkles,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import { Customer, getCustomer, TimelineEvent, TimelineKind } from "@/lib/customers";
import { Avatar, BadgeChip, SentimentDot } from "@/components/CustomerBadges";
import { PaymentCard } from "@/components/PaymentStatus";
import { Payment } from "@/lib/payments";
import { getCustomerMemoryRecord } from "@/lib/customer-memory";

const customerPayments: Record<string, Payment> = {
  "angela-brooks": { status: "pending", kind: "emergency_deposit", amount: 150, detail: "Rule requires owner approval before request", when: "4 min ago" },
  "tom-reilly": { status: "pending", kind: "invoice", amount: 129, detail: "Refund request flagged - owner review", when: "Yesterday" },
  "erica-patel": { status: "deposit_collected", kind: "deposit", amount: 50, detail: "Apple Pay - ending 4242", when: "Today 9:21am" },
  "daniel-wu": { status: "not_required", kind: "diagnostic_fee", amount: 0, detail: "Escalated before payment because safety is unclear" },
  "lily-park": { status: "paid", kind: "diagnostic_fee", amount: 89, detail: "Google Pay", when: "Yesterday" },
  "carlos-mendez": { status: "not_requested", kind: "deposit", amount: 0, detail: "Awaiting callback before requesting deposit" },
};

export const Route = createFileRoute("/customers/$customerId")({
  component: CustomerProfile,
  loader: ({ params }) => {
    const c = getCustomer(params.customerId);
    if (!c) throw notFound();
    return { customer: c };
  },
  notFoundComponent: () => (
    <MobileShell>
      <div className="px-5 py-10 text-center">
        <p className="text-foreground">Customer not found.</p>
        <Link to="/customers" className="text-primary text-sm mt-2 inline-block">Back to customers</Link>
      </div>
    </MobileShell>
  ),
});

function CustomerProfile() {
  const { customer: c } = Route.useLoaderData() as { customer: Customer };
  const memoryRecord = getCustomerMemoryRecord(c.id);

  return (
    <MobileShell>
      <div className="px-5 pt-4">
        <Link to="/customers" className="inline-flex items-center gap-1 text-[13px] text-muted-foreground">
          <ChevronLeft className="h-4 w-4" /> Customers
        </Link>
      </div>

      <section className="px-5 mt-3">
        <div className="rounded-3xl bg-surface border border-border p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start gap-3.5">
            <Avatar initials={c.initials} size={56} />
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-[28px] leading-tight text-foreground">{c.name}</h1>
              <div className="text-[12px] text-muted-foreground mt-0.5">
                Since {c.sinceYear} - {c.jobsCount} jobs - {c.lifetimeValue}
              </div>
              <div className="mt-1.5"><SentimentDot sentiment={c.sentiment} /></div>
            </div>
          </div>

          {c.badges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.badges.map((b) => <BadgeChip key={b} badge={b} />)}
            </div>
          )}

          <div className="mt-4 grid grid-cols-3 gap-2">
            <QuickAction icon={Phone} label="Call" />
            <QuickAction icon={MessageSquare} label="Text" />
            <QuickAction icon={Calendar} label="Book" primary />
          </div>

          <div className="mt-4 pt-4 border-t border-border space-y-1.5">
            <Row icon={Phone} text={c.phone} sub={`Prefers ${c.communicationPreference}`} />
            <Row icon={MapPin} text={c.serviceAddress} sub="Service address" />
            {c.preferredTech && <Row icon={Wrench} text={`Favorite tech - ${c.preferredTech}`} sub="Use the same tech when possible" />}
          </div>
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-2xl bg-primary/10 grid place-items-center">
              <UserRoundCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-foreground">Saved notes</div>
              <div className="text-[12px] text-muted-foreground">Used to remember jobs, not private chatter.</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <Score label="Repeat" value={c.memoryScores.repeatIssue} />
            <Score label="Callback" value={c.memoryScores.callbackRisk} />
            <Score label="Frustration" value={c.memoryScores.frustration} />
            <Score label="Open" value={c.memoryScores.unresolved} />
          </div>
          <div className="mt-3 rounded-2xl bg-surface-2 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Next best action</div>
            <p className="text-[13px] text-foreground/85 leading-snug mt-0.5">{c.nextBestAction}</p>
          </div>
          <div className="mt-2 rounded-2xl bg-surface-2 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Dispatch note</div>
            <p className="text-[13px] text-foreground/85 leading-snug mt-0.5">{c.dispatchNote}</p>
          </div>
        </div>
      </section>

      {memoryRecord && (
        <section className="px-5 mt-5">
          <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="flex items-center justify-between gap-3">
              <div>
              <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-primary">What Trowel remembers</div>
                <h2 className="font-serif text-[22px] leading-tight text-foreground mt-0.5">What the receptionist should know</h2>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold border ${
                memoryRecord.contextPack.escalationRequired
                  ? "bg-destructive/10 text-destructive border-destructive/25"
                  : "bg-success/12 text-success border-success/20"
              }`}>
                {memoryRecord.contextPack.escalationRequired ? "Needs help" : "Safe"}
              </span>
            </div>

            <p className="mt-3 rounded-2xl bg-surface-2 px-3 py-2 text-[13px] text-foreground/80 leading-snug">
              {memoryRecord.contextPack.greetingContext}
            </p>

            <div className="mt-3 space-y-2">
              {memoryRecord.contextPack.retrievedSignals.slice(0, 4).map((signal) => (
                <div key={`${signal.type}-${signal.label}`} className="rounded-2xl border border-border bg-background/35 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                      P{signal.priority} - {signal.type.replaceAll("_", " ")}
                    </div>
                    <div className="font-serif text-[18px] leading-none text-foreground">{signal.score}</div>
                  </div>
                  <div className="mt-0.5 text-[13px] text-foreground leading-snug">{signal.label}</div>
                  <div className="mt-1 text-[12px] text-muted-foreground leading-snug">{signal.action}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <MemoryMetric label="Callback" value={memoryRecord.detection.callbackRiskScore} />
              <MemoryMetric label="Unresolved" value={memoryRecord.detection.unresolvedIssueScore} />
            </div>

            <div className="mt-3 rounded-2xl soft-amber-card border px-3 py-2">
              <div className="text-[11px] uppercase tracking-wider font-semibold soft-amber-label">Do not say</div>
              <p className="mt-0.5 text-[12px] text-foreground/75 leading-snug">{memoryRecord.contextPack.suppressedContext.join(" ")}</p>
            </div>
          </div>
        </section>
      )}

      {c.aiMemoryHints.length > 0 && (
        <section className="px-5 mt-5">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground">What Trowel can say</h2>
          </div>
          <div
            className="rounded-3xl border border-primary/20 bg-primary/5 p-4 space-y-2.5 dark:bg-surface dark:border-primary/35"
            style={{ boxShadow: "var(--shadow-glass)" }}
          >
            {c.aiMemoryHints.map((h) => (
              <p key={h} className="text-[13.5px] text-foreground leading-snug italic dark:text-foreground">
                <span className="text-primary font-semibold not-italic dark:text-blue-200">Trowel - </span>"{h}"
              </p>
            ))}
          </div>
        </section>
      )}

      {(c.activeJob || c.recurringIssue || c.unresolved) && (
        <section className="px-5 mt-5">
          <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground mb-2.5">Open work</h2>
          <div className="space-y-2.5">
            {c.activeJob && <PatternCard tone="primary" icon={Clock} tag="Active job" body={c.activeJob} />}
            {c.recurringIssue && <PatternCard tone="destructive" icon={ShieldAlert} tag="Repeat issue" body={c.recurringIssue} />}
            {c.unresolved && <PatternCard tone="warning" icon={NotebookPen} tag="Unresolved" body={c.unresolved} />}
          </div>
        </section>
      )}

      {c.equipment.length > 0 && (
        <section className="px-5 mt-5">
          <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-2.5">Equipment and service history</h2>
          <ul className="rounded-2xl bg-surface border border-border overflow-hidden divide-y divide-border" style={{ boxShadow: "var(--shadow-soft)" }}>
            {c.equipment.map((e) => (
              <li key={e.label} className="flex items-center gap-3 px-4 py-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 grid place-items-center">
                  <Wrench className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium text-foreground truncate">{e.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{e.meta}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {customerPayments[c.id] && (
        <section className="px-5 mt-5">
          <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-2.5">Payments</h2>
          <PaymentCard payment={customerPayments[c.id]} />
        </section>
      )}

      <section className="px-5 mt-6 mb-6">
        <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-3">Conversation and visit timeline</h2>
        <ol className="relative">
          <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
          {c.timeline.map((t) => <TimelineRow key={t.id} event={t} />)}
        </ol>
      </section>
    </MobileShell>
  );
}

function Row({ icon: Icon, text, sub }: { icon: React.ComponentType<{ className?: string }>; text: string; sub?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-[13.5px] text-foreground truncate">{text}</div>
        {sub && <div className="text-[11px] text-muted-foreground truncate">{sub}</div>}
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, primary }: { icon: React.ComponentType<{ className?: string }>; label: string; primary?: boolean }) {
  return (
    <button className={`flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[13px] font-medium ${primary ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-destructive" : value >= 50 ? "text-warning-foreground dark:text-amber-100" : "text-success";
  return (
    <div className="rounded-2xl bg-surface-2 px-2 py-2 text-center">
      <div className={`font-serif text-[22px] leading-none ${color}`}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MemoryMetric({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-destructive" : value >= 50 ? "text-warning-foreground dark:text-amber-100" : "text-success";
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-2">
      <div className={`font-serif text-[24px] leading-none ${color}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function PatternCard({ tone, icon: Icon, tag, body }: { tone: "primary" | "destructive" | "warning"; icon: React.ComponentType<{ className?: string }>; tag: string; body: string }) {
  const cls = tone === "destructive" ? "border-destructive/25 bg-destructive/5" : tone === "warning" ? "soft-amber-card" : "border-primary/20 bg-primary/5";
  const chip = tone === "destructive" ? "bg-destructive/10 text-destructive border-destructive/25" : tone === "warning" ? "soft-amber-chip" : "bg-primary/10 text-primary border-primary/20";
  return (
    <div className={`rounded-2xl border p-3.5 ${cls}`}>
      <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 border ${chip}`}>
        <Icon className="h-3 w-3" /> {tag}
      </span>
      <p className="mt-1.5 text-[13px] text-foreground leading-snug">{body}</p>
    </div>
  );
}

const kindMeta: Record<TimelineKind, { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }> = {
  call: { icon: PhoneCall, bg: "bg-primary/10", color: "text-primary" },
  text: { icon: MessageCircle, bg: "bg-accent", color: "text-accent-foreground" },
  visit: { icon: Wrench, bg: "bg-success/15", color: "text-success" },
  estimate: { icon: FileText, bg: "bg-secondary", color: "text-foreground/70" },
  photo: { icon: Camera, bg: "bg-secondary", color: "text-foreground/70" },
  note: { icon: NotebookPen, bg: "bg-secondary", color: "text-foreground/70" },
  escalation: { icon: ShieldAlert, bg: "bg-destructive/10", color: "text-destructive" },
};

function TimelineRow({ event }: { event: TimelineEvent }) {
  const m = kindMeta[event.kind];
  const Icon = m.icon;
  return (
    <li className="relative pl-10 pb-4">
      <span className={`absolute left-0 top-0 h-8 w-8 rounded-full ${m.bg} grid place-items-center border border-border`}>
        <Icon className={`h-4 w-4 ${m.color}`} />
      </span>
      <div className="text-[11px] text-muted-foreground">{event.when}</div>
      <div className="text-[14px] font-medium text-foreground tracking-tight mt-0.5">{event.title}</div>
      {event.detail && <p className="text-[12.5px] text-foreground/70 leading-snug mt-0.5">{event.detail}</p>}
      {event.technician && (
        <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <Wrench className="h-3 w-3" /> {event.technician}
        </div>
      )}
    </li>
  );
}
