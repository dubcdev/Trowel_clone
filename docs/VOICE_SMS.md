# Voice And SMS Foundation

Batch 6 prepares Trowel for real Twilio Voice and SMS integration without turning on live side effects. The MVP activation model is forwarding-first: contractors keep their current public number, forward calls to the assigned AI voice number, and use a dedicated AI texting number until optional future porting.

## Current Scope

The app now has a provider-neutral voice/SMS model in `src/lib/voice-sms.ts`.

It includes:

- Twilio-ready inbound Voice webhook contract
- Twilio-ready inbound SMS webhook contract
- forwarding-first voice activation
- dedicated AI texting number for SMS continuity
- Conversation records across voice and SMS
- Transcript turns
- SMS continuation prompts
- Photo request state
- Intent extraction
- Urgency classification
- Trade detection
- Low-confidence and emergency escalation decisions
- Operational context lookup against customer memory and dispatch records

## Provider Contracts

Planned endpoints:

- `/api/webhooks/twilio/voice/inbound`
- `/api/webhooks/twilio/sms/inbound`

Required Voice fields:

- `CallSid`
- `From`
- `To`
- `CallStatus`
- `Direction`

Required SMS fields:

- `MessageSid`
- `From`
- `To`
- `Body`
- `NumMedia`

These contracts are intentionally marked `liveReady: false` until the real Twilio account, phone-number strategy, recording policy, and voice pipeline choices are confirmed.

Important MVP rule: A2P, campaign approval, carrier review, and SMS verification delays must not block voice activation or the contractor's operational dashboard.

MVP voice path:

1. Existing business number receives the customer call.
2. Carrier call forwarding sends the call to the assigned Twilio AI voice number.
3. Twilio routes the call to the AI receptionist pipeline.
4. AI handles intake, booking, escalation, summary, dispatch, and post-call workflows.

MVP SMS path:

1. Original inbound SMS can stay with the contractor's current carrier.
2. Trowel sends post-call continuity SMS from the dedicated AI texting number.
3. Replies, photos, payment links, appointment updates, and technician updates continue in the AI-managed thread.
4. Optional future number porting can later unify voice and SMS under the original business number.

## AI Safety Rules

The voice/SMS layer blocks automatic booking when:

- Emergency escalation is required
- Conversation confidence is below 80
- Related dispatch event is critical
- Payment or availability policy is unclear

The AI may continue by SMS, request photos, summarize the issue, and create a hold, but it should not invent availability, prices, or safety advice.

## UI Wiring

- `src/routes/calls.tsx` now reads conversation records, average latency, SMS continuation count, photo requests, intent, urgency, and auto-book status.
- `src/routes/messages.tsx` now renders active SMS continuation from the conversation model and shows memory/safety context.
- `src/lib/app-data.ts` marks Voice and SMS as wired in the production readiness map.

## Ready For Twilio Input

The next live-integration batch needs:

- Twilio account SID/auth setup approach
- Phone number or SIP forwarding plan
- Whether calls should be recorded
- Recording retention policy
- Whether inbound calls should start with Twilio Media Streams, TwiML, or another realtime bridge
- SMS/MMS media handling preferences
- Business hours and after-hours routing behavior
- Owner/dispatcher notification destinations
