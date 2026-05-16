import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, ScreenHeader } from "@/components/MobileShell";
import { AlertTriangle, Image as ImageIcon, Send, ShieldCheck, Sparkles, UserRoundCheck } from "lucide-react";
import { ConversationRecord, conversations, getOperationalConversationContext, getVoiceSmsSummary } from "@/lib/voice-sms";

export const Route = createFileRoute("/messages")({ component: MessagesScreen });

type MessageView = "active" | "escalated" | "photos" | "all";

function MessagesScreen() {
  const [activeView, setActiveView] = useState<MessageView>("active");
  const rows = getMessageRows(activeView);
  const active = rows[0] ?? conversations[0];
  const activeContext = getOperationalConversationContext(active);
  const summary = getVoiceSmsSummary();
  const viewCopy = getMessageViewCopy(activeView);

  return (
    <MobileShell>
      <ScreenHeader eyebrow="Texts with customers" title="Messages" />

      <div className="px-5">
        <div className="rounded-3xl bg-surface border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <div className="text-[14px] font-semibold tracking-tight">{active.customerName}</div>
              <div className="text-[11px] text-muted-foreground">Open now - you can jump in anytime</div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2 py-0.5">
              Emergency
            </span>
          </div>
          <div className="p-4 space-y-2.5">
            {active.transcript.map((turn, index) => (
              <Bubble key={`${turn.at}-${index}`} side={turn.speaker === "customer" ? "them" : "ai"}>{turn.text}</Bubble>
            ))}
            {active.photoRequest?.status === "received" && <Bubble side="them">photo.jpg</Bubble>}
            {active.smsContinuation && <Bubble side="ai">{active.smsContinuation}</Bubble>}
          </div>
          <div className="px-4 pb-3">
            <div className="rounded-2xl bg-surface-2 px-3 py-2 mb-3 flex items-start gap-2">
              <UserRoundCheck className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Saved notes used</div>
                <div className="text-[12px] text-foreground/75 leading-snug">
                  {active.memoryUsed.join(". ")}. Next: {activeContext.nextAction}
                </div>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <StatusTile icon={ShieldCheck} label="Follow-ups" value={String(summary.smsContinuations)} />
              <StatusTile icon={AlertTriangle} label="Need help" value={String(summary.escalated)} />
            </div>
            <div className="mb-3 grid grid-cols-4 gap-2">
              <MessageFilter label="Active" value={conversations.length} active={activeView === "active"} onClick={() => setActiveView("active")} />
              <MessageFilter label="Need help" value={conversations.filter((c) => c.escalation?.required).length} active={activeView === "escalated"} onClick={() => setActiveView("escalated")} />
              <MessageFilter label="Photos" value={conversations.filter((c) => c.photoRequest).length} active={activeView === "photos"} onClick={() => setActiveView("photos")} />
              <MessageFilter label="All" value={conversations.length} active={activeView === "all"} onClick={() => setActiveView("all")} />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-surface-2 border border-border px-3 py-2">
              <button className="h-8 w-8 rounded-xl bg-surface flex items-center justify-center border border-border">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </button>
              <input placeholder="Type a reply..." className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
              <button className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
                <Send className="h-4 w-4 text-primary-foreground" />
              </button>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Suggested next step: "{active.escalation?.suggestedAction ?? activeContext.nextAction}"
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-7 mb-3">
        <h2 className="text-[13px] font-semibold uppercase text-foreground" style={{ letterSpacing: "0.06em" }}>{viewCopy.title}</h2>
        <div className="text-[12px] text-muted-foreground mt-1">{viewCopy.sub}</div>
      </div>
      <ul className="px-5 space-y-2">
        {rows.map((t) => (
          <li key={t.id} className="rounded-2xl bg-surface border border-border px-4 py-3 flex items-center gap-3" style={{ boxShadow: "var(--shadow-soft)" }}>
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold">
              {t.customerName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-[14px] font-semibold tracking-tight truncate">{t.customerName}</div>
                <div className="text-[11px] text-muted-foreground">{t.receivedAt.replace("Today ", "").replace("Yesterday ", "Yesterday")}</div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="text-[12.5px] text-muted-foreground truncate">{t.smsContinuation ?? t.summary}</div>
                {t.escalation?.required && <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold px-1.5">!</span>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </MobileShell>
  );
}

function MessageFilter({ label, value, active, onClick }: { label: string; value: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border px-2 py-2 text-left transition-colors ${active ? "soft-selected-card" : "bg-surface text-foreground border-border"}`}
    >
      <div className="font-serif text-[18px] leading-none text-foreground">{value}</div>
      <div className={`text-[9px] uppercase tracking-wider mt-1 ${active ? "soft-selected-label" : "text-muted-foreground"}`}>{label}</div>
    </button>
  );
}

function getMessageRows(view: MessageView) {
  if (view === "escalated") return conversations.filter((c) => c.escalation?.required);
  if (view === "photos") return conversations.filter((c) => c.photoRequest);
  return conversations;
}

function getMessageViewCopy(view: MessageView) {
  if (view === "escalated") return { title: "Need help", sub: "Messages a person should check." };
  if (view === "photos") return { title: "Photos", sub: "Customers who sent or need to send photos." };
  if (view === "all") return { title: "All messages", sub: "Every recent customer text." };
  return { title: "Open messages", sub: "Customer texts being handled now." };
}

function StatusTile({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 border border-border px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="font-serif text-[22px] leading-none text-foreground mt-1">{value}</div>
    </div>
  );
}

function Bubble({ side, children }: { side: "them" | "ai"; children: React.ReactNode }) {
  if (side === "them") {
    return (
      <div className="flex justify-start">
        <div className="max-w-[78%] rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2 text-[13.5px] text-foreground">{children}</div>
      </div>
    );
  }
  return (
    <div className="flex justify-end">
      <div className="max-w-[78%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-[13.5px] text-primary-foreground">{children}</div>
    </div>
  );
}
