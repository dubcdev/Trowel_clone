import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  FileText,
  MessageCircle,
  Moon,
  PhoneIncoming,
  PhoneMissed,
  Search,
  UserRoundCheck,
} from "lucide-react";
import { PaymentChip } from "@/components/PaymentStatus";
import { Payment } from "@/lib/payments";
import { ConversationRecord, conversations, getOperationalConversationContext, getVoiceSmsSummary } from "@/lib/voice-sms";
import { needsConversationReview } from "@/lib/priority-work";

export const Route = createFileRoute("/calls")({ component: CallsScreen });

type Status = "Booked" | "Escalated" | "Captured" | "Missed" | "Follow-up";
type CallFilter = "review" | "booked" | "escalated" | "all";

type Call = {
  name: string;
  meta: string;
  summary: string;
  memory: string;
  time: string;
  status: Status;
  score: string;
  payment?: Payment;
};

function CallsScreen() {
  const [activeFilter, setActiveFilter] = useState<CallFilter>("review");
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const summary = getVoiceSmsSummary();
  const callRows = conversations.map((conversation) => ({ conversation, call: toCall(conversation) }));
  const needsReview = callRows.filter(({ conversation }) => needsHumanReview(conversation));
  const booked = callRows.filter(({ conversation }) => conversation.status === "booked");
  const escalated = callRows.filter(({ conversation }) => conversation.escalation?.required);
  const mostImportant = needsReview[0];
  const activeRows = getFilteredRows(activeFilter, { needsReview, booked, escalated, all: callRows });
  const activeCopy = getFilterCopy(activeFilter);

  return (
    <MobileShell>
      <ScreenHeader eyebrow="Phone calls" title="Calls" />

      <section className="px-5">
        <div className="rounded-3xl bg-surface border border-border p-4 mb-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">Start here</div>
              <h2 className="font-serif text-[28px] leading-tight text-foreground mt-1">{needsReview.length} calls need help</h2>
              <p className="text-[12px] text-muted-foreground mt-1 leading-snug">
                These calls need a person to check them.
              </p>
            </div>
            <div className="h-11 w-11 rounded-2xl bg-primary/10 grid place-items-center shrink-0">
              <PhoneIncoming className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            <HealthStat label="Answered" value={String(summary.answered)} />
            <HealthStat label="Booked" value={String(summary.booked)} />
            <HealthStat label="Need help" value={String(needsReview.length)} />
            <HealthStat label="Speed" value={summary.avgLatencyDisplay} />
          </div>

          {mostImportant && (
            <div className="mt-3 rounded-2xl soft-amber-card border px-3 py-2">
              <div className="text-[10px] uppercase tracking-wider font-semibold soft-amber-label">First call to check</div>
              <div className="text-[13px] font-semibold text-foreground mt-0.5">{mostImportant.call.name}</div>
              <div className="text-[12px] text-muted-foreground dark:text-foreground/72 mt-0.5">{getOperationalConversationContext(mostImportant.conversation).nextAction}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          <OutcomePill label="Need help" value={needsReview.length} active={activeFilter === "review"} onClick={() => setActiveFilter("review")} />
          <OutcomePill label="Booked" value={booked.length} active={activeFilter === "booked"} onClick={() => setActiveFilter("booked")} />
          <OutcomePill label="Urgent" value={escalated.length} active={activeFilter === "escalated"} onClick={() => setActiveFilter("escalated")} />
          <OutcomePill label="All" value={callRows.length} active={activeFilter === "all"} onClick={() => setActiveFilter("all")} />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-2xl bg-surface border border-border px-3.5 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search calls" className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-muted-foreground" />
        </div>
      </section>

      <CallSection title={activeCopy.title} sub={activeCopy.sub} rows={activeRows} reviewedIds={reviewedIds} onReview={(id) => setReviewedIds((ids) => ids.includes(id) ? ids : [...ids, id])} />
    </MobileShell>
  );
}

function CallSection({
  title,
  sub,
  rows,
  reviewedIds,
  onReview,
}: {
  title: string;
  sub: string;
  rows: Array<{ conversation: ConversationRecord; call: Call }>;
  reviewedIds: string[];
  onReview: (id: string) => void;
}) {
  return (
    <section className="px-5 mt-6">
      <SectionTitle title={title} sub={sub} count={rows.length} />
      {rows.length > 0 ? (
        <ul className="space-y-2.5">
          {rows.map(({ conversation, call }) => (
            <CallRow key={`${title}-${conversation.id}`} call={call} conversation={conversation} reviewed={reviewedIds.includes(conversation.id)} onReview={() => onReview(conversation.id)} />
          ))}
        </ul>
      ) : (
        <div className="rounded-3xl bg-surface border border-border p-4 text-[13px] text-muted-foreground" style={{ boxShadow: "var(--shadow-soft)" }}>
          Nothing in this bucket right now.
        </div>
      )}
    </section>
  );
}

function HealthStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-2.5 py-3 text-center">
      <div className="font-serif text-[21px] leading-none text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function OutcomePill({ label, value, active = false, onClick }: { label: string; value: number; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border px-2.5 py-2 text-left transition-colors ${active ? "soft-selected-card" : "bg-surface text-foreground border-border"}`}
    >
      <div className="font-serif text-[20px] leading-none text-foreground">{value}</div>
      <div className={`text-[10px] uppercase tracking-wider mt-1 ${active ? "soft-selected-label" : "text-muted-foreground"}`}>{label}</div>
    </button>
  );
}

