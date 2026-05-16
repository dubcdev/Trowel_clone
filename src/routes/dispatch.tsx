import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PermissionNotice, RolePill, ScreenHeader } from "@/components/MobileShell";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import { useState } from "react";
import { PaymentChip } from "@/components/PaymentStatus";
import { assessPaymentForBooking, confirmationLabel, getPaymentPolicyForJob } from "@/lib/payments";
import { appData } from "@/lib/app-data";
import {
  DispatchEvent,
  getDispatchSummary,
  tradeLabel,
} from "@/lib/operations";
import { assessDispatchEvent, getSchedulingSummary } from "@/lib/scheduling";
import { useRole } from "@/lib/role";
import { EtaEstimate, getDispatchActionPlan, getDispatchEtaSummary, getEtaEstimates } from "@/lib/eta";
import { createDispatchApprovalReceipt, DispatchApprovalReceipt } from "@/lib/dispatch-approval";

export const Route = createFileRoute("/dispatch")({ component: DispatchScreen });

type DispatchView = "approvals" | "crew" | "rules";

function DispatchScreen() {
  const { can, session } = useRole();
  const [selected, setSelected] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<DispatchView>("approvals");
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const [receipts, setReceipts] = useState<Record<string, DispatchApprovalReceipt>>({});
  const summary = getDispatchSummary();
  const scheduling = getSchedulingSummary();
  const etaSummary = getDispatchEtaSummary();
  const active = appData.dispatchEvents.find((e) => e.id === selected);
  const activeReceipt = receiptId ? receipts[receiptId] : undefined;

  function approveDispatch(event: DispatchEvent) {
    const receipt = createDispatchApprovalReceipt(event, session);
    setApprovedIds((ids) => ids.includes(event.id) ? ids : [...ids, event.id]);
    setReceipts((current) => ({ ...current, [event.id]: receipt }));
    setReceiptId(event.id);
  }

  return (
    <MobileShell>
      <ScreenHeader eyebrow={`${appData.dispatchEvents.length} urgent job`} title="Dispatch" trailing={<RolePill />} />

      {!can("dispatch:approve") && (
        <section className="px-5 mb-4">
          <PermissionNotice text="You can look, but an owner or dispatcher must say OK before sending someone." />
        </section>
      )}

      <div className="px-5 grid grid-cols-3 gap-2 mb-5">
        <Stat label="Needs OK" value={String(summary.approvals)} tone="destructive" active={activeView === "approvals"} onClick={() => setActiveView("approvals")} />
        <Stat label="Crew" value={String(summary.available)} tone="success" active={activeView === "crew"} onClick={() => setActiveView("crew")} />
        <Stat label="Safety" value={String(summary.heldSlots)} tone="warning" active={activeView === "rules"} onClick={() => setActiveView("rules")} />
      </div>

      {activeView === "rules" && (
        <>
          <section className="px-5 mb-5">
            <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl bg-primary/10 grid place-items-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold tracking-tight text-foreground">Arrival times</div>
                  <div className="text-[12px] text-muted-foreground">{etaSummary.liveLocations} live location, {etaSummary.staleLocations} backup location. Map: {etaSummary.provider.replace("_", " ")}.</div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 mb-5">
            <div className="rounded-3xl bg-surface border border-border p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl bg-destructive/10 grid place-items-center">
                  <ShieldCheck className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <div className="text-[15px] font-semibold tracking-tight text-foreground">Safety checks</div>
                  <div className="text-[12px] text-muted-foreground">{scheduling.source.label} shows open times. Urgent jobs wait for a person to say OK.</div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeView === "approvals" && <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground">Urgent jobs</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-destructive live-dot" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-destructive" />
            </span>
            Needs OK
          </div>
        </div>

        <div className="space-y-3">
          {appData.dispatchEvents.map((e) => {
            const plan = getDispatchActionPlan(e);
            const recommendation = plan.eta;
            const assessment = assessDispatchEvent(e);
            const paymentAssessment = assessPaymentForBooking(e.payment, getPaymentPolicyForJob({ trade: e.trade, emergency: true }));
            return (
            <article key={e.id} className="w-full text-left relative rounded-3xl bg-surface border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
              <span className="absolute left-0 top-0 bottom-0 w-1 bg-destructive" />
              <div className="p-4 pl-5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 dark:bg-destructive/25 dark:text-red-100 dark:border-destructive/60">
                    <AlertTriangle className="h-3 w-3" />
                    {e.urgency}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{e.received}</span>
                  {approvedIds.includes(e.id) && (
                    <span className="rounded-full bg-success/12 border border-success/25 text-success text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                      Approved
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-[22px] leading-tight mt-1.5 text-foreground">{e.customer}</h3>
                <div className="text-[13px] text-foreground/80">{e.issue}</div>

                <div className="mt-2.5 flex items-center gap-3 text-[12px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.location}</span>
                  <span>-</span>
                  <span>{e.distance}</span>
                </div>

                <div className="mt-3 rounded-2xl bg-surface-2 border border-border p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <UserRoundCheck className="h-3 w-3 text-primary" />
                    Customer notes
                  </div>
                  <div className="mt-1 text-[12.5px] text-foreground/80 leading-snug">{e.memory}</div>
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    <Score label="Repeat" value={e.repeatIssueScore} />
                    <Score label="Callback" value={e.callbackRiskScore} />
                    <Score label="Anger" value={e.frustrationScore} />
                    <Score label="Open" value={e.unresolvedScore} />
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-secondary/60 border border-border p-3">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Best choice
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <div className="text-[13px] font-medium text-foreground">{recommendation.technician.name}</div>
                    <div className="text-[12px] text-muted-foreground">{recommendation.display} - {recommendation.confidence}%</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {recommendation.reasons.slice(0, 3).map((r) => <MiniChip key={r}>{r}</MiniChip>)}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Arrival time: {recommendation.source.replace("_", " ")} - {recommendation.freshness} - {recommendation.provider.replace("_", " ")}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {plan.nextAction}
                  </div>
                  {recommendation.warnings.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {recommendation.warnings.slice(0, 2).map((warning) => <WarningChip key={warning}>{warning}</WarningChip>)}
                    </div>
                  )}
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {assessment.source.label} - {assessment.window?.label ?? "No safe time"} - {assessment.decision === "book" ? "safe to send" : "needs OK"}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {confirmationLabel(paymentAssessment.confirmationState)} - {paymentAssessment.canConfirmBooking ? "booking can confirm" : "payment gate active"}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <PaymentChip payment={e.payment} />
                  <span className="text-[11px] text-muted-foreground">{e.photos}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!can("dispatch:approve")}
                    onClick={() => approvedIds.includes(e.id) ? setReceiptId(e.id) : can("dispatch:approve") && approveDispatch(e)}
                    className={`flex-1 inline-flex items-center justify-center gap-1 rounded-full text-[13px] font-medium px-3.5 py-2 ${
                      can("dispatch:approve")
                        ? "bg-foreground text-background"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" /> {approvedIds.includes(e.id) ? "Approved" : can("dispatch:approve") ? "Say OK" : "Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(e.id)}
                    className="rounded-full bg-surface border border-border text-foreground/80 text-[13px] font-medium px-3.5 py-2 inline-flex items-center gap-1"
                  >
                    Review
                  </button>
                </div>
              </div>
            </article>
          );
          })} 
        </div>
      </section>}

      {activeView === "crew" && <section className="px-5 mb-4">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-foreground mb-1">Crew</h2>
        <div className="text-[12px] text-muted-foreground mb-3">Who can take the next job and how long they may take.</div>
        <ul className="rounded-3xl bg-surface border border-border divide-y divide-border overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
          {appData.technicians.map((t) => {
            const eta = getEtaEstimates(appData.dispatchEvents[0])[0]?.technician.id === t.id
              ? getEtaEstimates(appData.dispatchEvents[0])[0]
              : getEtaEstimates(appData.dispatchEvents[0]).find((estimate) => estimate.technician.id === t.id);
            return (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="h-9 w-9 rounded-2xl bg-secondary flex items-center justify-center text-[13px] font-semibold text-foreground/70">
                {t.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-foreground tracking-tight">{t.name}</div>
                <div className="text-[12px] text-muted-foreground">{t.trades.map(tradeLabel).join("/")} - {statusLabel(t.status)} - {t.activeJobs} jobs</div>
                <div className="text-[11px] text-muted-foreground truncate">{t.shift.start} to {t.shift.end} - {t.serviceAreas.join(", ")}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Arrives</div>
                <div className="text-[12px] font-medium text-foreground">{eta?.display ?? "Manual"}</div>
                <div className="text-[10px] text-muted-foreground">{eta?.source.replace("_", " ") ?? "No source"}</div>
              </div>
            </li>
          )})}
        </ul>
      </section>}

      {active && (
        <DispatchSheet event={active} receipt={receipts[active.id]} approved={approvedIds.includes(active.id)} onApprove={() => approveDispatch(active)} onOpenReceipt={() => setReceiptId(active.id)} onClose={() => setSelected(null)} />
      )}

      {activeReceipt && (
        <ApprovalReceiptSheet receipt={activeReceipt} onClose={() => setReceiptId(null)} />
      )}
    </MobileShell>
  );
}

function DispatchSheet({ event: active, receipt, approved, onApprove, onOpenReceipt, onClose }: { event: DispatchEvent; receipt?: DispatchApprovalReceipt; approved: boolean; onApprove: () => void; onOpenReceipt: () => void; onClose: () => void }) {
  const { can } = useRole();
  const recommendations = getEtaEstimates(active);
  const plan = getDispatchActionPlan(active);
  const recommendation = recommendations[0];
  const assessment = assessDispatchEvent(active);
  const paymentAssessment = assessPaymentForBooking(active.payment, getPaymentPolicyForJob({ trade: active.trade, emergency: true }));

  return (
        <Sheet onClose={onClose}>
          <div className="px-5 pt-4 pb-6">
            <div className="mx-auto h-1 w-10 rounded-full bg-border mb-4" />
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 dark:bg-destructive/25 dark:text-red-100 dark:border-destructive/60">
                <AlertTriangle className="h-3 w-3" /> {active.urgency}
              </span>
              <span className="text-[11px] text-muted-foreground">{active.received}</span>
            </div>
            <h3 className="font-serif text-[28px] mt-1 text-foreground leading-tight">{active.customer}</h3>
            <div className="text-[14px] text-foreground/80">{active.issue}</div>

            <div className="mt-4 rounded-2xl bg-surface-2 p-3.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Transcript summary</div>
              <p className="text-[13px] text-foreground/85 leading-snug">{active.summary}</p>
            </div>

            <div className="mt-3 rounded-2xl bg-surface-2 p-3.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">Customer memory</div>
              <p className="text-[13px] text-foreground/85 leading-snug">{active.memory}</p>
              <Link to="/customers/$customerId" params={{ customerId: active.customerId }} className="mt-2 inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground text-[12px] font-medium px-3 py-1.5">
                Open customer file <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Assign technician</div>
              <div className="space-y-2">
                {recommendations.map((r) => (
                  <TechnicianOption key={r.technician.id} estimate={r} selected={r.technician.id === recommendation.technician.id} />
                ))}
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-surface p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                <MapPin className="h-3 w-3" /> ETA breakdown
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <EtaPart label="Delay" value={`${recommendation.currentJobDelayMinutes}m`} />
                <EtaPart label="Wrap" value={`${recommendation.wrapUpBufferMinutes}m`} />
                <EtaPart label="Drive" value={`${recommendation.driveMinutes}m`} />
                <EtaPart label="Buffer" value={`${recommendation.dispatchBufferMinutes}m`} />
              </div>
              <div className="mt-2 text-[12px] text-foreground/80">{plan.auditSummary}</div>
              {recommendation.warnings.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {recommendation.warnings.map((warning) => <WarningChip key={warning}>{warning}</WarningChip>)}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-surface p-3.5">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                <CalendarClock className="h-3 w-3" /> Safety checks
              </div>
              <div className="mb-2 text-[12px] text-foreground/80">
                {assessment.source.label}: {assessment.window?.label ?? "No safe dispatch window"} - {assessment.confidence}% confidence.
              </div>
              <div className="mb-2 text-[12px] text-foreground/80">
                {confirmationLabel(paymentAssessment.confirmationState)}: {paymentAssessment.nextAction}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {active.safetyRules.map((r) => <MiniChip key={r}>{r}</MiniChip>)}
                {assessment.approvalReasons.map((r) => <MiniChip key={r}>{r}</MiniChip>)}
                {paymentAssessment.safetyNotes.map((r) => <MiniChip key={r}>{r}</MiniChip>)}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <PaymentChip payment={active.payment} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!can("dispatch:approve")}
                onClick={approved ? onOpenReceipt : onApprove}
                className={`rounded-full text-[14px] font-medium px-4 py-3 ${can("dispatch:approve") ? "bg-foreground text-background" : "bg-secondary text-muted-foreground"}`}
              >
                {approved ? "View receipt" : can("dispatch:approve") ? `Send ${recommendation.technician.name}` : "Needs OK"}
              </button>
              <button disabled={!can("jobs:assign")} className={`rounded-full text-[14px] font-medium px-4 py-3 ${can("jobs:assign") ? "bg-secondary text-secondary-foreground" : "bg-secondary text-muted-foreground"}`}>
                Manual assign
              </button>
              <button className="rounded-full bg-secondary text-secondary-foreground text-[14px] font-medium px-4 py-3 inline-flex items-center justify-center gap-1">
                <Phone className="h-4 w-4" /> Callback
              </button>
              <button disabled={!can("dispatch:approve")} className={`rounded-full text-[14px] font-medium px-4 py-3 ${can("dispatch:approve") ? "bg-secondary text-secondary-foreground" : "bg-secondary text-muted-foreground"}`}>
                Hold job
              </button>
            </div>
            {receipt && (
              <div className="mt-3 rounded-2xl bg-success/10 border border-success/20 px-3 py-2">
                <div className="text-[12px] font-semibold text-foreground">Approved by {receipt.approvedBy}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  {receipt.assignedTechnician.name} locked. Customer SMS and technician alert are ready.
                </div>
              </div>
            )}
          </div>
        </Sheet>
  );
}

function ApprovalReceiptSheet({ receipt, onClose }: { receipt: DispatchApprovalReceipt; onClose: () => void }) {
  return (
    <Sheet onClose={onClose}>
      <div className="px-5 pt-4 pb-6">
        <div className="mx-auto h-1 w-10 rounded-full bg-border mb-4" />
        <div className="inline-flex items-center gap-1 rounded-full bg-success/12 border border-success/25 text-success px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold">
          <Check className="h-3 w-3" /> Approved
        </div>
        <h3 className="font-serif text-[28px] leading-tight mt-2 text-foreground">{receipt.customer}</h3>
        <div className="text-[14px] text-foreground/80">{receipt.issue}</div>

        <div className="mt-4 rounded-2xl bg-surface-2 border border-border p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Assigned technician</div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold text-foreground">{receipt.assignedTechnician.name}</div>
              <div className="text-[12px] text-muted-foreground">{receipt.assignedTechnician.etaSource}</div>
            </div>
            <div className="text-right">
              <div className="font-serif text-[22px] leading-none text-foreground">{receipt.assignedTechnician.eta}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{receipt.assignedTechnician.etaConfidence}% sure</div>
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <ReceiptStatus icon={ShieldCheck} label="Job" value="Locked" />
          <ReceiptStatus icon={Send} label="Customer SMS" value={statusCopy(receipt.customerSmsStatus)} />
          <ReceiptStatus icon={UserRoundCheck} label="Tech alert" value={statusCopy(receipt.technicianNotificationStatus)} />
          <ReceiptStatus icon={CreditCard} label="Payment" value={receipt.paymentStatus} />
        </div>

        <div className="mt-3 rounded-2xl bg-surface border border-border p-3.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            <FileText className="h-3 w-3" /> Audit trail
          </div>
          <div className="mt-1 text-[12px] text-foreground/80 leading-snug">{receipt.auditSummary}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {receipt.approvedAt} by {receipt.approvedBy}. Stored as {receipt.audit.action}.
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          {receipt.nextActions.map((action) => (
            <Link key={action.label} to={action.destination} className="rounded-2xl bg-surface border border-border px-3 py-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-foreground">{action.label}</div>
                <div className="text-[11px] text-muted-foreground truncate">{action.detail}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-primary shrink-0" />
            </Link>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-full bg-secondary text-secondary-foreground text-[13px] font-medium py-3 inline-flex items-center justify-center gap-1.5">
            <Phone className="h-4 w-4" /> Call customer
          </button>
          <button className="rounded-full bg-secondary text-secondary-foreground text-[13px] font-medium py-3 inline-flex items-center justify-center gap-1.5">
            <RotateCcw className="h-4 w-4" /> Reassign
          </button>
        </div>
      </div>
    </Sheet>
  );
}

function ReceiptStatus({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 border border-border px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 text-[13px] font-semibold text-foreground capitalize">{value}</div>
    </div>
  );
}

function statusCopy(status: string) {
  return status.replaceAll("_", " ");
}

function TechnicianOption({ estimate, selected }: { estimate: EtaEstimate; selected: boolean }) {
  const t = estimate.technician;
  return (
                  <button className={`w-full flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-left ${selected ? "border-primary bg-primary/5 dark:bg-primary/15" : "border-border bg-surface"}`}>
                    <div className="h-8 w-8 rounded-xl bg-secondary flex items-center justify-center text-[12px] font-semibold text-foreground/70">
                      {t.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-foreground">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{statusLabel(t.status)} - {estimate.display} - {estimate.confidence}%</div>
                      <div className="text-[10px] text-muted-foreground truncate">{estimate.source.replace("_", " ")} - {estimate.freshness}</div>
                    </div>
                    {selected && <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">AI pick</span>}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
  );
}

function EtaPart({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 border border-border px-1.5 py-1.5 text-center">
      <div className="font-serif text-[17px] leading-none text-foreground">{value}</div>
      <div className="text-[8px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "on_job") return "On job";
  if (status === "off_duty") return "Off duty";
  if (status === "pto") return "PTO";
  return "Available";
}

function Stat({ label, value, tone, active, onClick }: { label: string; value: string; tone: "success" | "warning" | "destructive"; active: boolean; onClick: () => void }) {
  const dot = tone === "success" ? "bg-success" : tone === "warning" ? "bg-warning" : "bg-destructive";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border px-3 py-3 text-left transition-colors ${active ? "soft-selected-card" : "bg-surface text-foreground border-border"}`}
      style={{ boxShadow: "var(--shadow-soft)" }}
    >
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        <span className={`text-[11px] ${active ? "soft-selected-label" : "text-muted-foreground"}`}>{label}</span>
      </div>
      <div className="font-serif text-2xl leading-none mt-1.5 text-foreground">{value}</div>
    </button>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? "text-destructive" : value >= 50 ? "text-warning-foreground dark:text-amber-100" : "text-success";
  return (
    <div className="rounded-xl bg-surface px-1.5 py-1.5 text-center border border-border">
      <div className={`font-serif text-[17px] leading-none ${color}`}>{value}</div>
      <div className="text-[8px] uppercase tracking-wider font-semibold text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MiniChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-surface border border-border text-[10px] text-foreground/80 font-medium px-2 py-0.5">
      {children}
    </span>
  );
}

function WarningChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-warning/15 border border-warning/25 text-[10px] text-warning-foreground font-medium px-2 py-0.5 dark:bg-warning/20 dark:text-amber-100 dark:border-warning/60">
      {children}
    </span>
  );
}

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[440px] max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-surface border-t border-border" style={{ boxShadow: "var(--shadow-pop)" }}>
        {children}
      </div>
    </div>
  );
}
