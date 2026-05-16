import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  Check,
  ChevronDown,
  CircleHelp,
  Clock,
  Database,
  Hand,
  MapPin,
  MoreVertical,
  Phone,
  Rocket,
  Search,
  Users,
  Wrench,
} from "lucide-react";
import { onboardingIdentity } from "@/lib/onboarding";
import { phoneProvisioning } from "@/lib/phone-provisioning";

export const Route = createFileRoute("/onboarding")({ component: OnboardingScreen });

type SetupStepId = "business" | "services" | "team" | "schedule" | "phone" | "review";

type SetupStep = {
  id: SetupStepId;
  label: string;
  title: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
};

const setupSteps: SetupStep[] = [
  {
    id: "business",
    label: "Business Info",
    title: "Tell us about your business",
    detail: "One of these is enough to start. Trowel finds the rest for you to confirm.",
    icon: Database,
  },
  {
    id: "services",
    label: "Services",
    title: "Confirm what you handle",
    detail: "Make sure services, hours, service area, and emergency availability match your business.",
    icon: Wrench,
  },
  {
    id: "team",
    label: "Team & Schedules",
    title: "Add the people Trowel can schedule",
    detail: "Add roles, shifts, and who can take emergency calls.",
    icon: Users,
  },
  {
    id: "schedule",
    label: "Schedule Source",
    title: "Where should appointments come from?",
    detail: "Pick the place Trowel should check before offering appointment times.",
    icon: CalendarCheck,
  },
  {
    id: "phone",
    label: "Phone Setup",
    title: "Turn on your AI phone",
    detail: "Keep your current business number. Forward calls when you are ready.",
    icon: Phone,
  },
  {
    id: "review",
    label: "Go Live",
    title: "Review and launch",
    detail: "Nothing goes live until you approve every customer-facing setting.",
    icon: Check,
  },
];

const services = [
  { label: "Services", value: "Plumbing, HVAC, drain cleaning, water heaters", icon: BriefcaseBusiness, tone: "green" },
  { label: "Hours", value: "Mon-Fri 7:00am - 6:00pm, Sat 8:00am - 2:00pm", icon: Clock, tone: "amber" },
  { label: "Service Area", value: "Hayward, Oakland, San Leandro and nearby", icon: MapPin, tone: "violet" },
  { label: "Emergency Availability", value: "Available 24/7 for emergency calls", icon: EmergencyBeaconIcon, tone: "rose" },
];

const team = [
  { initials: "AB", name: "Angela Brooks", role: "Owner", schedule: "Mon-Fri 8am - 5pm", emergency: true },
  { initials: "DR", name: "Diego R.", role: "Dispatcher", schedule: "Mon-Fri 6am - 6pm", emergency: true },
  { initials: "SK", name: "Sam K.", role: "Technician", schedule: "Mon-Fri 7am - 4pm", emergency: true },
  { initials: "ML", name: "Marcus L.", role: "Technician", schedule: "Mon-Fri 7am - 4pm", emergency: false },
];

const scheduleSources = [
  { title: "Field-service system", detail: "Sync jobs and appointments from your field-service app.", selected: false, visual: "briefcase" },
  { title: "Google / Outlook Calendar", detail: "Pull from your existing calendar.", selected: false, visual: "providers" },
  { title: "Trowel Calendar", detail: "Use Trowel's built-in calendar to manage appointments.", selected: true, visual: "calendar" },
  { title: "Manual approval mode", detail: "Trowel collects requests and you approve each one.", selected: false, visual: "hand" },
];

const reviewItems = [
  { label: "Business confirmed", value: `${onboardingIdentity.businessName}, Hayward, CA`, icon: Database, tone: "blue" },
  { label: "Services confirmed", value: "4 services, 24/7 emergency available", icon: Wrench, tone: "green" },
  { label: "Team ready", value: "4 people added, 3 emergency eligible", icon: Users, tone: "violet" },
  { label: "Schedule connected", value: "Trowel Calendar, appointments will sync", icon: CalendarCheck, tone: "amber" },
  { label: "Phone tested", value: `AI phone ${phoneProvisioning.aiVoiceNumber} ready`, icon: Phone, tone: "blue" },
];

