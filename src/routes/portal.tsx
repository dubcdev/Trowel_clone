import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CalendarCheck,
  ClipboardCheck,
  Database,
  Users,
} from "lucide-react";
import {
  enrichmentAuditLogs,
  enrichmentSources,
  escalationRuleDrafts,
  getEnrichmentSummary,
  intakeProfile,
  onboardingConfirmations,
} from "@/lib/enrichment";
import { enrichmentPipeline, onboardingCards, receptionistProfile } from "@/lib/onboarding";
import { dispatchEvents, technicians, tradeLabel } from "@/lib/operations";
import { availabilityWindows, getSchedulingSummary, scheduleSources } from "@/lib/scheduling";
import { WebPageShell } from "@/routes/website";

export const Route = createFileRoute("/portal")({ component: PortalScreen });

type StepId = "enrichment" | "onboarding-flow" | "team" | "scheduling" | "dispatch" | "ai-profile";

type SetupStep = {
  id: StepId;
  icon: ComponentType<{ className?: string }>;
  label: string;
  shortLabel: string;
  title: string;
  detail: string;
  action: string;
};

const setupSteps: SetupStep[] = [
  {
    id: "enrichment",
    icon: Database,
    label: "Business info",
    shortLabel: "Business",
    title: "Check the business info.",
    detail: "Trowel found public business details. The owner only needs to confirm what is correct.",
    action: "Confirm 3 fields",
  },
  {
    id: "onboarding-flow",
    icon: ClipboardCheck,
    label: "Services and rules",
    shortLabel: "Rules",
    title: "Choose what the AI is allowed to book.",
    detail: "Keep services, hours, and safety rules simple so the AI does not guess.",
    action: "Review",
  },
  {
    id: "team",
    icon: Users,
    label: "Team",
    shortLabel: "Team",
    title: "Tell Trowel who can take jobs.",
    detail: "Technicians, roles, shifts, and emergency eligibility feed the dispatch engine.",
    action: "3 ready",
  },
  {
    id: "scheduling",
    icon: CalendarCheck,
    label: "Scheduling",
    shortLabel: "Schedule",
    title: "Pick where the schedule lives.",
    detail: "Use a field-service system, a calendar, Trowel's calendar, or manual approval.",
    action: "Connected",
  },
  {
    id: "dispatch",
    icon: AlertTriangle,
    label: "Emergencies",
    shortLabel: "Emergency",
    title: "Set emergency rules.",
    detail: "The AI can hold urgent work, but the owner decides when approval is required.",
    action: "2 rules",
  },
  {
    id: "ai-profile",
    icon: Bot,
    label: "AI front desk",
    shortLabel: "AI",
    title: "Listen before going live.",
    detail: "Trowel builds the receptionist from confirmed business rules and shows a demo.",
    action: "Demo next",
  },
];

const supportedSystems = [
  "ServiceTitan",
  "Jobber",
  "Housecall Pro",
  "Workiz",
  "FieldPulse",
  "Google Calendar",
  "Outlook",
  "iCloud",
  "Calendly",
  "Cal.com",
  "Square",
  "CalDAV",
  "ICS",
  "Webhooks",
  "Custom API",
];

