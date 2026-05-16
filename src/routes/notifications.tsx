import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Bell, CalendarClock, CheckCircle2, ChevronRight, CreditCard, MessageCircle, ShieldAlert } from "lucide-react";
import { MobileShell, RolePill, ScreenHeader } from "@/components/MobileShell";
import {
  NotificationPriority,
  NotificationRecord,
  getActionNotifications,
  getDailyDigest,
  getNotificationSummary,
  getRecentNotifications,
  notificationDeliveryEvents,
  notificationPreferences,
} from "@/lib/notifications";

export const Route = createFileRoute("/notifications")({ component: NotificationsScreen });

function NotificationsScreen() {
  const summary = getNotificationSummary();
  const digest = getDailyDigest();
  const actionItems = getActionNotifications();
  const recent = getRecentNotifications(6);

  return (
    <MobileShell>
      <ScreenHeader eyebrow="Alerts" title="What needs attention" trailing={<RolePill />} />

      <section className="px-5">
        <div className="grid grid-cols-3 gap-2">
          <SummaryTile label="Urgent" value={String(summary.urgent)} active />
          <SummaryTile label="Needs OK" value={String(summary.actionNeeded)} />
          <SummaryTile label="Unread" value={String(summary.unread)} />
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold tracking-tight text-foreground">{digest.title}</div>
              <div className="text-[12px] text-muted-foreground">{digest.period} - generated {digest.generatedAt}</div>
              <p className="mt-2 text-[13px] leading-snug text-foreground/75">{digest.summary}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {digest.metrics.map((metric) => (
              <div key={metric.label} className="rounded-2xl bg-surface-2 px-3 py-2">
                <div className="font-serif text-[24px] leading-none text-foreground">{metric.value}</div>
                <div className="text-[12px] font-medium text-foreground mt-1">{metric.label}</div>
                <div className="text-[11px] text-muted-foreground">{metric.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 mt-7">
        <SectionTitle title="Do these first" count={actionItems.length} />
        <div className="space-y-3">
          {actionItems.map((item) => (
            <NotificationCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="px-5 mt-7">
        <SectionTitle title="All alerts" count={recent.length} />
        <ul className="rounded-3xl bg-surface border border-border overflow-hidden divide-y divide-border" style={{ boxShadow: "var(--shadow-soft)" }}>
          {recent.map((item) => (
            <li key={item.id}>
              <Link to={item.destination} className="flex items-center gap-3 px-4 py-3.5">
                <IconBubble item={item} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-foreground tracking-tight truncate">{item.title}</div>
                  <div className="text-[12px] text-muted-foreground truncate">{item.body}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-muted-foreground">{item.createdAt}</div>
                  <div className="text-[11px] font-medium text-foreground/80 mt-0.5">{labelPriority(item.priority)}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-5 mt-7 mb-4">
        <SectionTitle title="Delivery setup" />
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="grid grid-cols-3 gap-2">
            <SummaryTile label="Rules" value={String(notificationPreferences.length)} />
            <SummaryTile label="Events" value={String(notificationDeliveryEvents.length)} />
            <SummaryTile label="Failed" value={String(summary.failedDeliveries)} />
          </div>
          <p className="mt-3 text-[12px] leading-snug text-muted-foreground">
            Live push, SMS, and email providers are still mocked. The app now knows who gets each alert and where each tap should go.
          </p>
        </div>
      </section>
    </MobileShell>
  );
}

function NotificationCard({ item }: { item: NotificationRecord }) {
  return (
    <Link
      to={item.destination}
      className={`notification-action-card block rounded-3xl border p-4 ${priorityCardClass(item.priority)}`}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-start gap-3">
        <IconBubble item={item} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${priorityClass(item.priority)}`}>
              {labelPriority(item.priority)}
            </span>
            <span className="text-[11px] text-muted-foreground">{item.createdAt}</span>
          </div>
          <h2 className="mt-2 text-[16px] font-semibold tracking-tight text-foreground">{item.title}</h2>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground dark:text-foreground/68">{item.body}</p>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-[12px] font-medium text-background dark:bg-white/[0.84] dark:text-background">
            {item.actionLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function IconBubble({ item }: { item: NotificationRecord }) {
  const Icon = item.type === "emergency_call" ? AlertTriangle :
    item.type === "payment_collected" || item.type === "payment_failed" ? CreditCard :
    item.type === "booking_conflict" || item.type === "technician_conflict" || item.type === "calendar_sync_failure" ? CalendarClock :
    item.type === "customer_photo" || item.type === "after_hours_lead" ? MessageCircle :
    item.type === "repeat_issue" || item.type === "low_confidence" ? ShieldAlert :
    CheckCircle2;
  const tone = item.priority === "urgent"
    ? "bg-destructive/12 text-destructive dark:bg-red-200/12 dark:text-red-100"
    : item.priority === "important"
      ? "soft-amber-chip"
      : "bg-primary/10 text-primary dark:bg-primary/14";
  return (
    <div className={`h-10 w-10 rounded-2xl grid place-items-center shrink-0 ${tone}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

function SummaryTile({ label, value, active }: { label: string; value: string; active?: boolean }) {
  return (
    <div className={`rounded-2xl border px-3 py-3 ${active ? "soft-selected-card" : "bg-surface text-foreground border-border"}`} style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="font-serif text-[24px] leading-none text-foreground">{value}</div>
      <div className={`text-[10px] uppercase tracking-wider mt-1 ${active ? "soft-selected-label" : "text-muted-foreground"}`}>{label}</div>
    </div>
  );
}

function SectionTitle({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-[13px] font-semibold tracking-tight text-foreground uppercase" style={{ letterSpacing: "0.06em" }}>{title}</h2>
        {count !== undefined && <span className="text-[11px] text-muted-foreground">{count}</span>}
      </div>
    </div>
  );
}

function labelPriority(priority: NotificationPriority) {
  if (priority === "urgent") return "Urgent";
  if (priority === "important") return "Important";
  return "FYI";
}

function priorityClass(priority: NotificationPriority) {
  if (priority === "urgent") return "bg-destructive text-destructive-foreground border-destructive dark:bg-red-300/82 dark:text-red-950 dark:border-red-200/30";
  if (priority === "important") return "soft-amber-chip";
  return "bg-primary/10 text-primary border-primary/20";
}

function priorityCardClass(priority: NotificationPriority) {
  if (priority === "urgent") {
    return "bg-destructive/10 border-destructive/25 dark:bg-[linear-gradient(135deg,oklch(0.24_0.038_24_/_0.82),oklch(0.215_0.026_355_/_0.9))] dark:border-red-200/18";
  }
  if (priority === "important") {
    return "soft-amber-card";
  }
  return "bg-surface border-border";
}