function OnboardingScreen() {
  const [activeStepId, setActiveStepId] = useState<SetupStepId>("business");
  const activeIndex = Math.max(0, setupSteps.findIndex((step) => step.id === activeStepId));
  const activeStep = setupSteps[activeIndex] ?? setupSteps[0];
  const isFirst = activeIndex === 0;
  const isLast = activeIndex === setupSteps.length - 1;

  const stepContent = useMemo(() => renderStepContent(activeStep.id), [activeStep.id]);

  function moveStep(direction: -1 | 1) {
    const nextIndex = Math.max(0, Math.min(setupSteps.length - 1, activeIndex + direction));
    setActiveStepId(setupSteps[nextIndex].id);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbfcff] text-[#07143d]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(25,55,130,0.12),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(69,83,230,0.08),transparent_32%)]" />
      <section className="relative mx-auto max-w-7xl px-5 py-8 md:py-10">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-[31px] leading-tight text-[#07143d] md:text-[42px]">
            Trowel AI Front Desk - Contractor Onboarding Launch Map
          </h1>
          <p className="mt-2 text-[15px] text-[#25345d]">Six customer-facing setup pages. Provide what we need. Trowel handles the rest.</p>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[#dbe3f3] bg-white shadow-[0_24px_80px_rgba(8,28,72,0.12)]">
          <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#e3e9f6] px-5 py-3">
            <Link to="/website" className="leading-none">
              <TrowelWordmark />
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/portal" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#25345d]">
                Need help? <CircleHelp className="h-3.5 w-3.5 text-[#6d78f5]" />
              </Link>
              <div className="grid h-8 w-8 place-items-center rounded-full bg-[#eef2ff] text-[11px] font-bold text-[#4d5cf4]">JD</div>
              <ChevronDown className="h-4 w-4 text-[#65718b]" />
            </div>
          </header>

          <div className="border-b border-[#e3e9f6] px-4 py-4 md:px-8">
            <LaunchMap activeIndex={activeIndex} onSelect={setActiveStepId} />
          </div>

          <main className="px-5 py-7 md:px-8 md:py-8">
            <div className="mx-auto max-w-5xl">
              <div className="mb-3 text-[13px] font-semibold text-[#4d5cf4]">
                Page {activeIndex + 1}: {activeStep.label}
              </div>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-serif text-[30px] leading-tight text-[#07143d] md:text-[36px]">{activeStep.title}</h2>
                  <p className="mt-1 text-[13px] text-[#334365]">{activeStep.detail}</p>
                </div>
                {activeStep.id === "services" ? (
                  <button className="rounded-lg border border-[#dbe3f3] px-3 py-2 text-[12px] font-semibold text-[#4d5cf4]" type="button">
                    Edit all
                  </button>
                ) : null}
              </div>

              {stepContent}
            </div>
          </main>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e3e9f6] bg-[#fbfdff] px-5 py-4 md:px-8">
            <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#53607a]">
              <Check className="h-4 w-4 text-[#4d5cf4]" />
              Trowel handles setup in the background.
            </div>
            <div className="flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-[#dbe3f3] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#25345d] disabled:opacity-40"
                disabled={isFirst}
                onClick={() => moveStep(-1)}
                type="button"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              {isLast ? (
                <Link to="/settings" className="inline-flex items-center gap-2 rounded-full bg-[#4d5cf4] px-5 py-2.5 text-[12px] font-semibold text-white shadow-[0_14px_28px_rgba(77,92,244,0.24)]">
                  Go live
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <button
                  className="inline-flex items-center gap-2 rounded-full bg-[#4d5cf4] px-5 py-2.5 text-[12px] font-semibold text-white shadow-[0_14px_28px_rgba(77,92,244,0.24)]"
                  onClick={() => moveStep(1)}
                  type="button"
                >
                  Next step
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}

function LaunchMap({ activeIndex, onSelect }: { activeIndex: number; onSelect: (stepId: SetupStepId) => void }) {
  return (
    <div className="grid gap-2 md:grid-cols-6">
      {setupSteps.map((step, index) => {
        const Icon = step.icon;
        const active = index === activeIndex;
        const complete = index < activeIndex;
        return (
          <button
            className="group min-w-0 rounded-2xl px-2 py-2 text-center transition hover:bg-[#f5f7ff]"
            key={step.id}
            onClick={() => onSelect(step.id)}
            type="button"
          >
            <div className="flex items-center justify-center gap-2">
              <div className={`h-px flex-1 ${index === 0 ? "bg-transparent" : "bg-[#d8e0f1]"}`} />
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border text-[13px] font-bold ${
                  active
                    ? "border-[#4d5cf4] bg-[#4d5cf4] text-white shadow-[0_10px_24px_rgba(77,92,244,0.22)]"
                    : complete
                      ? "border-[#bde9ca] bg-[#dff7e7] text-[#23995a]"
                      : "border-[#d8e0f1] bg-white text-[#4d5cf4]"
                }`}
              >
                {complete ? <Check className="h-4 w-4" /> : active ? <Icon className="h-5 w-5" /> : index + 1}
              </div>
              <div className={`h-px flex-1 ${index === setupSteps.length - 1 ? "bg-transparent" : "bg-[#d8e0f1]"}`} />
            </div>
            <div className="mt-2 truncate text-[10px] font-bold text-[#07143d] md:text-[11px]">{step.label}</div>
          </button>
        );
      })}
    </div>
  );
}

function TrowelWordmark() {
  return (
    <div className="leading-none">
      <div className="flex items-baseline">
        <span className="text-[22px] font-bold tracking-[-0.04em] text-[#4d5cf4] lowercase leading-none">t</span>
        <span className="text-[17px] font-bold tracking-[-0.02em] text-[#07143d] lowercase">rowel</span>
      </div>
      <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em] text-[#25345d]">AI front desk</div>
    </div>
  );
}

function renderStepContent(stepId: SetupStepId) {
  switch (stepId) {
    case "business":
      return (
        <div className="grid gap-8 md:grid-cols-[0.8fr_1fr] md:items-center">
          <div className="grid min-h-64 place-items-center rounded-[28px] bg-gradient-to-br from-[#f1f5ff] via-[#f7faff] to-white">
            <HouseIllustration />
          </div>
          <div>
            <div className="space-y-4">
              <Field label="Business name" placeholder="e.g., Bayview HVAC & Plumbing" />
              <Field label="Website or phone" placeholder="e.g., bayviewhvac.com or (510) 555-0142" />
              <Field label="City, State" placeholder="e.g., Hayward, CA" />
            </div>
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#4d5cf4] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(77,92,244,0.24)]" type="button">
              <Search className="h-4 w-4" />
              Find my business
            </button>
          </div>
        </div>
      );
    case "services":
      return (
          <div className="grid gap-4 md:grid-cols-2">
            {services.map((item) => (
            <ReviewCard action="Edit" icon={item.icon} key={item.label} label={item.label} tone={item.tone} value={item.value} />
            ))}
          <button className="md:col-span-2 mx-auto mt-1 inline-flex min-w-60 items-center justify-center gap-2 rounded-xl bg-[#4d5cf4] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(77,92,244,0.24)]" type="button">
            <Check className="h-4 w-4" />
            Looks right
          </button>
        </div>
      );
    case "team":
      return (
        <div>
          <div className="mb-4 flex justify-end">
            <button className="text-[13px] font-semibold text-[#4d5cf4]" type="button">+ Add person</button>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#dbe3f3]">
            {team.map((person) => (
              <div className="grid gap-3 border-b border-[#edf1f8] bg-white p-4 last:border-b-0 md:grid-cols-[1fr_1fr_auto_120px] md:items-center" key={person.name}>
                <div className="flex items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-full text-[13px] font-bold ${avatarClass(person.initials)}`}>{person.initials}</div>
                  <div>
                    <div className="text-[13px] font-bold text-[#07143d]">{person.name}</div>
                    <div className="text-[12px] text-[#53607a]">{person.role}</div>
                  </div>
                </div>
                <div className="text-[12px] font-semibold text-[#25345d]">{person.schedule}</div>
                <div className="text-[12px] text-[#53607a]">Emergency eligible</div>
                <div className="flex items-center gap-3 justify-between md:justify-end">
                  <div className={`h-6 w-11 rounded-full p-1 ${person.emergency ? "bg-[#35b96d]" : "bg-[#c9d1e0]"}`}>
                    <div className={`h-4 w-4 rounded-full bg-white transition ${person.emergency ? "translate-x-5" : ""}`} />
                  </div>
                  <MoreVertical className="h-4 w-4 text-[#9aa7be]" />
                </div>
              </div>
            ))}
          </div>
          <button className="mx-auto mt-5 flex min-w-60 items-center justify-center gap-2 rounded-xl bg-[#4d5cf4] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(77,92,244,0.24)]" type="button">
            <Users className="h-4 w-4" />
            Save team
          </button>
        </div>
      );
    case "schedule":
      return (
        <div>
          <div className="grid gap-4 md:grid-cols-4">
            {scheduleSources.map((source) => (
              <button
                className={`rounded-2xl border p-4 text-left transition ${
                  source.selected ? "border-[#4d5cf4] bg-[#f5f7ff] shadow-[0_16px_34px_rgba(77,92,244,0.12)]" : "border-[#dbe3f3] bg-white hover:bg-[#fbfdff]"
                }`}
                key={source.title}
                type="button"
              >
                <div className={`mb-5 h-4 w-4 rounded-full border ${source.selected ? "border-[#4d5cf4] bg-[#4d5cf4]" : "border-[#9aa7be]"}`} />
                <ScheduleVisual type={source.visual} />
                <div className="mt-5 text-[13px] font-bold text-[#07143d]">{source.title}</div>
                <p className="mt-3 text-[12px] leading-5 text-[#53607a]">{source.detail}</p>
              </button>
            ))}
          </div>
          <button className="mx-auto mt-5 flex min-w-72 items-center justify-center gap-2 rounded-xl bg-[#4d5cf4] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(77,92,244,0.24)]" type="button">
            Use this schedule source
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      );
    case "phone":
      return (
        <div className="grid gap-4 md:grid-cols-3">
          <ActionPanel icon={<Phone className="h-4 w-4" />} number="1" title="Choose your AI phone number">
            <p>Pick a local number Trowel will answer.</p>
            <button className="mt-4 w-full rounded-lg border border-[#dbe3f3] bg-[#f8fbff] px-3 py-2 text-[13px] font-semibold text-[#25345d]" type="button">
              {phoneProvisioning.aiVoiceNumber}
            </button>
          </ActionPanel>
          <ActionPanel icon={<ArrowRight className="h-4 w-4" />} number="2" title="Forward calls to Trowel">
            <p>When you're ready, forward calls to your AI phone number.</p>
            <button className="mt-4 w-full rounded-lg border border-[#dbe3f3] bg-[#f8fbff] px-3 py-2 text-[13px] font-semibold text-[#25345d]" type="button">
              Show forwarding steps
            </button>
          </ActionPanel>
          <ActionPanel icon={<Phone className="h-4 w-4" />} number="3" title="Run a test call">
            <p>We'll call you so you can hear how your AI receptionist sounds.</p>
            <button className="mt-4 w-full rounded-lg border border-[#dbe3f3] bg-white px-3 py-2 text-[13px] font-semibold text-[#4d5cf4]" type="button">
              Run test call
            </button>
          </ActionPanel>
          <button className="md:col-span-3 mx-auto mt-1 inline-flex min-w-72 items-center justify-center gap-2 rounded-xl bg-[#4d5cf4] px-6 py-3 text-[14px] font-semibold text-white shadow-[0_14px_28px_rgba(77,92,244,0.24)]" type="button">
            <Phone className="h-4 w-4" />
            Run test call
          </button>
        </div>
      );
    case "review":
      return (
        <div>
          <div className="mb-5 rounded-2xl border border-[#bde9ca] bg-[#f4fbf6] p-4 text-[13px] font-semibold text-[#216842]">
            Nothing goes live until you approve.
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reviewItems.map((item) => {
              const Icon = item.icon;
              return (
                <div className="rounded-2xl border border-[#dbe3f3] bg-white p-4" key={item.label}>
                  <div className="flex items-start justify-between">
                    <div className={`grid h-10 w-10 place-items-center rounded-full ${toneClass(item.tone)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <Check className="h-4 w-4 text-[#35b96d]" />
                  </div>
                  <div className="mt-3 text-[13px] font-bold text-[#07143d]">{item.label}</div>
                  <div className="mt-1 text-[12px] text-[#53607a]">{item.value}</div>
                </div>
              );
            })}
            <div className="grid place-items-center rounded-2xl border border-[#d7eadc] bg-[#f4fbf6] p-4 text-center">
              <Rocket className="h-11 w-11 text-[#35b96d]" />
              <div className="mt-1 text-[17px] font-bold text-[#216842]">You're ready</div>
              <div className="mt-1 text-[12px] text-[#53607a]">Go live when you're ready.</div>
            </div>
          </div>
        </div>
      );
  }
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-[12px] font-bold text-[#07143d]">{label}</span>
      <input
        className="mt-2 h-12 w-full rounded-lg border border-[#dbe3f3] bg-white px-4 text-[13px] text-[#07143d] outline-none placeholder:text-[#9aa7be] focus:border-[#4d5cf4]"
        placeholder={placeholder}
      />
    </label>
  );
}

function ReviewCard({
  label,
  value,
  action,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  action: string;
  icon: ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-[#dbe3f3] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className={`grid h-11 w-11 place-items-center rounded-full ${toneClass(tone)}`}>
          <Icon className="h-5 w-5" />
        </div>
        <Check className="h-4 w-4 text-[#35b96d]" />
      </div>
      <div className="mt-4 text-[13px] font-bold text-[#07143d]">{label}</div>
      <div className="mt-1 min-h-10 text-[12px] leading-5 text-[#53607a]">{value}</div>
      <button className="mt-3 rounded-lg border border-[#dbe3f3] px-3 py-1.5 text-[12px] font-semibold text-[#4d5cf4]" type="button">
        {action}
      </button>
    </div>
  );
}

function ActionPanel({ number, title, children, icon }: { number: string; title: string; children: ReactNode; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#dbe3f3] bg-white p-4">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#eef2ff] text-[14px] font-bold text-[#4d5cf4]">{number}</div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#f8fbff] text-[#4d5cf4]">{icon}</div>
      </div>
      <div className="mt-4 text-[13px] font-bold text-[#07143d]">{title}</div>
      <div className="mt-2 text-[12px] leading-5 text-[#53607a]">{children}</div>
    </div>
  );
}

function ScheduleVisual({ type }: { type: string }) {
  if (type === "providers") {
    return (
      <div className="flex h-14 items-center gap-2">
        <GoogleLogo />
        <OutlookLogo />
      </div>
    );
  }

  const visualMap: Record<string, { icon: ComponentType<{ className?: string }>; className: string }> = {
    briefcase: { icon: BriefcaseBusiness, className: "bg-[#e8f8ef] text-[#23995a]" },
    calendar: { icon: CalendarCheck, className: "bg-[#eef2ff] text-[#4d5cf4]" },
    hand: { icon: Hand, className: "bg-[#eef2ff] text-[#4d5cf4]" },
  };
  const config = visualMap[type] ?? visualMap.calendar;
  const Icon = config.icon;
  return (
    <div className={`grid h-14 w-14 place-items-center rounded-full ${config.className}`}>
      <Icon className="h-6 w-6" />
    </div>
  );
}

function HouseIllustration() {
  return (
    <div className="relative h-48 w-64 overflow-hidden rounded-[32px] bg-[#f7f9ff]" aria-hidden="true">
      <div className="absolute left-5 top-12 h-8 w-16 rounded-full bg-[#dfe7ff]" />
      <div className="absolute left-12 top-8 h-9 w-9 rounded-full bg-[#dfe7ff]" />
      <div className="absolute right-14 top-12 h-7 w-16 rounded-full bg-[#dfe7ff]" />
      <div className="absolute right-28 top-8 h-9 w-9 rounded-full bg-[#dfe7ff]" />

      <div className="absolute bottom-5 left-10 h-20 w-6 rounded-t-full bg-[#8cc7b0]" />
      <div className="absolute bottom-5 left-2 h-12 w-16 rounded-t-full bg-[#bfe0d5]" />
      <div className="absolute bottom-5 left-7 h-16 w-5 rounded-t-full bg-[#72bba2]" />
      <div className="absolute bottom-5 right-8 h-20 w-6 rounded-t-full bg-[#8cc7b0]" />
      <div className="absolute bottom-5 right-1 h-12 w-16 rounded-t-full bg-[#bfe0d5]" />
      <div className="absolute bottom-5 right-24 h-12 w-5 rounded-t-full bg-[#72bba2]" />

      <div className="absolute bottom-5 left-24 h-28 w-28 rounded-t-[24px] bg-[#6b77f4] shadow-[0_18px_36px_rgba(77,92,244,0.18)]" />
      <div className="absolute bottom-[8.25rem] left-[4.5rem] h-8 w-40 rounded-t-[10px] bg-[#4d5cf4]" />
      <div className="absolute bottom-[6.75rem] left-[3.75rem] h-8 w-[11.5rem] overflow-hidden rounded-b-xl rounded-t-md bg-white shadow-[0_10px_24px_rgba(77,92,244,0.14)]">
        <div className="flex h-full">
          <div className="w-1/5 bg-[#4d5cf4]" />
          <div className="w-1/5 bg-[#dfe5ff]" />
          <div className="w-1/5 bg-[#4d5cf4]" />
          <div className="w-1/5 bg-[#dfe5ff]" />
          <div className="w-1/5 bg-[#4d5cf4]" />
        </div>
      </div>
      <div className="absolute bottom-5 left-[8.5rem] h-[4.25rem] w-10 rounded-t-2xl bg-[#3949d4]" />
      <div className="absolute bottom-20 left-[7.5rem] h-9 w-9 rounded-xl bg-[#cad5ff]" />
      <div className="absolute bottom-20 left-[12.25rem] h-9 w-9 rounded-xl bg-[#cad5ff]" />
      <div className="absolute bottom-4 left-8 right-8 h-2 rounded-full bg-[#d9e6f6]" />
    </div>
  );
}

function GoogleLogo() {
  return (
    <div className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm" aria-label="Google Calendar">
      <svg className="h-7 w-7" viewBox="0 0 48 48" role="img" aria-hidden="true">
        <path fill="#4285F4" d="M44.5 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h11.8c-.2 1.9-1.5 4.8-4.4 6.7l-.1.5 6.4 5 .4.1c4-3.7 6.4-9.1 6.4-16z" />
        <path fill="#34A853" d="M24 45c5.7 0 10.5-1.9 14-5.1l-6.7-5.1c-1.8 1.2-4.2 2.1-7.3 2.1-5.6 0-10.3-3.7-12-8.8l-.5.1-6.6 5.1-.1.5C8.3 40.4 15.5 45 24 45z" />
        <path fill="#FBBC05" d="M12 28.1c-.4-1.3-.7-2.7-.7-4.1s.3-2.8.7-4.1l-.1-.5-6.7-5.2-.4.2C3.3 17.3 2.5 20.6 2.5 24s.8 6.7 2.3 9.6l7.2-5.5z" />
        <path fill="#EA4335" d="M24 11.1c4 0 6.6 1.7 8.1 3.1l5.9-5.8C34.4 5.1 29.7 3 24 3 15.5 3 8.3 7.6 4.8 14.4l7.2 5.5c1.7-5.1 6.4-8.8 12-8.8z" />
      </svg>
    </div>
  );
}

function OutlookLogo() {
  return (
    <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#eef6ff] shadow-sm" aria-label="Outlook Calendar">
      <svg className="h-8 w-8" viewBox="0 0 48 48" role="img" aria-hidden="true">
        <path fill="#0A65C8" d="M19 10h19a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H19z" />
        <path fill="#28A8EA" d="M23 14h14v7H23z" />
        <path fill="#50D9FF" d="M23 23h14v7H23z" />
        <path fill="#0364B8" d="M8 14 24 10v28L8 34z" />
        <path fill="#fff" d="M16 29.8c-3 0-5.1-2.4-5.1-5.8s2.2-5.8 5.2-5.8 5 2.4 5 5.7c0 3.5-2.1 5.9-5.1 5.9zm.1-2.3c1.3 0 2.2-1.4 2.2-3.5 0-2-.9-3.4-2.2-3.4-1.4 0-2.3 1.4-2.3 3.5s.9 3.4 2.3 3.4z" />
      </svg>
    </div>
  );
}

function EmergencyBeaconIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 15a5 5 0 0 1 10 0" />
      <path d="M6 19h12" />
      <path d="M8 19v-4" />
      <path d="M16 19v-4" />
      <path d="M12 4v3" />
      <path d="m5 6 2 2" />
      <path d="m19 6-2 2" />
      <path d="M10 11.5 8.5 13" />
      <path d="M14 11.5 15.5 13" />
    </svg>
  );
}

function toneClass(tone: string) {
  const tones: Record<string, string> = {
    blue: "bg-[#eef2ff] text-[#4d5cf4]",
    green: "bg-[#e8f8ef] text-[#23995a]",
    amber: "bg-[#fff4d8] text-[#b87900]",
    rose: "bg-[#ffecef] text-[#e34b62]",
    violet: "bg-[#f1edff] text-[#745cf4]",
  };
  return tones[tone] ?? tones.blue;
}

function avatarClass(initials: string) {
  const colors: Record<string, string> = {
    AB: "bg-[#eef2ff] text-[#4d5cf4]",
    DR: "bg-[#e8f8ef] text-[#23995a]",
    SK: "bg-[#fff4d8] text-[#b87900]",
    ML: "bg-[#f1edff] text-[#745cf4]",
  };
  return colors[initials] ?? colors.AB;
}