function PortalScreen() {
  const enrichment = getEnrichmentSummary();
  const scheduling = getSchedulingSummary();
  const reviewConfirmations = onboardingConfirmations.filter((item) => item.status === "needs_review").slice(0, 3);
  const readyPercent = Math.max(0, Math.min(100, Math.round((enrichment.confirmed / enrichment.fields) * 100)));
  const [activeStepId, setActiveStepId] = useState<StepId>("enrichment");
  const activeIndex = Math.max(0, setupSteps.findIndex((step) => step.id === activeStepId));
  const activeStep = setupSteps[activeIndex] ?? setupSteps[0];
  const ActiveIcon = activeStep.icon;
  const isFirstStep = activeIndex === 0;
  const isLastStep = activeIndex === setupSteps.length - 1;

  const stepContent = useMemo(
    () =>
      renderStepContent(activeStep.id, {
        reviewConfirmations,
        scheduling,
      }),
    [activeStep.id, reviewConfirmations, scheduling],
  );

  function moveStep(direction: -1 | 1) {
    const nextIndex = Math.max(0, Math.min(setupSteps.length - 1, activeIndex + direction));
    setActiveStepId(setupSteps[nextIndex].id);
  }

  return (
    <WebPageShell>
      <section className="px-5 py-8 md:py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-[32px] bg-surface border border-border p-5 md:p-7" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="grid gap-5 lg:grid-cols-[1fr_260px] lg:items-end">
              <div>
                <div className="text-[12px] uppercase tracking-[0.16em] font-semibold text-primary">Client setup portal</div>
                <h1 className="mt-3 max-w-2xl font-serif text-[38px] leading-none text-foreground md:text-[48px]">
                  Set up the AI front desk one simple step at a time.
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-muted-foreground">
                  No giant checklist. Confirm one thing, move to the next, then send the owner to the mobile app.
                </p>
              </div>
              <div className="rounded-3xl bg-surface-2 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[12px] font-semibold text-muted-foreground">Setup progress</div>
                    <div className="mt-1 font-serif text-[40px] leading-none text-foreground">{readyPercent}%</div>
                  </div>
                  <StatusPill value="Owner" />
                </div>
                <div className="mt-4 h-2 rounded-full bg-background/70">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${readyPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-primary/8 p-4">
              <div className="text-[12px] uppercase tracking-[0.14em] font-semibold text-primary">Current step</div>
              <div className="mt-2 text-[16px] font-semibold text-foreground">{activeStep.label}</div>
              <div className="mt-1 text-[13px] leading-5 text-muted-foreground">{activeStep.detail}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 md:grid-cols-6">
            {setupSteps.map((step, index) => (
              <StepButton
                key={step.id}
                step={step}
                number={index + 1}
                active={step.id === activeStep.id}
                complete={index < activeIndex}
                onClick={() => setActiveStepId(step.id)}
              />
            ))}
          </div>

          <section className="mt-5 rounded-[32px] bg-surface border border-border p-5 md:p-7" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-3xl bg-primary/10 text-primary">
                  <ActiveIcon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[12px] uppercase tracking-[0.16em] font-semibold text-primary">
                    Step {activeIndex + 1} of {setupSteps.length}
                  </div>
                  <h2 className="mt-1 font-serif text-[34px] leading-none text-foreground">{activeStep.title}</h2>
                  <p className="mt-3 max-w-2xl text-[14px] leading-6 text-muted-foreground">{activeStep.detail}</p>
                </div>
              </div>
              <StatusPill value={activeStep.action} />
            </div>

            <div className="mt-6">{stepContent}</div>

            <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-2 px-5 py-3 text-sm font-semibold text-foreground disabled:opacity-40"
                disabled={isFirstStep}
                onClick={() => moveStep(-1)}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="text-center text-[12px] font-semibold text-muted-foreground">
                {activeStep.label}
              </div>
              {isLastStep ? (
                <Link to="/download-app" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                  Download app
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                  onClick={() => moveStep(1)}
                >
                  Next step
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>
        </div>
      </section>
    </WebPageShell>
  );
}

function renderStepContent(
  stepId: StepId,
  context: {
    reviewConfirmations: typeof onboardingConfirmations;
    scheduling: ReturnType<typeof getSchedulingSummary>;
  },
) {
  switch (stepId) {
    case "enrichment":
      return (
        <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
          <Panel title="Check these first" sub="These stay as drafts until the owner says yes.">
            <div className="space-y-3">
              {context.reviewConfirmations.map((item) => (
                <ReviewRow key={item.id} label={item.fieldId.replaceAll("-", " ")} value={item.originalValue} source={item.sourceUrl} />
              ))}
            </div>
          </Panel>
          <Panel title="Where Trowel looked" sub="Public pages only. No private systems.">
            <div className="space-y-3">
              {enrichmentSources.slice(0, 3).map((source) => (
                <CompactSource key={source.id} label={source.label} value={source.fieldsFound.join(", ")} status={source.status} />
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-surface-2 p-3">
              <div className="text-[12px] font-semibold text-foreground">How it works</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {enrichmentPipeline.slice(0, 4).map((step, index) => (
                  <span key={step.id} className="rounded-full bg-background/70 px-3 py-1.5 text-[12px] font-semibold text-foreground">
                    {index + 1}. {step.label}
                  </span>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      );
    case "onboarding-flow":
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {onboardingCards.map((card) => (
            <SmallCard key={card.id} status={card.status} title={card.title} detail={card.summary} action={card.ownerAction} />
          ))}
        </div>
      );
    case "team":
      return (
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Who can do what" sub="Keep roles plain so owners understand them fast.">
            <div className="grid gap-2 sm:grid-cols-2">
              {["Owner/Admin", "Office Manager", "Dispatcher", "Technician"].map((role) => (
                <div key={role} className="rounded-2xl bg-surface-2 px-3 py-3 text-[13px] font-semibold text-foreground">{role}</div>
              ))}
            </div>
          </Panel>
          <Panel title="Technicians" sub="This tells Trowel who can take each job.">
            <div className="space-y-2">
              {technicians.map((tech) => (
                <div key={tech.id} className="rounded-2xl bg-surface-2 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[14px] font-semibold text-foreground">{tech.name}</div>
                    <StatusPill value={tech.status.replace("_", " ")} />
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-muted-foreground">
                    {tech.trades.map(tradeLabel).join(" / ")} - {tech.serviceAreas.join(", ")}
                  </div>
                  <div className="mt-1 text-[12px] text-muted-foreground">{tech.shift.start} to {tech.shift.end} - {tech.emergencyEligible ? "Emergency eligible" : "Routine only"}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      );
    case "scheduling":
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <Panel title="Pick the calendar source" sub={`${context.scheduling.connectedSources} source is connected. Trowel keeps fallbacks ready.`}>
              <div className="space-y-2">
                {scheduleSources.map((source) => (
                  <div key={source.kind} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 px-3 py-3">
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">{source.priority}. {source.label}</div>
                      <div className="mt-0.5 text-[12px] text-muted-foreground">{source.description}</div>
                    </div>
                    <StatusPill value={source.status.replace("_", " ")} />
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Systems Trowel can support" sub="Show a few at a time. The owner does not need to read a huge list.">
              <div className="flex flex-wrap gap-2">
                {supportedSystems.map((system) => (
                  <span key={system} className="rounded-full bg-surface-2 px-3 py-1.5 text-[12px] font-semibold text-foreground">{system}</span>
                ))}
              </div>
            </Panel>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {availabilityWindows.map((window) => (
              <SmallCard key={window.id} status={`${window.confidence}%`} title={window.label} detail={`${window.start} to ${window.end}`} action={window.emergency ? "Emergency hold" : "Routine window"} />
            ))}
          </div>
        </div>
      );
    case "dispatch":
      return (
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <Panel title="Emergency rules" sub="The AI can hold urgent work. A person approves when needed.">
            <div className="space-y-3">
              {escalationRuleDrafts.map((rule) => (
                <div key={rule.id} className="rounded-2xl bg-surface-2 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[14px] font-semibold text-foreground">{rule.label}</div>
                    <StatusPill value={rule.status.replaceAll("_", " ")} />
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{rule.action}</div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Example urgent jobs" sub="This is what the owner will see in the mobile app.">
            <div className="space-y-3">
              {dispatchEvents.slice(0, 2).map((event) => (
                <div key={event.id} className="rounded-2xl border border-destructive/20 bg-destructive/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[14px] font-semibold text-foreground">{event.customer}</div>
                    <StatusPill value={event.urgency} />
                  </div>
                  <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{event.issue} - {event.location}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      );
    case "ai-profile":
      return (
        <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <Panel title="What the AI is allowed to say" sub="Simple rules keep it calm and reliable.">
            <div className="grid gap-3 md:grid-cols-2">
              <Rule label="Voice" value={receptionistProfile.voice} />
              <Rule label="Intake" value={intakeProfile.requiredQuestions.join(", ")} />
              <Rule label="Scheduling" value={receptionistProfile.schedulingRule} />
              <Rule label="Escalation" value={receptionistProfile.escalationRule} />
            </div>
          </Panel>
          <Panel title="Trust log" sub="Show what changed and why.">
            <div className="space-y-2">
              {enrichmentAuditLogs.map((log) => (
                <div key={log.id} className="rounded-2xl bg-surface-2 px-3 py-2 text-[12px] leading-5 text-muted-foreground">
                  <span className="font-semibold text-foreground">{log.action.replaceAll("_", " ")}</span> - {log.detail}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      );
  }
}

function StepButton({ step, number, active, complete, onClick }: { step: SetupStep; number: number; active: boolean; complete: boolean; onClick: () => void }) {
  const Icon = step.icon;

  return (
    <button
      className={`rounded-[22px] border p-3 text-left transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground hover:border-primary/40"
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`grid h-7 w-7 place-items-center rounded-full text-[12px] font-bold ${active ? "bg-white/18 text-white" : "bg-primary/10 text-primary"}`}>
          {complete ? "✓" : number}
        </span>
        <Icon className={`h-4 w-4 ${active ? "text-white" : "text-primary"}`} />
      </div>
      <div className="mt-3 text-[13px] font-semibold">{step.shortLabel}</div>
    </button>
  );
}

function Panel({ title, sub, children }: { title: string; sub: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] bg-surface border border-border p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="text-[16px] font-semibold text-foreground">{title}</div>
      <div className="mt-1 text-sm leading-6 text-muted-foreground">{sub}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SmallCard({ status, title, detail, action }: { status: string; title: string; detail: string; action: string }) {
  return (
    <div className="rounded-[24px] bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
      <StatusPill value={status} />
      <div className="mt-3 text-[15px] font-semibold text-foreground">{title}</div>
      <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{detail}</div>
      <div className="mt-3 text-[12px] font-semibold text-foreground">{action}</div>
    </div>
  );
}

function ReviewRow({ label, value, source }: { label: string; value: string; source: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[13px] font-semibold capitalize text-foreground">{label}</div>
          <div className="mt-1 text-[13px] text-foreground">{value}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{source}</div>
        </div>
        <button className="rounded-full bg-primary px-3 py-1.5 text-[12px] font-semibold text-primary-foreground" type="button">Confirm</button>
      </div>
    </div>
  );
}

function CompactSource({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[13px] font-semibold text-foreground">{label}</div>
        <StatusPill value={status} />
      </div>
      <div className="mt-1 text-[12px] leading-5 text-muted-foreground">{value}</div>
    </div>
  );
}

function Rule({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 p-3">
      <div className="text-[12px] uppercase tracking-[0.14em] font-semibold text-primary">{label}</div>
      <div className="mt-1 text-[12px] leading-5 text-foreground">{value}</div>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  return (
    <span className="inline-flex shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
      {value}
    </span>
  );
}
