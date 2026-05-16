import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { PaymentChip } from "@/components/PaymentStatus";
import { appData } from "@/lib/app-data";
import { ScheduledJob } from "@/lib/operations";
import { assessScheduledJob, getSchedulingSummary } from "@/lib/scheduling";
import { assessPaymentForBooking, getPaymentActionPlan, getPaymentPolicyForJob, getPaymentRequestForJob } from "@/lib/payments";
import { createBookingHold, getAllowedJobTransitions, getJobWorkflowSummary, getPrimaryJobAction } from "@/lib/job-workflow";

export const Route = createFileRoute("/jobs")({ component: JobsScreen });

type JobsView = "all" | "approval" | "slots";

function JobsScreen() {
  const [activeView, setActiveView] = useState<JobsView>("all");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ScheduledJob["status"]>>({});
  const summary = getSchedulingSummary();
  const workflow = getJobWorkflowSummary();
  const jobs = appData.jobs.map((job) => ({ ...job, status: statusOverrides[job.id] ?? job.status }));
  const orderedJobs = [...jobs].sort((a, b) => jobPriority(a) - jobPriority(b));
  const activeJob = orderedJobs.find((job) => job.status === "in_progress") ?? orderedJobs[0];
  const approvalJobs = orderedJobs.filter((job) => job.id !== activeJob?.id && needsApproval(job));
  const readyJobs = orderedJobs.filter((job) => job.status !== "completed" && !needsApproval(job));
  const upcomingJobs = readyJobs.filter((job) => job.id !== activeJob?.id);
  const todayJobs = orderedJobs.filter((job) => job.status !== "completed");

  return (
    <MobileShell>
      <ScreenHeader
        eyebrow="Work queue"
        title="Jobs"
        trailing={<button className="rounded-full bg-foreground text-background text-[12px] font-medium px-3 py-1.5 dark:bg-white/[0.08] dark:text-foreground dark:border dark:border-white/[0.08]">Add job</button>}
      />

      <section className="px-5 mb-5">
        <div className="rounded-3xl bg-surface border border-border p-5 dark:border-white/[0.06]" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">Right now</div>
              <h2 className="font-serif text-[30px] leading-tight mt-1 text-foreground">{activeJob.customer}</h2>
              <div className="text-[13px] text-foreground/80">{activeJob.title}</div>
            </div>
            <StatusBadge job={activeJob} />
          </div>

          <div className="mt-4 grid gap-2">
            <QuickLine icon={Clock} text={activeJob.window} />
            <QuickLine icon={MapPin} text={`${activeJob.serviceArea} - ${technicianName(activeJob.technicianId)}`} />
            <QuickLine icon={ShieldCheck} text={nextActionText(activeJob)} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <ActionButton icon={Navigation} label="Route" primary onClick={() => activeJob && setStatusOverrides((current) => ({ ...current, [activeJob.id]: "en_route" }))} />
            <ActionButton icon={Phone} label="Call" onClick={() => activeJob && setActiveView("all")} />
            <ActionButton icon={CheckCircle2} label="Done" onClick={() => activeJob && setStatusOverrides((current) => ({ ...current, [activeJob.id]: "completed" }))} />
          </div>
        </div>
      </section>

      <div className="px-5 grid grid-cols-3 gap-2 mb-6">
        <MiniStat label="Today's jobs" value={String(todayJobs.length)} active={activeView === "all"} onClick={() => setActiveView("all")} />
        <MiniStat label="Needs OK" value={String(approvalJobs.length)} tone={approvalJobs.length > 0 ? "warn" : "normal"} active={activeView === "approval"} onClick={() => setActiveView("approval")} />
        <MiniStat label="Open times" value={String(summary.openWindows)} active={activeView === "slots"} onClick={() => setActiveView("slots")} />
      </div>

      {activeView === "all" && (
        <section className="px-5 mb-6">
          <SectionTitle title="Today's jobs" sub="Your current work list." />
          <div className="rounded-3xl bg-surface border border-border overflow-hidden divide-y divide-border" style={{ boxShadow: "var(--shadow-soft)" }}>
            {todayJobs.map((job) => (
              <CompactJobRow key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {activeView === "approval" && (
        <section className="px-5 mb-4">
          <SectionTitle title="Needs OK" sub="These jobs are paused until a person says yes." />
          <div className="space-y-3">
            {approvalJobs.length > 0 ? (
              approvalJobs.map((job) => <JobQueueCard key={job.id} job={job} mode="approval" />)
            ) : (
            <EmptyState text="No jobs need an OK right now." />
            )}
          </div>
        </section>
      )}

      {activeView === "slots" && (
        <section className="px-5 mb-6">
          <SectionTitle title="Open times" sub="Times the front desk can safely offer customers." />
          <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="grid grid-cols-3 gap-2">
              <BackendStat label="Held" value={String(workflow.activeHolds)} />
              <BackendStat label="Need OK" value={String(workflow.approvalHolds)} />
              <BackendStat label="Calendars" value={String(workflow.providerAdapters.length)} />
            </div>
            <div className="mt-3 space-y-2">
              {workflow.providerAdapters.map((adapter) => (
                <div key={adapter.id} className="rounded-2xl bg-surface-2 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px] font-semibold text-foreground">{adapter.label}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{adapter.syncStatus.replace("_", " ")}</div>
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{adapter.capabilities.slice(0, 3).join(", ")}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </MobileShell>
  );
}

function JobQueueCard({ job, mode }: { job: ScheduledJob; mode: "approval" | "ready" }) {
  const assessment = assessScheduledJob(job);
  const paymentPolicy = getPaymentPolicyForJob({ trade: job.trade, emergency: job.emergency, membership: job.customerId === "erica-patel" });
  const paymentRequest = getPaymentRequestForJob(job.id);
  const paymentPlan = getPaymentActionPlan(job.payment, paymentPolicy, paymentRequest);
  const paymentAssessment = paymentPlan.assessment;
  const technician = appData.technicians.find((tech) => tech.id === job.technicianId);
  const actionLabel = mode === "approval" ? "Review hold" : job.status === "scheduled" ? "Open job" : "Continue";
  const hold = createBookingHold(job);
  const primaryAction = getPrimaryJobAction(job);
  const allowedTransitions = getAllowedJobTransitions(job).filter((transition) => transition.allowed);

  return (
    <article className="relative rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
      {job.emergency && <span className="absolute left-0 top-5 bottom-5 w-1 rounded-r-full bg-destructive" />}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {job.window}
          </div>
          <h3 className="font-serif text-[24px] leading-tight mt-1 text-foreground">{job.customer}</h3>
          <div className="text-[13px] text-foreground/80">{job.title}</div>
        </div>
        <StatusBadge job={job} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.serviceArea}</span>
        <span className="inline-flex items-center gap-1"><User className="h-3.5 w-3.5" /> {technician?.name ?? "Unassigned"}</span>
      </div>

      <div className="mt-3 rounded-2xl bg-surface-2 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Do next</div>
        <div className="text-[12px] text-foreground mt-0.5">{nextActionText(job)}</div>
      </div>

      <div className="mt-2 rounded-2xl bg-surface-2 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Saved spot</div>
            <div className="text-[12px] text-foreground mt-0.5">{hold.status.replace("_", " ")} - expires in {hold.expiresAt}</div>
          </div>
          <div className="text-[11px] text-muted-foreground">{hold.sourceKind.replace("_", " ")}</div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-secondary border border-border text-[10px] text-foreground/75 px-2 py-0.5">{primaryAction.label}</span>
          {allowedTransitions.slice(0, 3).map((transition) => (
            <span key={transition.action} className="rounded-full bg-primary/10 border border-primary/20 text-[10px] text-primary px-2 py-0.5">
              {transition.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-2 rounded-2xl bg-surface-2 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Payment</div>
            <div className="text-[12px] text-foreground mt-0.5">{paymentPlan.primaryAction}</div>
          </div>
          <div className="text-[11px] text-muted-foreground capitalize">
            {paymentPlan.request?.status.replace("_", " ") ?? "draft"}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {paymentPlan.allowedActions.slice(0, 3).map((action) => (
            <span key={action} className="rounded-full bg-secondary border border-border text-[10px] text-foreground/75 px-2 py-0.5">
              {action.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <PaymentChip payment={job.payment} />
            <button className={`rounded-full text-[12px] font-medium px-3 py-1.5 ${mode === "approval" ? "bg-primary text-primary-foreground dark:bg-white/[0.08] dark:text-foreground dark:border dark:border-white/[0.08]" : "bg-secondary text-secondary-foreground"}`}>
          {actionLabel}
        </button>
      </div>

      {(assessment.approvalReasons.length > 0 || assessment.conflicts.length > 0 || paymentAssessment.safetyNotes.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {[...assessment.approvalReasons, ...assessment.conflicts, ...paymentAssessment.safetyNotes].slice(0, 3).map((reason) => (
            <span key={reason} className="rounded-full bg-warning/15 border border-warning/25 text-warning-foreground text-[10px] font-medium px-2 py-0.5 dark:bg-warning/[0.08] dark:text-amber-100 dark:border-warning/25">
              {reason}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

function CompactJobRow({ job }: { job: ScheduledJob }) {
  return (
    <div className="px-4 py-3.5 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-2xl grid place-items-center shrink-0 ${job.emergency ? "bg-destructive/10 text-destructive" : job.status === "in_progress" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
        {job.emergency ? <AlertTriangle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[14px] font-semibold text-foreground truncate">{job.customer}</div>
          <StatusBadge job={job} small />
        </div>
        <div className="text-[12px] text-muted-foreground truncate">{job.window} - {job.title} - {technicianName(job.technicianId)}</div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone = "normal", active = false, onClick }: { label: string; value: string; tone?: "normal" | "warn"; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border px-3 py-3 text-left transition-colors ${
        active ? "soft-selected-card" : tone === "warn" ? "bg-warning/12 border-warning/25 text-foreground dark:bg-warning/[0.07] dark:border-warning/20" : "bg-surface border-border text-foreground dark:border-white/[0.055]"
      }`}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="font-serif text-xl leading-none text-foreground">{value}</div>
      <div className={`text-[11px] mt-1 ${active ? "soft-selected-label" : "text-muted-foreground"}`}>{label}</div>
    </button>
  );
}

function BackendStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-2.5">
      <div className="font-serif text-[20px] leading-none text-foreground">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-[13px] font-semibold uppercase text-foreground" style={{ letterSpacing: "0.06em" }}>
        {title}
      </h2>
      <div className="text-[12px] text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl bg-surface border border-border p-4 text-[13px] text-muted-foreground" style={{ boxShadow: "var(--shadow-soft)" }}>
      {text}
    </div>
  );
}

function QuickLine({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-3 py-2 flex items-start gap-2">
      <Icon className="h-4 w-4 text-primary mt-0.5" />
      <div className="text-[12px] text-foreground/78 leading-snug">{text}</div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, primary, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; primary?: boolean; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-2xl py-2.5 text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 ${primary ? "bg-foreground text-background dark:bg-white/[0.08] dark:text-foreground dark:border dark:border-white/[0.08]" : "bg-secondary text-secondary-foreground"}`}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function StatusBadge({ job, small = false }: { job: ScheduledJob; small?: boolean }) {
  const label = statusLabel(job);
  const tone = job.emergency || job.status === "held"
    ? "bg-destructive/10 text-destructive border-destructive/25 dark:bg-destructive/[0.08] dark:border-destructive/20"
    : job.status === "in_progress"
      ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/[0.08] dark:border-primary/18"
      : "bg-success/12 text-success border-success/25 dark:bg-success/[0.08] dark:border-success/20";
  return (
    <span className={`rounded-full border uppercase tracking-wider font-semibold ${tone} ${small ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"}`}>
      {label}
    </span>
  );
}

function technicianName(id: string) {
  return appData.technicians.find((tech) => tech.id === id)?.name ?? "Unassigned";
}

function statusLabel(job: ScheduledJob) {
  if (job.status === "in_progress") return "On job";
  if (job.status === "held") return job.emergency ? "Emergency hold" : "Held";
  if (job.status === "en_route") return "En route";
  if (job.status === "completed") return "Done";
  return "Ready";
}

function nextActionText(job: ScheduledJob) {
  const assessment = assessScheduledJob(job);
  const paymentAssessment = assessPaymentForBooking(
    job.payment,
    getPaymentPolicyForJob({ trade: job.trade, emergency: job.emergency, membership: job.customerId === "erica-patel" }),
  );

  if (job.status === "in_progress") return "Finish this job, collect notes/photos, then move to the next scheduled item.";
  if (assessment.decision !== "book") return assessment.safeNextAction;
  if (!paymentAssessment.canConfirmBooking) return paymentAssessment.nextAction;
  if (job.status === "scheduled") return "Job is ready. Technician, window, payment, and calendar checks are clear.";
  return job.memory;
}

function needsApproval(job: ScheduledJob) {
  if (job.status === "in_progress" || job.status === "completed") return false;

  const assessment = assessScheduledJob(job);
  const paymentAssessment = assessPaymentForBooking(
    job.payment,
    getPaymentPolicyForJob({ trade: job.trade, emergency: job.emergency, membership: job.customerId === "erica-patel" }),
  );
  return job.status === "held" || assessment.decision !== "book" || !paymentAssessment.canConfirmBooking;
}

function jobPriority(job: ScheduledJob) {
  if (job.status === "in_progress") return 0;
  if (job.status === "held" && job.emergency) return 1;
  if (job.emergency) return 2;
  if (job.status === "scheduled") return 3;
  if (job.status === "en_route") return 4;
  if (job.status === "completed") return 9;
  return 5;
}
