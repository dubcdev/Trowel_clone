# Customer Memory Engine

Batch 5 turns customer memory from profile copy into an operational contract the AI receptionist can use safely.

## Inputs

- Customer identity, phone, communication preference, service address, membership status
- Customer timeline across calls, texts, visits, photos, notes, and escalations
- Equipment and service history
- Preferred technician and technician relationship history
- Current jobs, emergency holds, and unresolved issues
- Sentiment, callback risk, repeat issue, and unresolved issue scores

## Detection Outputs

Each customer receives:

- `repeatIssueFlag`
- `callbackRiskScore`
- `customerFrustrationScore`
- `unresolvedIssueScore`
- `detectedPattern`
- `operationalReason`

The detection logic prioritizes operational usefulness over novelty. A high unresolved score means the receptionist should address the open issue before treating the call as a new routine booking.

## Retrieval Priority

The AI context pack uses this order:

1. Unresolved issues
2. Repeat complaints
3. Callback risk
4. Technician continuity
5. Emergency history
6. Communication preferences and membership priority

## AI Context Pack

The context pack includes:

- Safe greeting context
- Ranked retrieved signals
- Suggested safe phrases
- Suppressed context the AI should not say aloud
- Escalation requirement
- Next best action

Internal scores, lifetime value, warranty assumptions, pricing assumptions, and unconfirmed policy are intentionally suppressed.

## Current Implementation

- `src/lib/customer-memory.ts` provides the memory service layer.
- `src/routes/customers.tsx` shows memory readiness and operational reasons on the customer list.
- `src/routes/customers.$customerId.tsx` shows the AI context pack, ranked signals, escalation state, and suppressed context.
- `src/routes/index.tsx` surfaces repeat issue and context pack counts on Today.

## Production Next Steps

- Persist records in PostgreSQL tables: `customer_memory`, `issue_history`, `equipment_history`, `repeat_issue_flags`, `sentiment_history`, `technician_relationships`, `unresolved_issue_tracking`, and `continuity_recommendations`.
- Store conversation continuity across voice, SMS, and mobile app.
- Move detection into a server-side service that runs after calls, texts, visits, and job completion events.
- Add tenant isolation, audit logs, and encrypted transcript references.