function CallRow({ call, conversation, reviewed, onReview }: { call: Call; conversation: ConversationRecord; reviewed: boolean; onReview: () => void }) {
  const operationalContext = getOperationalConversationContext(conversation);
  const statusMeta: Record<Status, { icon: React.ComponentType<{ className?: string }>; chip: string }> = {
    Booked: { icon: CheckCircle2, chip: "bg-success/12 text-success border-success/20" },
    Escalated: { icon: AlertTriangle, chip: "bg-destructive/10 text-destructive border-destructive/20" },
    Captured: { icon: Moon, chip: "bg-secondary text-foreground/80 border-border" },
    Missed: { icon: PhoneMissed, chip: "bg-warning/15 text-warning-foreground border-warning/30 dark:bg-warning/20 dark:text-amber-100 dark:border-warning/60" },
    "Follow-up": { icon: PhoneIncoming, chip: "bg-primary/10 text-primary border-primary/20" },
  };
  const Meta = statusMeta[call.status];
  const Icon = Meta.icon;

  return (
    <li className="rounded-2xl bg-surface border border-border dark:border-white/[0.07] p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-[15px] font-semibold text-foreground tracking-tight truncate">{call.name}</div>
            {conversation.customerId ? <ReturningChip /> : <NewCallerChip />}
          </div>
          <div className="text-[12px] text-muted-foreground truncate">{call.meta}</div>
        </div>
        <div className="text-[11px] text-muted-foreground whitespace-nowrap">{call.time}</div>
      </div>

      <p className="mt-1.5 text-[13px] text-foreground/80 leading-snug">{call.summary}</p>
      <div className="mt-2 rounded-2xl bg-surface-2 dark:bg-white/[0.025] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Next action</div>
        <div className="text-[12px] text-foreground/80 leading-snug mt-0.5">{operationalContext.nextAction}</div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 border ${Meta.chip}`}>
            <Icon className="h-3 w-3" />
            {call.status}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 border ${operationalContext.canAutoBook ? "bg-success/12 text-success border-success/20" : "bg-warning/15 text-warning-foreground dark:bg-warning/20 dark:text-amber-100 border-warning/30 dark:border-warning/60"}`}>
            <CalendarCheck className="h-3 w-3" />
            {operationalContext.canAutoBook ? "Safe to book" : "Needs person"}
          </span>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={onReview} className="text-[12px] font-medium rounded-full bg-secondary text-secondary-foreground px-3 py-1.5">Call notes</button>
          <button type="button" onClick={onReview} className="text-[12px] font-medium rounded-full bg-foreground text-background px-3 py-1.5">{reviewed ? "Reviewed" : needsHumanReview(conversation) ? "Review" : "Open"}</button>
        </div>
      </div>

      {call.payment && (
        <div className="mt-2.5 pt-2.5 border-t border-border">
          <PaymentChip payment={call.payment} />
        </div>
      )}
    </li>
  );
}

