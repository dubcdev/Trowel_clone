import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell, RolePill, ScreenHeader } from "@/components/MobileShell";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  MessageCircle,
  MoreHorizontal,
  ShieldCheck,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import { appData } from "@/lib/app-data";
import { getDispatchSummary, getTechnicianLoad, tradeLabel } from "@/lib/operations";
import { getSchedulingSummary, getWindowsForTechnician } from "@/lib/scheduling";

export const Route = createFileRoute("/team")({ component: TeamScreen });

type TeamView = "all" | "available" | "slots" | "approvals";

const activity = [
  { time: "Just now", who: "AI", what: "held emergency slot", detail: "Angela Brooks - burst pipe - owner approval needed", icon: AlertTriangle, tone: "destructive" },
  { time: "3m", who: "Diego R.", what: "available for dispatch", detail: "Oakland ETA 34 min - plumbing fit", icon: CheckCircle2, tone: "success" },
  { time: "8m", who: "Sam K.", what: "marked in progress", detail: "Lily Park - drain cleaning - blocked until 1:15 PM", icon: ArrowRight, tone: "primary" },
  { time: "14m", who: "AI", what: "captured payment rule", detail: "$150 emergency deposit requires approval", icon: ShieldCheck, tone: "primary" },
  { time: "22m", who: "AI", what: "captured after-hours lead", detail: "Carlos Mendez - roof leak - photo request sent", icon: MessageCircle, tone: "muted" },
];

function TeamScreen() {
  const [activeView, setActiveView] = useState<TeamView>("all");
  const summary = getDispatchSummary();
  const scheduling = getSchedulingSummary();
  const visibleTechs = getVisibleTechnicians(activeView);
  const viewCopy = getTeamViewCopy(activeView);

  return (
    <MobileShell>
      <ScreenHeader eyebrow={`${appData.technicians.length} technicians configured`} title="Team" trailing={<RolePill />} />

      <div className="px-5 grid grid-cols-4 gap-2 mb-5">
        <TeamStat label="All team" value={String(appData.technicians.length)} active={activeView === "all"} onClick={() => setActiveView("all")} />
        <TeamStat label="Free now" value={String(summary.available)} active={activeView === "available"} onClick={() => setActiveView("available")} />
        <TeamStat label="Open times" value={String(scheduling.openWindows)} active={activeView === "slots"} onClick={() => setActiveView("slots")} />
        <TeamStat label="Needs OK" value={String(summary.approvals)} active={activeView === "approvals"} onClick={() => setActiveView("approvals")} />
      </div>

      {activeView === "slots" && <section className="px-5 mb-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <div>
              <div className="text-[15px] font-semibold tracking-tight text-foreground">Where times come from</div>
              <div className="text-[12px] text-muted-foreground">{scheduling.source.label} is active. If it fails, Trowel can use its backup calendar.</div>
            </div>
          </div>
        </div>
      </section>}

      <section className="px-5">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground mb-1">{viewCopy.title}</h2>
        <div className="text-[12px] text-muted-foreground mb-3">{viewCopy.sub}</div>
        <ul className="space-y-2">
          {visibleTechs.map((tech) => {
            const windows = getWindowsForTechnician(tech.id);
            return (
              <li key={tech.id} className="rounded-2xl bg-surface border border-border px-3.5 py-3" style={{ boxShadow: "var(--shadow-soft)" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center text-[13px] font-semibold text-foreground/70">
                    {tech.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="text-[14px] font-semibold text-foreground tracking-tight truncate">{tech.name}</div>
                      <StatusPill status={tech.status} />
                    </div>
                    <div className="text-[11px] text-muted-foreground capitalize">{tech.role} - {getTechnicianLoad(tech.id)} jobs today</div>
                  </div>
                  <button className="ml-1 text-muted-foreground" aria-label={`Open ${tech.name} actions`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <TeamDetail icon={CalendarClock} label="Working" value={`${tech.shift.start} to ${tech.shift.end}`} />
                  <TeamDetail icon={Wrench} label="Can do" value={tech.trades.map(tradeLabel).join(", ")} />
                  <TeamDetail icon={UserRoundCheck} label="Works in" value={tech.serviceAreas.join(", ")} wide />
                  <TeamDetail icon={ShieldCheck} label="Urgent jobs" value={tech.emergencyEligible ? "Can take" : "Ask first"} />
                  <TeamDetail icon={CalendarClock} label="Next open time" value={windows[0]?.label ?? "No clear time"} wide />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {activeView === "approvals" && <section className="px-5 mt-7 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground">Recent team updates</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-primary live-dot" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Live
          </div>
        </div>

        <ol className="relative pl-5">
          <span className="absolute left-[7px] top-1 bottom-1 w-px bg-border" />
          {activity.map((a) => {
            const tone =
              a.tone === "success" ? "bg-success" :
              a.tone === "destructive" ? "bg-destructive" :
              a.tone === "primary" ? "bg-primary" : "bg-muted-foreground/50";
            const Icon = a.icon;
            return (
              <li key={`${a.time}-${a.detail}`} className="relative pb-4 last:pb-0">
                <span className={`absolute -left-5 top-1.5 h-3 w-3 rounded-full ${tone} ring-4 ring-background`} />
                <div className="flex items-baseline justify-between gap-3">
                  <div className="text-[13px] text-foreground">
                    <span className="font-semibold">{a.who}</span> <span className="text-foreground/70">{a.what}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground shrink-0">{a.time}</div>
                </div>
                <div className="mt-0.5 text-[12px] text-muted-foreground inline-flex items-center gap-1.5">
                  <Icon className="h-3 w-3" /> {a.detail}
                </div>
              </li>
            );
          })}
        </ol>
      </section>}
    </MobileShell>
  );
}

function TeamStat({ label, value, active, onClick }: { label: string; value: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border px-2.5 py-3 text-left transition-colors ${active ? "soft-selected-card" : "bg-surface text-foreground border-border"}`}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="font-serif text-xl leading-none text-foreground">{value}</div>
      <div className={`text-[10px] leading-tight mt-1 ${active ? "soft-selected-label" : "text-muted-foreground"}`}>{label}</div>
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === "available"
      ? "bg-success/12 text-success border-success/25"
      : status === "on_job"
        ? "bg-warning/15 text-warning-foreground border-warning/30 dark:bg-warning/20 dark:text-amber-100 dark:border-warning/60"
        : "bg-secondary text-muted-foreground border-border";

  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold ${tone}`}>
      {statusLabel(status)}
    </span>
  );
}

function TeamDetail({ icon: Icon, label, value, wide }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-2xl bg-surface-2 border border-border px-3 py-2 ${wide ? "col-span-2" : ""}`}>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="text-[12px] text-foreground/80 mt-1 truncate">{value}</div>
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "on_job") return "On job";
  if (status === "off_duty") return "Off duty";
  if (status === "pto") return "PTO";
  return "Available";
}

function getVisibleTechnicians(view: TeamView) {
  if (view === "all") return appData.technicians;
  if (view === "available") return appData.technicians.filter((tech) => tech.status === "available");
  if (view === "approvals") return appData.technicians.filter((tech) => tech.emergencyEligible);
  return appData.technicians;
}

function getTeamViewCopy(view: TeamView) {
  if (view === "all") return { title: "All team", sub: "Everyone on your team. Tap a tab to narrow the list." };
  if (view === "slots") return { title: "Open times", sub: "Times the front desk can safely offer customers." };
  if (view === "approvals") return { title: "Needs OK", sub: "People who can help with urgent jobs after approval." };
  return { title: "Free now", sub: "People who can take or be considered for the next job." };
}
