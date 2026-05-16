import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ShieldCheck } from "lucide-react";
import { pricingPlans, websiteTrustPoints } from "@/lib/web-portal";
import { WebPageShell } from "@/routes/website";

export const Route = createFileRoute("/pricing")({ component: PricingScreen });

function PricingScreen() {
  return (
    <WebPageShell>
      <section className="px-5 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="max-w-2xl">
            <div className="text-[12px] uppercase tracking-[0.16em] font-semibold text-primary">Web-only subscription signup</div>
            <h1 className="mt-3 font-serif text-[46px] leading-none text-foreground">Pricing built for small contractor teams.</h1>
            <p className="mt-4 text-[16px] leading-7 text-muted-foreground">
              Subscription checkout happens here in the web portal. The mobile app remains the daily operations dashboard for existing accounts.
            </p>
          </div>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {pricingPlans.map((plan) => (
              <div key={plan.id} className="rounded-3xl bg-surface border border-border p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
                <div className="text-[20px] font-semibold text-foreground">{plan.name}</div>
                <div className="mt-3 flex items-end gap-2">
                  <div className="font-serif text-[46px] leading-none text-foreground">{plan.price}</div>
                  <div className="pb-2 text-sm text-muted-foreground">{plan.cadence}</div>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.bestFor}</p>
                <div className="mt-5 space-y-2">
                  {plan.included.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 text-primary" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link to="/signup" className="mt-5 inline-flex w-full justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl bg-surface border border-border p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-[17px] font-semibold text-foreground">Every plan keeps setup low-friction.</div>
                <div className="mt-1 text-sm leading-6 text-muted-foreground">
                  Start with call forwarding, run A2P/SMS checks in the background, and keep payment collection optional until the owner confirms rules.
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-4">
              {websiteTrustPoints.map((point) => (
                <div key={point} className="rounded-2xl bg-surface-2 px-3 py-2 text-[12px] font-semibold text-foreground">
                  {point}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </WebPageShell>
  );
}
