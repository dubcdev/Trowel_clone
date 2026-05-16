import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Headphones,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import trowelMark from "@/assets/trowel-mark.png";

export const Route = createFileRoute("/website")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "trowel - The AI front desk for field-service crews" },
      {
        name: "description",
        content:
          "trowel answers every call, books the right job, and routes the right tech - built mobile-first for HVAC, plumbing, electrical, and trades.",
      },
      { property: "og:title", content: "trowel - AI front desk for the trades" },
      {
        property: "og:description",
        content: "Never miss another job. AI captures the call, qualifies the lead, and dispatches your crew.",
      },
    ],
  }),
});

function LandingPage() {
  return (
    <WebPageShell>
      <Hero />
      <LogoStrip />
      <FeatureGrid />
      <ProductPreview />
      <RolesSection />
      <Stats />
      <PricingTeaser />
      <FAQ />
      <CTA />
      <Footer />
    </WebPageShell>
  );
}

function Nav() {
  return (
    <header className="sticky top-3 z-40 px-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-3 glass">
        <a href="/website#top" className="rounded-full px-2.5 py-1.5 leading-none transition-colors hover:bg-secondary/60">
          <div className="leading-none">
            <div className="flex items-baseline">
              <span className="text-[22px] font-bold tracking-[-0.04em] text-primary lowercase leading-none">t</span>
              <span className="text-[17px] font-bold tracking-[-0.02em] text-foreground lowercase">rowel</span>
            </div>
            <div className="mt-1 text-[8px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">AI front desk</div>
          </div>
        </a>
        <nav className="hidden items-center gap-7 text-[13px] text-foreground/75 md:flex">
          <a href="/website#features" className="hover:text-foreground">Features</a>
          <a href="/website#preview" className="hover:text-foreground">Product</a>
          <a href="/website#roles" className="hover:text-foreground">Roles</a>
          <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
          <Link to="/portal" className="hover:text-foreground">Portal</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/portal" className="hidden rounded-full px-3 py-1.5 text-[13px] text-foreground/80 hover:bg-secondary sm:inline-flex">
            Sign in
          </Link>
          <Link
            to="/download-app"
            className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background"
          >
            Download App <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative px-5 pb-12 pt-16 md:pt-24">
      <div className="mx-auto max-w-6xl text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-foreground/75 glass">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-primary live-dot" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Live - answering calls right now
        </div>

        <h1 className="mt-5 font-serif text-[44px] leading-[0.95] tracking-tight text-foreground sm:text-[68px] md:text-[88px]">
          The AI front desk
          <br />
          <span className="italic text-primary">for field-service crews.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">
          Trowel picks up every ring, qualifies the job, holds safe booking windows, and routes emergencies to the right person before your phone goes to voicemail.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-[14px] font-medium text-background"
            style={{ boxShadow: "var(--shadow-pop)" }}
          >
            Start web signup <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#preview" className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium glass">
            See it in action
          </a>
        </div>
      </div>

      <div className="relative mx-auto mt-14 max-w-sm float-soft">
        <AppPhonePreview />
      </div>
    </section>
  );
}

function AppPhonePreview() {
  return (
    <PhoneFrame>
      <AppHomePreview />
    </PhoneFrame>
  );
}

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto rounded-[44px] bg-foreground/90 p-2" style={{ boxShadow: "var(--shadow-pop)" }}>
      <div className="h-[600px] overflow-hidden rounded-[36px] bg-background">
        <div className="h-full overflow-y-auto no-scrollbar">{children}</div>
      </div>
    </div>
  );
}

