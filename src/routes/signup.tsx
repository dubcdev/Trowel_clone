import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { ArrowRight, CheckCircle2, CreditCard, Download, PhoneForwarded, UserRoundCheck } from "lucide-react";
import { getSignupStartDraft, signupWorkflow } from "@/lib/web-portal";
import { WebPageShell } from "@/routes/website";

export const Route = createFileRoute("/signup")({ component: SignupScreen });

function SignupScreen() {
  const draft = getSignupStartDraft();

  return (
    <WebPageShell>
      <section className="px-5 py-10">
        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="text-[12px] uppercase tracking-[0.16em] font-semibold text-primary">Get started</div>
            <h1 className="mt-3 font-serif text-[46px] leading-none text-foreground">Create the account, pay on the web, then turn on the front desk.</h1>
            <p className="mt-4 text-[16px] leading-7 text-muted-foreground">
              This flow is for the contractor subscription to Trowel. After checkout, the owner completes onboarding and downloads the mobile app for daily operations.
            </p>
            <div className="mt-6 rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 grid place-items-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">Stripe Checkout handoff</div>
                  <div className="text-sm text-muted-foreground">Mode: {draft.checkout.mode}. Surface: {draft.checkout.allowedSurface.replaceAll("_", " ")}.</div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                  Continue to secure checkout
                </button>
                <Link to="/portal" className="rounded-full bg-surface-2 border border-border px-5 py-3 text-sm font-semibold text-foreground">
                  Open setup portal
                </Link>
              </div>
              <div className="mt-3 text-[12px] leading-5 text-muted-foreground">
                Live version calls `/api/billing/checkout-session`, then returns the owner to onboarding after payment.
              </div>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <TrustTile icon={PhoneForwarded} title="Keep your number" detail="Forward calls first. Porting can wait." />
              <TrustTile icon={CheckCircle2} title="App stays clean" detail="The mobile app is login and operations only." />
            </div>
          </div>

          <div className="rounded-3xl bg-surface border border-border p-5" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="text-[15px] font-semibold text-foreground">Signup path</div>
            <div className="mt-4 space-y-3">
              {signupWorkflow.map((step, index) => (
                <div key={step.id} className="flex gap-3 rounded-2xl bg-surface-2 px-3 py-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-[12px] font-bold text-primary">{index + 1}</div>
                  <div>
                    <div className="text-[14px] font-semibold text-foreground">{step.label}</div>
                    <div className="mt-0.5 text-[12px] leading-5 text-muted-foreground">{step.detail}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wider text-primary font-semibold">{step.status.replaceAll("_", " ")}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/portal" className="flex items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2.5 text-xs font-semibold text-foreground">
                <UserRoundCheck className="h-3.5 w-3.5" /> Portal
              </Link>
              <Link to="/download-app" className="flex items-center justify-center gap-1.5 rounded-full bg-secondary px-3 py-2.5 text-xs font-semibold text-foreground">
                <Download className="h-3.5 w-3.5" /> Download
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-10">
        <div className="mx-auto flex max-w-5xl items-center justify-between rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <div className="text-sm text-muted-foreground">Mobile app does not sell the SaaS subscription or route users to external payment.</div>
          </div>
          <ArrowRight className="hidden h-4 w-4 text-muted-foreground md:block" />
        </div>
      </section>
    </WebPageShell>
  );
}

function TrustTile({ icon: Icon, title, detail }: { icon: ComponentType<{ className?: string }>; title: string; detail: string }) {
  return (
    <div className="rounded-2xl bg-surface border border-border px-3 py-3" style={{ boxShadow: "var(--shadow-soft)" }}>
      <Icon className="h-4 w-4 text-primary" />
      <div className="mt-2 text-[13px] font-semibold text-foreground">{title}</div>
      <div className="mt-0.5 text-[12px] leading-5 text-muted-foreground">{detail}</div>
    </div>
  );
}
