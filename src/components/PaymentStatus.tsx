import { CreditCard, CheckCircle2, Clock, Send, MinusCircle, Apple, Smartphone, Link2, Sparkles } from "lucide-react";
import {
  Payment,
  PaymentStatus,
  STATUS_LABEL,
  KIND_LABEL,
  formatAmount,
  getPaymentWorkflowSummary,
  paymentAccount,
  paymentsConnected,
} from "@/lib/payments";

const TONE: Record<PaymentStatus, { chip: string; dot: string; icon: React.ComponentType<{ className?: string }> }> = {
  not_required: { chip: "bg-secondary text-foreground/70 border-border", dot: "bg-muted-foreground/30", icon: CreditCard },
  requested: { chip: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary", icon: Send },
  deposit_collected: { chip: "bg-success/12 text-success border-success/25", dot: "bg-success", icon: CheckCircle2 },
  paid: { chip: "bg-success/12 text-success border-success/25", dot: "bg-success", icon: CheckCircle2 },
  pending: { chip: "bg-warning/15 text-warning-foreground border-warning/30 dark:bg-warning/[0.08] dark:text-amber-100 dark:border-warning/25", dot: "bg-warning", icon: Clock },
  failed: { chip: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive", icon: Clock },
  link_sent: { chip: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary", icon: Send },
  waived: { chip: "bg-secondary text-foreground/70 border-border", dot: "bg-muted-foreground/40", icon: MinusCircle },
  refunded: { chip: "bg-secondary text-foreground/70 border-border", dot: "bg-muted-foreground/40", icon: MinusCircle },
  not_requested: { chip: "bg-secondary text-foreground/70 border-border", dot: "bg-muted-foreground/30", icon: CreditCard },
};

/** Compact inline chip for list rows and activity feed. */
export function PaymentChip({ payment }: { payment: Payment }) {
  const t = TONE[payment.status];
  const Icon = t.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 border ${t.chip}`}>
      <Icon className="h-3 w-3" />
      {STATUS_LABEL[payment.status]}
      {payment.amount > 0 && payment.status !== "not_requested" && payment.status !== "not_required" && (
        <span className="opacity-80 normal-case tracking-normal font-medium ml-0.5">
          - {formatAmount(payment.amount)}
        </span>
      )}
    </span>
  );
}

/** Full payment card with actions for job, customer, and tech detail. */
export function PaymentCard({ payment, compact = false }: { payment: Payment; compact?: boolean }) {
  const t = TONE[payment.status];
  const Icon = t.icon;
  const settled = payment.status === "deposit_collected" || payment.status === "paid";
  const actionable = payment.status === "not_requested" || payment.status === "not_required" || payment.status === "pending" || payment.status === "requested" || payment.status === "link_sent" || payment.status === "failed";

  return (
    <div
      className="rounded-2xl bg-surface border border-border overflow-hidden"
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`h-9 w-9 rounded-xl grid place-items-center border ${t.chip}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
                {KIND_LABEL[payment.kind]}
              </div>
              <div className="text-[15px] font-semibold text-foreground tracking-tight">
                {STATUS_LABEL[payment.status]}
              </div>
            </div>
          </div>
          {payment.amount > 0 && (
            <div className="text-right shrink-0">
              <div className="font-serif text-[22px] leading-none text-foreground">
                {formatAmount(payment.amount)}
              </div>
              {payment.when && <div className="text-[10px] text-muted-foreground mt-1">{payment.when}</div>}
            </div>
          )}
        </div>

        {payment.detail && (
          <p className="mt-2.5 text-[12.5px] text-muted-foreground leading-snug flex items-center gap-1.5">
            {payment.status === "deposit_collected" || payment.status === "paid" ? (
              <Apple className="h-3.5 w-3.5" />
            ) : payment.status === "link_sent" ? (
              <Link2 className="h-3.5 w-3.5" />
            ) : (
              <Smartphone className="h-3.5 w-3.5" />
            )}
            {payment.detail}
          </p>
        )}

        {!compact && actionable && (
          <div className="mt-3.5 grid grid-cols-2 gap-2">
            <button className="rounded-full bg-foreground text-background text-[12.5px] font-medium px-3 py-2 inline-flex items-center justify-center gap-1.5 dark:bg-white/[0.08] dark:text-foreground dark:border dark:border-white/[0.08]">
              <Send className="h-3.5 w-3.5" />
              {payment.status === "link_sent" ? "Resend link" : "Send payment link"}
            </button>
            <button className="rounded-full bg-secondary text-secondary-foreground text-[12.5px] font-medium px-3 py-2 inline-flex items-center justify-center gap-1.5">
              <MinusCircle className="h-3.5 w-3.5" />
              Waive deposit
            </button>
          </div>
        )}

        {!compact && settled && (
          <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-success font-medium">
            <CheckCircle2 className="h-3 w-3" /> Confirmed - appointment locked in
          </div>
        )}
      </div>
    </div>
  );
}

/** Settings: optional payments connection card */
export function PaymentsSetupCard() {
  const summary = getPaymentWorkflowSummary();

  if (paymentsConnected) return null;
  return (
    <div
      className="rounded-3xl border border-primary/25 p-5 relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/10 dark:from-primary/[0.08] dark:to-accent/[0.08] dark:border-white/[0.08]"
      style={{
        boxShadow: "var(--shadow-glass)",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-2xl bg-primary/15 grid place-items-center shrink-0">
          <CreditCard className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] font-semibold text-primary">
            <Sparkles className="h-3 w-3" /> Optional
          </div>
          <h3 className="mt-1 font-serif text-[20px] leading-tight text-foreground">
            Confirm jobs and reduce no-shows
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground leading-snug">
            Connect payments to collect approved deposits, visit fees, and invoices by secure text link, Apple Pay, or Google Pay.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <SetupMetric label="Requests" value={String(summary.paymentRequests)} />
            <SetupMetric label="Collected" value={formatAmount(summary.collected)} />
            <SetupMetric label="Need OK" value={String(summary.approvalNeeded)} />
          </div>
          <div className="mt-3 rounded-2xl bg-surface/70 border border-border px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Setup status</div>
            <div className="text-[12px] text-foreground mt-0.5">
              {paymentAccount.onboardingStatus.replaceAll("_", " ")}. Trowel only asks for prices the owner approved.
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-full bg-foreground text-background text-[12.5px] font-medium px-3.5 py-2 dark:bg-white/[0.08] dark:text-foreground dark:border dark:border-white/[0.08]">
              Connect Stripe
            </button>
            <button className="rounded-full bg-surface text-foreground text-[12.5px] font-medium px-3.5 py-2 border border-border">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SetupMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface/70 border border-border px-2.5 py-2">
      <div className="font-serif text-[18px] leading-none text-foreground">{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
