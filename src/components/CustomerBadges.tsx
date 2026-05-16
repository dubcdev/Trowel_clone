import { CustomerBadge, Sentiment } from "@/lib/customers";
import {
  Crown, Repeat, AlertTriangle, ShieldAlert, Sparkles, Wrench, Phone,
} from "lucide-react";

const styles: Record<CustomerBadge, { cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  VIP:                   { cls: "bg-warning/15 text-warning-foreground border-warning/30 dark:bg-warning/20 dark:text-amber-100 dark:border-warning/60", icon: Crown },
  "Maintenance Member":  { cls: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/25 dark:text-primary-foreground dark:border-primary/45", icon: Wrench },
  "Repeat Issue":        { cls: "bg-destructive/10 text-destructive border-destructive/25 dark:bg-destructive/25 dark:text-red-100 dark:border-destructive/60", icon: Repeat },
  "Repeat Caller":       { cls: "bg-accent text-accent-foreground border-border dark:bg-primary/25 dark:text-blue-100 dark:border-primary/50", icon: Phone },
  "Previous Escalation": { cls: "bg-destructive/10 text-destructive border-destructive/25 dark:bg-destructive/25 dark:text-red-100 dark:border-destructive/60", icon: ShieldAlert },
  "Emergency History":   { cls: "bg-warning/15 text-warning-foreground border-warning/30 dark:bg-warning/25 dark:text-amber-100 dark:border-warning/60", icon: AlertTriangle },
  New:                   { cls: "bg-secondary text-secondary-foreground border-border dark:bg-secondary/80 dark:text-foreground", icon: Sparkles },
};

export function BadgeChip({ badge }: { badge: CustomerBadge }) {
  const s = styles[badge];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-0.5 border ${s.cls}`}>
      <Icon className="h-3 w-3" />
      {badge}
    </span>
  );
}

export function SentimentDot({ sentiment }: { sentiment: Sentiment }) {
  const color =
    sentiment === "positive" ? "bg-success" :
    sentiment === "neutral" ? "bg-muted-foreground/50" :
    sentiment === "watch" ? "bg-warning" : "bg-destructive";
  const label =
    sentiment === "positive" ? "Positive" :
    sentiment === "neutral" ? "Neutral" :
    sentiment === "watch" ? "Watch" : "Unhappy";
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

export function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <div
      className="rounded-full grid place-items-center text-foreground font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background:
          "linear-gradient(135deg, oklch(0.92 0.05 280 / 0.9), oklch(0.9 0.06 220 / 0.9))",
        border: "1px solid var(--border)",
      }}
    >
      {initials}
    </div>
  );
}
