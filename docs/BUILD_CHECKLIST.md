# Trowel Build Checklist

Current production completion: 51%.
Current frontend prototype completion: 80%.

This checklist is the build map for turning the mobile prototype into a working contractor front desk platform.

## Batch 1: Data Foundation

- [x] Mobile app shell
- [x] Mobile UX density rule: priority summary, decision queue, short recent list, detail only on demand
- [x] Contractor-specific domain model
- [x] Central app data boundary
- [x] Seed business, team, customer, jobs, dispatch, scheduling, onboarding, and payment data
- [x] PostgreSQL schema foundation
- [x] Database migration contract
- [x] Tenant-scoped repository boundary
- [x] Server API contract map
- [x] Mock-backed server API read endpoints
- [x] Mock-backed server API write endpoints
- [ ] Live database migrations
- [ ] Live tenant-scoped repositories
- [ ] Server API read endpoints
- [ ] Server API write endpoints

## Batch 2: Auth, Team, And RBAC

- [ ] Clerk or Auth0 auth
- [x] Mock session boundary
- [x] Business membership model draft
- [x] Owner, office manager, dispatcher, technician roles
- [x] Frontend permission checks on dispatch and settings actions
- [ ] Server-side permission checks on customer, job, dispatch, payment, and settings APIs
- [x] Server permission guard contract
- [x] Technician-only assigned-job view contract
- [x] Audit log draft helper
- [x] Mock server-side permission checks on customer, job, dispatch, payment, and settings APIs
- [ ] Live server-side permission checks on customer, job, dispatch, payment, and settings APIs
- [ ] Live audit logs for role and permission changes

## Batch 3: Scheduling And Jobs

- [x] Scheduling source abstraction
- [x] Internal fallback calendar concept
- [x] Contractor-friendly jobs queue UI
- [x] Technician availability model
- [x] Booking hold model
- [x] Conflict detection model
- [x] Internal lightweight calendar state
- [x] Calendar provider adapter interface
- [ ] Google Calendar sync
- [ ] Outlook/Microsoft 365 sync
- [x] Field-service provider adapter interface
- [x] Job status transitions

## Batch 4: Dispatch And ETA

- [x] Emergency dispatch screen
- [x] Technician recommendation UI
- [x] Emergency hold concept
- [x] ETA model
- [x] Technician location/status model
- [x] Routing provider adapter model
- [x] Wrap-up and drive buffer calculation
- [x] Dispatch approval contract
- [x] Technician assignment and reassignment contract
- [ ] Owner/dispatcher push notifications
- [ ] SMS/call dispatch follow-up

## Batch 5: Customer Memory

- [x] Customer memory UI
- [x] Repeat issue flags and scores mocked
- [x] Customer timeline model
- [x] Repeat issue detection service
- [x] Retrieval priority logic
- [x] AI-safe context packer
- [x] Technician continuity recommendations
- [ ] Customer memory tables
- [ ] Conversation continuity storage
- [ ] Equipment history storage

## Batch 6: Voice And SMS

- [x] Calls and messages UI
- [x] Forwarding-first MVP phone architecture
- [x] Twilio ISV master-account plus contractor subaccount architecture
- [x] Contractor-specific number, messaging reputation, and compliance isolation model
- [x] Twilio subaccount and number provisioning model
- [x] Dedicated AI texting number model
- [x] A2P 10DLC background compliance model
- [x] Secondary customer profile / brand / campaign registration status model
- [x] Carrier forwarding instructions model
- [x] Communication mode model
- [x] Optional future porting path
- [x] Mobile call-forwarding onboarding steps
- [x] Twilio Voice inbound webhook contract
- [x] Twilio SMS inbound webhook contract
- [x] Transcript and message persistence model
- [x] Call intent extraction
- [x] Urgency classification
- [x] SMS continuation model
- [x] Photo upload intake model
- [x] Low-confidence escalation model
- [ ] Live Twilio Voice inbound webhook
- [ ] Live SMS continuation webhook
- [ ] Live Twilio subaccount lifecycle API
- [ ] Live contractor-specific messaging service creation
- [ ] Twilio call recording/transcript storage
- [ ] OpenAI realtime voice session
- [ ] Interruption handling

## Batch 7: Payments

- [x] Payment policy model
- [x] Payment status UI
- [x] Payment safety rules
- [x] Stripe Connect account model
- [x] Payment request lifecycle model
- [x] Deposit, invoice, payment event, refund, and status history models
- [x] Payment action plan and AI-safe request rules
- [x] Role-based payment permissions modeled
- [ ] Live Stripe Connect onboarding
- [ ] Payment request API
- [ ] Live payment link creation
- [ ] Stripe webhook handling
- [ ] Refund execution

## Batch 8: Onboarding And Enrichment

- [x] Onboarding assistant UI
- [x] Enriched field confirmation model
- [x] Go-live checklist
- [x] Public source registry
- [x] Robots and rate-limit guardrail model
- [x] Owner confirmation persistence model
- [x] Intake profile generation model
- [x] Escalation rule draft model
- [x] AI receptionist profile generation model
- [x] Demo call readiness model
- [x] Enrichment audit log model
- [ ] Public enrichment API
- [ ] Website/sitemap/schema crawler
- [ ] Service and FAQ extractor
- [ ] Demo call audio generation

## Batch 9: Notifications And Daily Digest

- [x] Today dashboard concept
- [x] Notification records model
- [x] Notification preferences model
- [x] Notification delivery event model
- [x] Emergency alert rules
- [x] Payment alert rules
- [x] Booking conflict alert rules
- [x] Sync failure alert rules
- [x] Repeat issue alert rules
- [x] Bell count and alerts screen
- [x] Alert deep links to action screens
- [x] Daily digest generator
- [ ] Push notification service
- [ ] SMS notification service
- [ ] Email digest service
- [ ] Digest delivery by push/SMS/email

## Batch 10: Production Hardening

- [ ] TLS production deployment
- [ ] AES-256 encrypted sensitive fields
- [ ] Secure recording and transcript storage
- [ ] GDPR/CCPA readiness
- [ ] Tenant isolation tests
- [ ] No-training data policy controls
- [ ] Operational audit logs
- [ ] Error monitoring
- [ ] Load testing
- [ ] End-to-end QA

## Batch 15: Web Portal Signup And App Download

- [x] Public website route
- [x] Web pricing route
- [x] Web signup/payment handoff route
- [x] Signup API contract
- [x] App download route
- [x] Mobile app positioned as login/operations only
- [ ] Live Stripe Checkout session creation
- [ ] Post-checkout business account creation
- [ ] Production onboarding redirect after successful payment
- [ ] App Store download link
- [ ] Google Play download link

## Batch 16: Webpage Refinement

- [x] Homepage messaging refinement
- [x] Contractor-specific use-case section
- [x] Setup trust points
- [x] FAQ section
- [x] Pricing support copy
- [x] Signup handoff polish
- [x] Download app handoff polish
- [ ] Final brand visuals and imagery
- [ ] Full desktop responsive QA
- [ ] Full mobile responsive QA
