# Batch Build Plan

The goal is to build in batches that each unlock a larger working surface.

## Batch 1: Data Foundation

Status: completed.

Deliverables:

- Central app data boundary in `src/lib/app-data.ts`.
- Backend schema contract in `docs/BACKEND_SCHEMA.md`.
- Build checklist in `docs/BUILD_CHECKLIST.md`.
- UI imports moved toward the app data boundary.

## Batch 2: Auth, Team, RBAC

Status: completed.

Deliverables:

- Real user/business/team model.
- Role-gated views and actions.
- Technician-only assigned job visibility.
- Audit log entries for sensitive role changes.

## Batch 3: Scheduling And Jobs

Status: completed.

Deliverables:

- Internal calendar API.
- Availability/hold/conflict endpoints.
- Job status transition endpoints.
- Calendar adapter interface.

## Batch 4: Dispatch And ETA

Status: completed.

Deliverables:

- ETA model and service.
- Location/status source model.
- Dispatch approval and assignment endpoints.
- Routing provider adapter.

## Batch 5: Customer Memory

Status: completed.

Deliverables:

- Persistent customer memory.
- Repeat issue detection.
- Retrieval packer for AI conversations.
- Technician continuity recommendations.

## Batch 6: Voice And SMS

Status: foundation completed. Forwarding-first phone activation is modeled. Live Twilio integration is waiting on account/call-flow details.

Deliverables:

- Twilio Voice/SMS webhooks.
- Twilio ISV architecture: master platform account, contractor subaccounts, contractor-specific numbers, messaging service, reputation, and compliance.
- Twilio subaccount and AI number provisioning.
- Carrier call-forwarding onboarding.
- Dedicated AI texting number and optional future porting path.
- A2P 10DLC background compliance model that never blocks voice activation.
- Realtime AI receptionist session.
- Transcript and message persistence.
- Escalation triggers.

## Batch 7: Payments

Status: foundation completed. Live Stripe Connect, Checkout, and webhook wiring are pending provider credentials and final payment policy decisions.

Deliverables:

- Stripe Connect account model.
- Payment request lifecycle.
- Deposit, invoice, payment event, refund, and status history model.
- AI-safe payment request rules.
- Payment permission checks.
- Live payment links and webhook status updates.

## Batch 8: Onboarding And Enrichment

Status: foundation completed. Public source registry, owner confirmation records, intake profile, escalation rules, receptionist profile, audit log, and demo-call readiness are modeled. Live crawler/API work is pending.

Deliverables:

- Public source registry and compliance guardrails.
- Owner confirmation persistence model.
- Intake profile generator.
- Escalation rule drafts.
- AI receptionist profile generator.
- Demo call readiness.
- Enrichment audit log.
- Public data enrichment worker.

## Batch 9: Notifications And Digests

Status: foundation completed. In-app alert records, delivery events, preferences, deep links, and daily digest are wired. Live push/SMS/email delivery is pending provider setup.

Deliverables:

- Push/SMS notification delivery.
- Daily digest generator.
- Alert rules for emergencies, payments, sync failures, repeat issues.
- Bell count and alerts screen.
- Mobile deep links from each alert to the right action surface.

## Batch 10: Production Hardening

Status: not started. Security, encryption, observability, deployment, and end-to-end QA are still pending.

Deliverables:

- Security, encryption, observability, deployment, and end-to-end QA.

## Batch 10A: Backend Foundation

Status: foundation completed. PostgreSQL migration contract, tenant guard, repository boundary, API contract map, and audit-log draft path are modeled. Live database/auth route handlers are pending.

Deliverables:

- PostgreSQL core schema migration.
- Tenant-scoped repository boundary.
- API contract map for mobile snapshot, customers, jobs, dispatch, payments, notifications, and audit log.
- Server permission guard contract.
- Technician assigned-view filtering.
- Audit-log draft helper for sensitive write actions.

## Batch 10B: Mock-Backed API Routes

Status: completed. The first mobile API set is reachable over HTTP and returns tenant-guarded mock responses.

Deliverables:

- `GET /api/mobile/snapshot`
- `GET /api/customers`
- `GET /api/jobs`
- `PATCH /api/jobs/:jobId/status`
- `POST /api/dispatch/:dispatchId/approve`
- `POST /api/payments/requests`
- `GET /api/notifications`
- `GET /api/audit-log`
- Endpoint QA for owner, dispatcher, and technician role modes.

## Batch 15: Web Portal Signup And App Download

Status: foundation completed. Public website, pricing, signup/payment handoff, and app download surfaces are modeled in the web app. Live Stripe Checkout creation and native app store links are pending.

Deliverables:

- Public website route for contractor product education.
- Web pricing route for SaaS subscription review.
- Web signup route that hands off to Stripe Checkout for the platform subscription.
- Signup API contract for pending business creation and checkout handoff.
- App download route for existing owners/team members after onboarding.
- Clear separation between web-only SaaS billing and mobile operations.

## Batch 16: Webpage Refinement

Status: completed. The website now has clearer contractor positioning, trade-specific use cases, trust points, FAQ, and tighter website-to-pricing-to-signup-to-download flow. Desktop and mobile responsive polish should continue as copy and brand direction mature.

Deliverables:

- Refined public homepage copy and hero proof card.
- Outcome metric strip.
- Contractor trade/use-case cards.
- Setup trust points and call-forwarding reassurance.
- FAQ section.
- Pricing support copy.
- Signup and app-download handoff polish.
- Browser QA for page loads and key CTA links.