function AppHomePreview() {
  return (
    <iframe
      title="Trowel mobile app home preview"
      src="/?preview=website-phone"
      className="h-full w-full border-0 bg-background pointer-events-none"
      scrolling="no"
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}

function LogoStrip() {
  const trades = ["HVAC", "Plumbing", "Electrical", "Roofing", "Garage Doors", "Locksmith", "Restoration"];
  return (
    <section className="px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Built for the trades</div>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {trades.map((trade) => (
            <span key={trade} className="font-serif text-[22px] italic text-foreground/55 md:text-[26px]">
              {trade}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureGrid() {
  const features = [
    {
      icon: Phone,
      tag: "Always-on",
      title: "Answers every call.",
      body: "AI picks up day, night, and weekend. No more voicemail black holes.",
    },
    {
      icon: Bot,
      tag: "Smart triage",
      title: "Knows what is urgent.",
      body: "Detects burst pipes, no cooling, burning smells, active leaks, and lockouts.",
    },
    {
      icon: CalendarCheck,
      tag: "Bookings",
      title: "Holds the slot safely.",
      body: "Uses real schedules, tech availability, holds, and approval rules instead of guessing.",
    },
    {
      icon: CreditCard,
      tag: "Cash flow",
      title: "Requests approved deposits.",
      body: "Sends secure links for owner-approved diagnostic fees, deposits, and invoices.",
    },
    {
      icon: Wrench,
      tag: "Dispatch",
      title: "Routes by skill and zone.",
      body: "Matches the job to the right technician by trade, workload, and service area.",
    },
    {
      icon: ShieldCheck,
      tag: "Trust",
      title: "Escalates uncertainty.",
      body: "If availability, pricing, or safety is unclear, Trowel asks the owner instead of improvising.",
    },
  ];

  return (
    <section id="features" className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>What it does</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-serif text-[40px] leading-[1] tracking-tight md:text-[56px]">
          A front desk that <span className="italic text-primary">never sleeps,</span> never fumbles a job.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  tag,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  tag: string;
  title: string;
  body: string;
}) {
  return (
    <div className="h-full rounded-3xl p-5 glass">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{tag}</span>
      </div>
      <h3 className="mt-3 font-serif text-[24px] leading-tight text-foreground">{title}</h3>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function ProductPreview() {
  return (
    <section id="preview" className="px-5 py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
        <div>
          <SectionEyebrow>Live activity</SectionEyebrow>
          <h2 className="mt-3 font-serif text-[40px] leading-[1] tracking-tight md:text-[52px]">
            See every call become a <span className="italic text-primary">clear next step.</span>
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Each ring is captured, qualified, and turned into an owner-ready record. Approve emergencies, watch deposits, and keep crews moving from the phone.
          </p>

          <ul className="mt-8 space-y-3">
            <Bullet icon={CheckCircle2} title="Diego accepted job" sub="AC tune-up - Erica Patel - Fri 10am" tone="success" />
            <Bullet icon={CreditCard} title="Payment link sent - $150" sub="Emergency deposit - owner-approved rule" tone="success" />
            <Bullet icon={Phone} title="AI flagged repeat issue" sub="Angela Brooks - unresolved kitchen leak" tone="accent" />
            <Bullet icon={Wrench} title="Sam marked en route" sub="Drain cleaning - ETA 12 min" tone="primary" />
          </ul>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-[60px] bg-gradient-to-br from-primary/15 via-transparent to-accent/30 blur-2xl" />
          <div className="relative rounded-3xl p-5 glass-strong">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium text-muted-foreground">Today so far</div>
                <div className="mt-1 font-serif text-[44px] leading-none">$4,820</div>
                <div className="mt-1 text-[11px] text-muted-foreground">in booked jobs</div>
              </div>
              <div className="inline-flex items-center gap-1 text-xs font-medium text-success">
                <ArrowUpRight className="h-3.5 w-3.5" />
                +28% vs yesterday
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-2">
              <ControlTile label="Available" value="1/3" tone="success" />
              <ControlTile label="Pending" value="2" tone="destructive" />
              <ControlTile label="Workload" value="83%" tone="warning" />
              <ControlTile label="Open" value="3" tone="muted" />
            </div>

            <div className="mt-5 rounded-2xl border border-border bg-surface p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive-foreground">
                  <AlertTriangle className="h-3 w-3" /> Emergency
                </span>
                <span className="text-[11px] text-muted-foreground">Oakland - 4 min ago</span>
              </div>
              <h3 className="mt-2 font-serif text-[22px] leading-tight">Angela Brooks - burst pipe</h3>
              <p className="mt-1 text-[12px] text-muted-foreground">
                AI confirmed shutoff, requested photos, found prior unresolved leak, and recommends Diego.
              </p>
              <div className="mt-3 flex gap-2">
                <button className="rounded-full bg-foreground px-3 py-1.5 text-[12px] font-medium text-background">
                  Approve dispatch
                </button>
                <button className="rounded-full bg-secondary px-3 py-1.5 text-[12px] font-medium text-secondary-foreground">
                  Review
                </button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-primary live-dot" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Live - 24 calls today
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bullet({
  icon: Icon,
  title,
  sub,
  tone,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  sub: string;
  tone: "success" | "accent" | "primary";
}) {
  const styles = {
    success: "bg-success/15 text-success",
    accent: "bg-accent text-accent-foreground",
    primary: "bg-primary/12 text-primary",
  }[tone];
  return (
    <li className="flex items-center gap-3 rounded-2xl p-3 glass">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${styles}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-medium text-foreground">{title}</div>
        <div className="truncate text-[12px] text-muted-foreground">{sub}</div>
      </div>
    </li>
  );
}

function ControlTile({ label, value, tone }: { label: string; value: string; tone: "success" | "warning" | "destructive" | "muted" }) {
  const dot =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "destructive"
          ? "bg-destructive"
          : "bg-muted-foreground/40";
  return (
    <div className="rounded-2xl border border-border bg-surface p-3" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <div className="mt-1.5 font-serif text-[22px] leading-none">{value}</div>
    </div>
  );
}

function RolesSection() {
  const roles = [
    {
      icon: Building2,
      role: "Owners",
      title: "Your shop, on a single screen.",
      body: "Revenue today, calls needing review, dispatch approvals, payment status, and the next thing to do.",
    },
    {
      icon: Sparkles,
      role: "Dispatchers",
      title: "A board that thinks ahead.",
      body: "Emergencies pinned, technician status visible, and risky bookings held until someone says OK.",
    },
    {
      icon: Navigation,
      role: "Technicians",
      title: "Just the next stop.",
      body: "One card, one route, one button to mark done. Photos, notes, payment status, and then move on.",
    },
  ];

  return (
    <section id="roles" className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>Built for every seat</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-serif text-[40px] leading-[1] tracking-tight md:text-[56px]">
          One system. <span className="italic text-primary">Three honest views.</span>
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {roles.map((item) => (
            <div key={item.role} className="rounded-3xl p-6 glass">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-background">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.role}</span>
              </div>
              <h3 className="mt-4 font-serif text-[26px] leading-tight">{item.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "24/7", label: "call answering coverage" },
    { value: "0", label: "phone ports required for MVP" },
    { value: "5", label: "core jobs: answer, book, after-hours, escalate, summarize" },
    { value: "1", label: "phone dashboard for the owner" },
  ];
  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-6xl rounded-3xl p-8 glass-strong md:p-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-serif text-[44px] leading-none text-foreground md:text-[58px]">{stat.value}</div>
              <div className="mt-2 max-w-[180px] text-[12px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section id="pricing" className="px-5 py-20">
      <div className="mx-auto max-w-4xl text-center">
        <SectionEyebrow>Web-only subscription signup</SectionEyebrow>
        <h2 className="mt-3 font-serif text-[40px] leading-[1] tracking-tight md:text-[56px]">
          Start on the web. <span className="italic text-primary">Run the shop from the app.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15px] text-muted-foreground">
          SaaS subscription checkout belongs in the web portal. The mobile app stays clean: existing customers log in and run daily operations.
        </p>

        <div className="mx-auto mt-10 max-w-md rounded-3xl p-8 text-left glass-strong">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Front Desk</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-[64px] leading-none">$500</span>
            <span className="text-[13px] text-muted-foreground">/ month</span>
          </div>
          <ul className="mt-6 space-y-2 text-[13px] text-foreground/85">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> AI phone answering</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Call-forwarding setup path</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Customer memory and repeat issues</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Dispatch approvals and payment status</li>
          </ul>
          <Link
            to="/pricing"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-[14px] font-medium text-background"
          >
            See plans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const questions = [
    {
      question: "Do we have to port our phone number right away?",
      answer: "No. Start with carrier call forwarding into the AI number. Porting can happen later if you want voice and SMS unified under the original number.",
    },
    {
      question: "Can the AI book without double-booking?",
      answer: "It should only use configured calendars, holds, hours, service areas, and approval rules. If uncertain, it holds or escalates instead of guessing.",
    },
    {
      question: "Can we collect deposits from customers?",
      answer: "Yes, for real-world contractor services through the contractor connected Stripe account. That is separate from the Trowel SaaS subscription.",
    },
    {
      question: "Is this a workflow builder?",
      answer: "No. It is meant to work out of the box for contractors: call intake, booking, emergency escalation, dispatch, memory, summaries, and payments.",
    },
  ];

  return (
    <section className="px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <SectionEyebrow>Owner questions</SectionEyebrow>
        <h2 className="mt-3 max-w-3xl font-serif text-[40px] leading-[1] tracking-tight md:text-[52px]">
          Simple answers before setup starts.
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {questions.map((item) => (
            <div key={item.question} className="rounded-3xl p-5 glass">
              <div className="text-[16px] font-semibold text-foreground">{item.question}</div>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="cta" className="px-5 py-20">
      <div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[40px] p-10 text-center md:p-16"
        style={{
          background: "linear-gradient(140deg, oklch(0.32 0.12 280), oklch(0.22 0.06 270))",
          boxShadow: "var(--shadow-pop)",
        }}
      >
        <div
          className="absolute -left-20 -top-20 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(closest-side, oklch(0.85 0.12 280 / 0.5), transparent)" }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full"
          style={{ background: "radial-gradient(closest-side, oklch(0.85 0.1 210 / 0.5), transparent)" }}
        />

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-background/20 bg-background/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-background/85">
            <Clock className="h-3 w-3" /> Operational in minutes
          </div>
          <h2 className="mt-5 font-serif text-[44px] leading-[1] tracking-tight text-background md:text-[64px]">
            Stop missing jobs.
            <br />
            <span className="italic">Start with forwarding.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15px] text-background/75">
            Sign up on the web, finish setup, then download the app your crew uses every day.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-[14px] font-semibold text-foreground">
              Start web signup <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/download-app" className="inline-flex items-center gap-2 rounded-full border border-background/25 bg-background/15 px-5 py-3 text-[14px] font-medium text-background">
              <MessageCircle className="h-4 w-4" /> Download app
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-5 pb-12 pt-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <img src={trowelMark} alt="" className="h-6 w-6 rounded-md object-cover" />
          <span className="font-serif text-[16px]">trowel</span>
        </div>
        <div className="text-[12px] text-muted-foreground">2026 trowel - Built for the trades that built everything else.</div>
        <div className="flex items-center gap-5 text-[12px] text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
      </div>
    </footer>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{children}</div>;
}

function WebPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Nav />
      {children}
    </div>
  );
}

export { AppPhonePreview, WebPageShell };
