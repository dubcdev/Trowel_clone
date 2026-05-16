import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { ArrowLeft, CreditCard, FileText, Send } from "lucide-react";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import {
  contractorConnectedAccount,
  contractorInvoices,
  contractorPaymentLinks,
  contractorPayments,
  contractorPaymentPolicy,
  getConnectStatus,
} from "@/lib/contractor-payments";

export const Route = createFileRoute("/invoices")({ component: InvoicesScreen });

function InvoicesScreen() {
  const connect = getConnectStatus();
  const openItems = contractorInvoices.filter((item) => item.paymentStatus !== "paid").length + contractorPaymentLinks.filter((item) => item.paymentStatus !== "paid").length;
  const collected = contractorPayments.reduce((sum, payment) => sum + (payment.paymentStatus === "paid" ? payment.amount : 0), 0);

  return (
    <MobileShell>
      <ScreenHeader
        eyebrow="Customer payments"
        title="Invoices"
        trailing={
          <Link to="/settings" className="rounded-full bg-surface border border-border p-2" aria-label="Back to settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        }
      />

      <section className="px-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="flex items-start gap-3">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 grid place-items-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[16px] font-semibold text-foreground">Contractor service payments</div>
              <div className="text-[12px] text-muted-foreground mt-1">
                These are homeowner payments for jobs, deposits, and service calls. SaaS billing stays in the web portal.
              </div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Metric value={String(openItems)} label="Open" />
            <Metric value={`$${collected}`} label="Collected" />
            <Metric value={connect.account.connectOnboardingStatus} label="Connect" />
          </div>
        </div>
      </section>

      <section className="px-5 mt-5">
        <h2 className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground mb-2">Job invoices</h2>
        <div className="rounded-3xl bg-surface border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
          {contractorInvoices.map((invoice) => (
            <InvoiceRow key={invoice.id} icon={FileText} title={invoice.memo} amount={invoice.amount} status={invoice.paymentStatus} meta={`${invoice.customerId} - ${invoice.invoiceStatus}`} />
          ))}
          {contractorPaymentLinks.map((link) => (
            <InvoiceRow key={link.id} icon={Send} title={`${link.reason.replaceAll("_", " ")} link`} amount={link.amount} status={link.paymentStatus} meta={`${link.customerId} - SMS ready`} />
          ))}
        </div>
      </section>

      <section className="px-5 mt-5">
        <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="text-[15px] font-semibold text-foreground">Payment setup</div>
          <div className="mt-1 text-[12px] text-muted-foreground">{connect.nextStep}</div>
          <div className="mt-3 rounded-2xl bg-surface-2 px-3 py-2">
            <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Platform fee</div>
            <div className="text-[13px] font-semibold text-foreground">
              {contractorPaymentPolicy.platformApplicationFeePercent}% for MVP
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              Money goes to the contractor connected account: {contractorConnectedAccount.connectedAccountId}
            </div>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 border border-border px-3 py-2">
      <div className="text-[18px] font-serif leading-none text-foreground capitalize">{value.replaceAll("_", " ")}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

function InvoiceRow({
  icon: Icon,
  title,
  amount,
  status,
  meta,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  amount: number;
  status: string;
  meta: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
      <div className="h-10 w-10 rounded-2xl bg-primary/10 grid place-items-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-foreground capitalize">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{meta}</div>
      </div>
      <div className="text-right">
        <div className="text-[14px] font-semibold text-foreground">${amount}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{status.replaceAll("_", " ")}</div>
      </div>
    </div>
  );
}