function ActionBox({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 dark:bg-white/[0.025] border border-transparent dark:border-white/[0.045] px-3 py-2 flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-primary mt-0.5" />
      <div className="min-w-0">
        <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</div>
        <div className="text-[11px] text-foreground mt-0.5 leading-snug">{value}</div>
      </div>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background/40 dark:bg-white/[0.02] border border-border dark:border-white/[0.055] px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</div>
      <div className="text-[11px] text-foreground capitalize truncate">{value}</div>
    </div>
  );
}

function SectionTitle({ title, sub, count }: { title: string; sub: string; count: number }) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[13px] font-semibold uppercase text-foreground" style={{ letterSpacing: "0.06em" }}>{title}</h2>
        <span className="text-[11px] text-muted-foreground">{count}</span>
      </div>
      <div className="text-[12px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function ReturningChip() {
  return (
    <span className="rounded-full bg-primary/10 text-primary border border-primary/20 dark:bg-primary/10 dark:border-primary/15 text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5">
      Returning
    </span>
  );
}

function NewCallerChip() {
  return (
    <span className="rounded-full bg-secondary text-muted-foreground border border-border dark:border-transparent text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5">
      New
    </span>
  );
}

function needsHumanReview(conversation: ConversationRecord) {
  return needsConversationReview(conversation);
}

function getAiAction(conversation: ConversationRecord) {
  if (conversation.status === "booked") return "Booked appointment and sent confirmation.";
  if (conversation.status === "escalated") return "Created escalation and prepared dispatch review.";
  if (conversation.status === "captured") return "Captured after-hours lead and held next safe window.";
  if (conversation.status === "missed_recovered") return "Sent missed-call recovery SMS.";
  return conversation.escalation?.suggestedAction ?? "Prepared follow-up for office review.";
}

function getFilteredRows(
  filter: CallFilter,
  rows: {
    needsReview: Array<{ conversation: ConversationRecord; call: Call }>;
    booked: Array<{ conversation: ConversationRecord; call: Call }>;
    escalated: Array<{ conversation: ConversationRecord; call: Call }>;
    all: Array<{ conversation: ConversationRecord; call: Call }>;
  },
) {
  if (filter === "booked") return rows.booked;
  if (filter === "escalated") return rows.escalated;
  if (filter === "all") return rows.all;
  return rows.needsReview;
}

function getFilterCopy(filter: CallFilter) {
  if (filter === "booked") return { title: "Booked calls", sub: "Calls that became jobs." };
  if (filter === "escalated") {
    return { title: "Urgent calls", sub: "Calls that need a person to check." };
  }
  if (filter === "all") return { title: "All calls", sub: "Every recent call in one list." };
  return { title: "Needs help", sub: "Handle these first." };
}

function toCall(conversation: ConversationRecord): Call {
  const status: Status =
    conversation.status === "booked" ? "Booked" :
    conversation.status === "escalated" ? "Escalated" :
    conversation.status === "captured" ? "Captured" :
    conversation.status === "missed_recovered" ? "Missed" :
    "Follow-up";

  return {
    name: conversation.customerName,
    meta: `${conversation.trade ? conversation.trade.replace("-", " ") : "Unknown"} - ${conversation.intent.replaceAll("_", " ")} - ${conversation.phoneNumber}`,
    summary: conversation.summary,
    memory: conversation.memoryUsed.join(". "),
    time: conversation.receivedAt.replace("Today ", "").replace("Yesterday ", "Yesterday "),
    status,
    score: `${conversation.confidence}% confidence`,
    payment: conversation.customerId === "angela-brooks"
      ? { status: "pending", kind: "deposit", amount: 150, detail: "Waiting on owner-approved emergency deposit rule" }
      : conversation.customerId === "erica-patel"
        ? { status: "deposit_collected", kind: "deposit", amount: 50, detail: "Apple Pay" }
        : undefined,
  };
}
