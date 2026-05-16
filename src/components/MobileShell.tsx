import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, Phone, Wrench, Settings as SettingsIcon, Users, MapPin, Bell, Moon, Sun } from "lucide-react";
import { ReactNode, useState } from "react";
import { useRole, ROLES, Role } from "@/lib/role";
import { useTheme } from "@/hooks/use-theme";
import { getNotificationSummary } from "@/lib/notifications";

type Tab = { to: string; label: string; icon: typeof Home };

const TAB_SETS: Record<Role, Tab[]> = {
  owner: [
    { to: "/", label: "Today", icon: Home },
    { to: "/jobs", label: "Jobs", icon: Wrench },
    { to: "/calls", label: "Calls", icon: Phone },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ],
  dispatcher: [
    { to: "/", label: "Today", icon: Home },
    { to: "/jobs", label: "Jobs", icon: Wrench },
    { to: "/calls", label: "Calls", icon: Phone },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ],
  manager: [
    { to: "/", label: "Today", icon: Home },
    { to: "/jobs", label: "Jobs", icon: Wrench },
    { to: "/calls", label: "Calls", icon: Phone },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ],
  technician: [
    { to: "/", label: "Today", icon: Home },
    { to: "/jobs", label: "Jobs", icon: Wrench },
    { to: "/calls", label: "Calls", icon: Phone },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/settings", label: "Settings", icon: SettingsIcon },
  ],
};

function BrandBar() {
  const { theme, toggle } = useTheme();
  const notifications = getNotificationSummary();
  return (
    <div className="sticky top-0 z-30 bg-background/55 backdrop-blur-xl backdrop-saturate-150 border-b border-border/60">
      <div className="px-5 h-14 flex items-center justify-between">
        <Link to="/" className="flex flex-col leading-none">
          <div className="flex items-baseline">
            <span className="text-[22px] font-bold tracking-[-0.04em] text-primary lowercase leading-none">t</span>
            <span className="text-[17px] font-bold tracking-[-0.02em] text-foreground lowercase">rowel</span>
          </div>
          <span className="text-[9px] text-muted-foreground uppercase tracking-[0.18em] mt-1 font-medium text-center">AI front desk</span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-8 w-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" strokeWidth={1.8} />
            ) : (
              <Moon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            )}
          </button>
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative h-8 w-8 grid place-items-center rounded-full text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {notifications.unread > 0 && (
              <span className="absolute top-1 right-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-semibold leading-none text-primary-foreground">
                {notifications.unread}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function MobileShell({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const { role } = useRole();
  const tabs = TAB_SETS[role];
  return (
    <div className="min-h-dvh flex justify-center">
      <div className="w-full max-w-[440px] min-h-dvh flex flex-col relative">
        <BrandBar />
        <main className="flex-1 pb-28">{children ?? <Outlet />}</main>

        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[440px] px-4 pb-4 pt-2">
            <div
              className="glass flex items-stretch justify-between rounded-3xl px-2 py-2"
            >
              {tabs.map((t) => {
                const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
                const Icon = t.icon;
                return (
                  <Link
                    key={t.to}
                    to={t.to}
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-2xl transition-colors"
                  >
                    <Icon
                      className={`h-[22px] w-[22px] transition-colors ${
                        active ? "text-primary" : "text-muted-foreground"
                      }`}
                      strokeWidth={active ? 2.4 : 1.8}
                    />
                    <span
                      className={`text-[10px] font-medium tracking-tight ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {t.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}


export function ScreenHeader({
  eyebrow,
  title,
  trailing,
}: {
  eyebrow?: string;
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="px-5 pt-6 pb-4 flex items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
            {eyebrow}
          </div>
        )}
        <h1 className="font-serif text-[34px] leading-[1.05] tracking-tight text-foreground mt-1">
          {title}
        </h1>
      </div>
      {trailing}
    </header>
  );
}

export function RolePill() {
  const { role, setRole } = useRole();
  const [open, setOpen] = useState(false);
  const current = ROLES.find((r) => r.id === role)!;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1.5 text-[11px] font-medium text-foreground"
        style={{ boxShadow: "var(--shadow-soft)" }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        {current.label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-60 rounded-2xl bg-surface border border-border p-1.5 z-40"
            style={{ boxShadow: "var(--shadow-pop)" }}
          >
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              View as
            </div>
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => { setRole(r.id); setOpen(false); }}
                className={`w-full flex items-start gap-2 rounded-xl px-3 py-2 text-left hover:bg-secondary ${
                  r.id === role ? "bg-secondary" : ""
                }`}
              >
                <div className="flex-1">
                  <div className="text-[13px] font-medium text-foreground">{r.label}</div>
                  <div className="text-[11px] text-muted-foreground">{r.sub}</div>
                </div>
                {r.id === role && <span className="text-primary text-[11px] mt-0.5">Active</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function PermissionNotice({ text = "Your role can view this, but cannot perform this action." }: { text?: string }) {
  return (
    <div className="rounded-2xl bg-warning/12 border border-warning/25 px-3 py-2 text-[11px] text-warning-foreground dark:bg-warning/15 dark:text-amber-100 dark:border-warning/50">
      {text}
    </div>
  );
}

export { MapPin };
