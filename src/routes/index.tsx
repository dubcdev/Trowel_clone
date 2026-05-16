import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, RolePill, ScreenHeader } from "@/components/MobileShell";
import {
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CalendarCheck,
  Camera,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  MessageCircle,
  Moon,
  Navigation,
  Phone,
  PhoneIncoming,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useRole } from "@/lib/role";
import { PaymentChip } from "@/components/PaymentStatus";
import { Payment, getPaymentWorkflowSummary, paymentsConnected } from "@/lib/payments";
import { getOnboardingSummary } from "@/lib/onboarding";
import { getCustomerMemorySummary } from "@/lib/customer-memory";
import { NotificationRecord, getDailyDigest, getNotificationSummary, getRecentNotifications } from "@/lib/notifications";
import { getPriorityWorkSummary } from "@/lib/priority-work";

export const Route = createFileRoute("/")({ component: TodayScreen });

function TodayScreen() {
  const { role } = useRole();
  if (role === "technician") return <TechnicianDay />;
  return <OperationsToday role={role} />;
}

function OperationsToday({ role }: { role: string }) {
  const { can, session } = useRole();
  const isOwner = role === "owner";
  const isDispatcher = role === "dispatcher";
  const onboarding = getOnboardingSummary();
  const customerMemory = getCustomerMemorySummary();
  const payments = getPaymentWorkflowSummary();
  const digest = getDailyDigest();
  const notificationSummary = getNotificationSummary();
  const recentNotifications = getRecentNotifications(5);
  const priorityWork = getPriorityWorkSummary();
  const canApproveDispatch = can("dispatch:approve");
  const canManageSettings = can("settings:manage");
  const emergency = priorityWork.emergencyDispatch;
  const nextUpItems = priorityWork.actionItems;

  return (
    <MobileShell>
      <ScreenHeader
        eyebrow="Wednesday - May 13"
        title={isOwner ? `Good morning, ${session.name}` : isDispatcher ? "Dispatch board" : "Front desk"}
        trailing={<RolePill />}
      />

      {can("dispatch:view") && (
        <section className="px-5 mb-4">
          <Link
            to="/dispatch"
            className="block rounded-3xl border border-destructive/25 bg-destructive/[0.055] p-4 dark:bg-destructive/10"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1 rounded-full bg-destructive text-destructive-foreground text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5">
                  <AlertTriangle className="h-3 w-3" /> Needs attention
                </div>
                <h2 className="font-serif text-[25px] mt-2 text-foreground leading-tight">
                  {emergency ? `${emergency.issue.split(" under ")[0]} - repeat customer` : "Emergency needs approval"}
                </h2>
                <p className="text-[13px] text-foreground/75 mt-1 leading-snug">
                  {priorityWork.emergencyNextAction}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 text-[10px] uppercase tracking-wider font-semibold">
                Ready
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-foreground text-background text-[12px] font-medium px-3.5 py-2">
                {canApproveDispatch ? "Approve" : "Review"}
              </span>
              <span className="rounded-full bg-surface text-foreground text-[12px] font-medium px-3.5 py-2 border border-border inline-flex items-center gap-1">
                Details <ChevronRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="px-5">
        <Link to="/notifications" className="block rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[13px] font-semibold text-foreground">Today</div>
              <p className="text-[12px] text-muted-foreground mt-0.5 leading-snug">
                Every call answered. {priorityWork.callsNeedingReviewCount} calls need review.
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                <ArrowUpRight className="h-3.5 w-3.5" />
                zero missed
              </div>
              <div className="font-serif text-[25px] leading-none text-foreground mt-1">$6,240</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-1.5">
            <TodayMetric label="Answered" value={digestValue(digest, "Calls answered", "0")} />
            <TodayMetric label="Booked" value={digestValue(digest, "Jobs booked", String(priorityWork.bookedCallsCount))} />
            <TodayMetric label="After hrs" value={digestValue(digest, "After-hours", "0")} />
            <TodayMetric label="Need OK" value={String(priorityWork.callsNeedingReviewCount)} tone="warn" />
          </div>
        </Link>
      </section>

      <section className="px-5 mt-5">
        <SectionTitle title="Next up" />
        <ul className="rounded-3xl bg-surface border border-border overflow-hidden divide-y divide-border" style={{ boxShadow: "var(--shadow-soft)" }}>
          <NextUpRow
            to="/notifications"
            label="Do first"
            title="Do these first"
            detail={`${nextUpItems.filter((item) => item.priority !== "normal").length} urgent or important items need a person`}
            tone={notificationSummary.urgent > 0 ? "urgent" : "warn"}
          />
          {nextUpItems.map((item) => (
            <NextUpRow
              key={item.id}
              to={item.destination}
              label={item.label}
              title={item.title}
              detail={item.detail}
              tone={item.priority === "urgent" ? "urgent" : item.priority === "important" ? "warn" : "default"}
            />
          ))}
        </ul>
      </section>

      {isOwner && (
        <section className="px-5 mt-5">
          <SectionTitle title="Shortcuts" />
          <div className="grid grid-cols-2 gap-2.5">
            <ShortcutTile to="/dispatch" icon={AlertTriangle} title="Dispatch" sub={appPlural(priorityWork.emergencyDispatch ? 1 : 0, "ready item")} tone="urgent" />
            <ShortcutTile to="/jobs" icon={Wrench} title="Jobs" sub={`${priorityWork.activeJobsCount} today`} />
            <ShortcutTile to="/customers" icon={ShieldCheck} title="Customers" sub={`${customerMemory.repeatIssueFlags} repeat`} />
            <ShortcutTile to="/onboarding" icon={Sparkles} title="Go live" sub={`${onboarding.completion}% done`} />
          </div>
        </section>
      )}

      {!canManageSettings && role !== "technician" && (
        <section className="px-5 mt-5">
          <div className="rounded-2xl bg-warning/12 border border-warning/25 px-3 py-2 text-[11px] text-warning-foreground dark:bg-warning/15 dark:text-amber-100 dark:border-warning/50">
            {session.name} has {role} access. Sensitive setup, team, refunds, and payment policy changes stay owner-only.
          </div>
        </section>
      )}

      <section className="px-5 mt-7 mb-4">
        <SectionTitle title="Recent activity" trailing={<LiveDot />} />
        <ul className="rounded-3xl bg-surface border border-border overflow-hidden divide-y divide-border" style={{ boxShadow: "var(--shadow-soft)" }}>
          {recentNotifications.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      </section>
    </MobileShell>
  );
}

const techJobs: Array<{ time: string; customer: string; trade: string; area: string; status: string; note: string; payment: Payment }> = [
  { time: "9:00 AM", customer: "Erica Patel", trade: "AC tune-up", area: "Fremont - 4.2 mi", status: "Next", note: "Membership customer. Thermostat photos attached.", payment: { status: "deposit_collected", kind: "deposit", amount: 50, detail: "Apple Pay - prepaid" } },
  { time: "11:00 AM", customer: "Angela Brooks", trade: "Burst pipe emergency", area: "Oakland - 9.1 mi", status: "Emergency", note: "Repeat leak. Shutoff confirmed by AI.", payment: { status: "pending", kind: "deposit", amount: 150, detail: "Emergency deposit awaiting owner rule" } },
  { time: "2:00 PM", customer: "Tom Reilly", trade: "Furnace inspection", area: "Newark - 6.4 mi", status: "Scheduled", note: "Worked with Mike last month.", payment: { status: "waived", kind: "diagnostic_fee", amount: 0, detail: "Waived by owner" } },
];

function TechnicianDay() {
  return (
    <MobileShell>
      <ScreenHeader eyebrow="Wednesday - May 13" title="Your day, Diego" trailing={<RolePill />} />

      <section className="px-5">
        <div className="rounded-3xl p-5 text-background" style={{ background: "linear-gradient(140deg, oklch(0.32 0.05 50), oklch(0.22 0.03 60))", boxShadow: "var(--shadow-pop)" }}>
          <div className="text-[10px] uppercase tracking-[0.14em] opacity-70 font-medium">Up next - 9:00 AM</div>
          <div className="font-serif text-[28px] leading-tight mt-1">Erica Patel</div>
          <div className="text-[13px] opacity-85">AC tune-up - Fremont</div>
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-success/25 border border-success/40 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold text-background">
            <CreditCard className="h-3 w-3" /> Prepaid - $50 deposit
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button className="flex-1 rounded-full bg-background text-foreground text-[13px] font-semibold py-2.5 inline-flex items-center justify-center gap-1.5">
              <Navigation className="h-4 w-4" /> Directions
            </button>
            <button className="rounded-full bg-background/15 text-background text-[13px] font-medium px-4 py-2.5 inline-flex items-center gap-1.5 border border-background/20">
              <Phone className="h-4 w-4" /> Call
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] opacity-80">
            <Clock className="h-3 w-3" /> Same technician continuity preferred
          </div>
        </div>
      </section>

      <section className="px-5 mt-6">
        <SectionTitle title="Today's jobs" count={3} />
        <ul className="space-y-3">
          {techJobs.map((j) => {
            const isEmergency = j.status === "Emergency";
            return (
              <li key={j.customer} className="relative rounded-2xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
                {isEmergency && <span className="absolute left-0 top-4 bottom-4 w-1 bg-destructive rounded-r-full" />}
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-medium text-muted-foreground inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {j.time}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 ${isEmergency ? "bg-destructive/10 text-destructive border border-destructive/20" : j.status === "Next" ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary text-secondary-foreground"}`}>
                    {j.status}
                  </span>
                </div>
                <h3 className="font-serif text-[22px] leading-tight mt-1.5 text-foreground">{j.customer}</h3>
                <div className="text-[13px] text-foreground/80">{j.trade}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> {j.area}
                </div>
                <p className="mt-2 text-[12px] text-foreground/70 italic">"{j.note}"</p>
                <div className="mt-2.5"><PaymentChip payment={j.payment} /></div>
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  <TechAction icon={Navigation} label="Go" />
                  <TechAction icon={Phone} label="Call" />
                  <TechAction icon={Camera} label="Photo" />
                  <TechAction icon={CheckCircle2} label="Done" primary />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="px-5 mt-7 mb-4">
        <SectionTitle title="Day stats" />
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="Jobs" value="3" />
          <MiniStat label="Prepaid" value="2" />
          <MiniStat label="Drive" value="19 mi" />
        </div>
      </section>
    </MobileShell>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-3">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="mt-2 font-serif text-2xl text-foreground leading-none">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function TodayMetric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "warn" }) {
  return (
    <div className={`rounded-2xl px-2 py-2.5 text-center ${tone === "warn" ? "bg-warning/12 text-warning-foreground dark:bg-warning/15 dark:text-amber-100" : "bg-surface-2 text-foreground"}`}>
      <div className="font-serif text-[22px] leading-none">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function NextUpRow({
  to,
  label,
  title,
  detail,
  tone = "default",
}: {
  to: string;
  label: string;
  title: string;
  detail: string;
  tone?: "default" | "urgent" | "warn";
}) {
  const dot = tone === "urgent" ? "bg-destructive" : tone === "warn" ? "bg-warning" : "bg-primary";
  return (
    <li>
      <Link to={to} className="flex items-center gap-3 px-4 py-3.5">
        <span className={`h-2 w-2 rounded-full ${dot} shrink-0`} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</span>
            <span className="text-[14px] font-semibold text-foreground truncate">{title}</span>
          </div>
          <div className="text-[12px] text-muted-foreground truncate mt-0.5">{detail}</div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </Link>
    </li>
  );
}

function ShortcutTile({
  to,
  icon: Icon,
  title,
  sub,
  tone = "default",
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  tone?: "default" | "urgent";
}) {
  const iconClass = tone === "urgent" ? "text-destructive bg-destructive/10" : "text-primary bg-primary/10";
  return (
    <Link to={to} className="rounded-2xl bg-surface border border-border p-3.5 flex items-center gap-3" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className={`h-9 w-9 rounded-2xl grid place-items-center ${iconClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-semibold text-foreground truncate">{title}</div>
        <div className="text-[12px] text-muted-foreground truncate">{sub}</div>
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border px-3 py-3" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="font-serif text-xl text-foreground leading-none">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function ControlTile({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: "success" | "warning" | "destructive" | "muted" }) {
  const dot = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : tone === "destructive" ? "bg-destructive" : "bg-muted-foreground/40";
  return (
    <div className="rounded-2xl bg-surface border border-border p-3.5" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="text-[11px] text-muted-foreground">{label}</span>
      </div>
      <div className="font-serif text-[26px] text-foreground leading-none mt-1.5">{value}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function TechAction({ icon: Icon, label, primary }: { icon: React.ComponentType<{ className?: string }>; label: string; primary?: boolean }) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2.5 ${primary ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground"}`}>
      <Icon className="h-4 w-4" />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

function SectionTitle({ title, count, trailing }: { title: string; count?: number; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[13px] font-semibold tracking-tight text-foreground uppercase" style={{ letterSpacing: "0.06em" }}>{title}</h2>
        {count !== undefined && <span className="text-[11px] text-muted-foreground">{count}</span>}
      </div>
      {trailing}
    </div>
  );
}

function LiveDot() {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inset-0 rounded-full bg-primary live-dot" />
        <span className="relative rounded-full bg-primary h-1.5 w-1.5" />
      </span>
      Live
    </div>
  );
}

function AttentionCard({ tone, icon: Icon, tag, title, meta, body, primary }: { tone: "urgent" | "warn"; icon: React.ComponentType<{ className?: string }>; tag: string; title: string; meta: string; body: string; primary: string }) {
  const accent = tone === "urgent" ? { bar: "bg-destructive", chip: "bg-destructive text-destructive-foreground border-destructive" } : { bar: "bg-warning", chip: "bg-warning text-warning-foreground border-warning dark:bg-warning/20 dark:text-amber-100 dark:border-warning/60" };
  return (
    <div className="relative rounded-3xl bg-surface border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
      <span className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${accent.bar}`} />
      <div className="p-4 pl-5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 border ${accent.chip}`}>
            <Icon className="h-3 w-3" />
            {tag}
          </span>
          <span className="text-[11px] text-muted-foreground">{meta}</span>
        </div>
        <h3 className="mt-2 text-[15px] font-semibold text-foreground tracking-tight">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground leading-snug">{body}</p>
        <div className="mt-3 flex items-center gap-2">
          <button className="rounded-full bg-foreground text-background text-[13px] font-medium px-3.5 py-2">{primary}</button>
          <button className="rounded-full bg-secondary text-secondary-foreground text-[13px] font-medium px-3.5 py-2">View</button>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({ item }: { item: NotificationRecord }) {
  const Icon = item.type === "emergency_call" ? AlertTriangle :
    item.type === "payment_collected" || item.type === "payment_failed" ? CreditCard :
    item.type === "booking_conflict" || item.type === "technician_conflict" || item.type === "calendar_sync_failure" ? CalendarCheck :
    item.type === "customer_photo" || item.type === "after_hours_lead" ? Camera :
    item.type === "repeat_issue" ? ShieldCheck :
    CheckCircle2;
  const iconBg = item.priority === "urgent" ? "bg-destructive/12" : item.priority === "important" ? "bg-warning/15" : "bg-primary/12";
  const iconColor = item.priority === "urgent" ? "text-destructive" : item.priority === "important" ? "text-warning-foreground dark:text-amber-100" : "text-primary";
  return (
    <li>
      <Link to={item.destination} className="flex items-center gap-3 px-4 py-3.5">
        <div className={`h-9 w-9 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-medium text-foreground truncate tracking-tight">{item.title}</div>
          <div className="text-[12px] text-muted-foreground truncate">{item.body}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">{item.createdAt}</div>
          <div className="text-[11px] font-medium text-foreground/80 mt-0.5">{item.actionLabel}</div>
        </div>
      </Link>
    </li>
  );
}

function appPlural(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

function digestValue(digest: ReturnType<typeof getDailyDigest>, label: string, fallback: string) {
  return String(digest.metrics.find((metric) => metric.label === label)?.value ?? fallback);
}
