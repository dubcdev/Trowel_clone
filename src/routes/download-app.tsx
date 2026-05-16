import { createFileRoute, Link } from "@tanstack/react-router";
import { Apple, MonitorSmartphone, Play, Smartphone } from "lucide-react";
import { appDownloadOptions } from "@/lib/web-portal";
import { AppPhonePreview, WebPageShell } from "@/routes/website";

export const Route = createFileRoute("/download-app")({ component: DownloadAppScreen });

function DownloadAppScreen() {
  return (
    <WebPageShell>
      <section className="px-5 py-10">
        <div className="mx-auto grid max-w-6xl items-center gap-10 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="max-w-2xl">
              <div className="text-[12px] uppercase tracking-[0.16em] font-semibold text-primary">After setup</div>
              <h1 className="mt-3 font-serif text-[46px] leading-none text-foreground">Download the mobile command center.</h1>
              <p className="mt-4 text-[16px] leading-7 text-muted-foreground">
                Existing owners and team members log in here after web signup, payment, and onboarding. The app is for operations, not subscription checkout.
              </p>
            </div>
            <div className="mt-7 grid gap-3 md:grid-cols-3">
              {appDownloadOptions.map((option) => (
                <div key={option.id} className="rounded-3xl bg-surface border border-border p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center">
                    {option.id === "ios" ? <Apple className="h-5 w-5 text-primary" /> : option.id === "android" ? <Play className="h-5 w-5 text-primary" /> : <MonitorSmartphone className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="mt-4 text-[18px] font-semibold text-foreground">{option.label}</div>
                  <div className="mt-1 text-[12px] uppercase tracking-wider font-semibold text-primary">{option.status}</div>
                  <div className="mt-2 text-sm leading-6 text-muted-foreground">{option.detail}</div>
                  {option.id === "web" && (
                    <Link to="/" className="mt-4 inline-flex rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                      Open app
                    </Link>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-3xl bg-surface border border-border p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Login only</div>
                  <div className="mt-1 text-sm leading-6 text-muted-foreground">
                    App access is controlled by backend entitlement status. If an account is pending, failed, suspended, or canceled, the app shows neutral support messaging.
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-5 rounded-3xl bg-surface border border-border p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="font-semibold text-foreground">What the owner sees first</div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {["Urgent alerts", "Calls needing review", "Jobs today", "Unpaid invoices"].map((item) => (
                  <div key={item} className="rounded-2xl bg-surface-2 px-3 py-3 text-[13px] font-semibold text-foreground">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[320px]">
            <AppPhonePreview />
          </div>
        </div>
      </section>
    </WebPageShell>
  );
}
