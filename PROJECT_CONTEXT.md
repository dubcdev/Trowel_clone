# Trowel Product Context

Trowel is a mobile-first AI front desk for contractor businesses. It replaces or augments the front desk receptionist for HVAC, plumbing, electrical, roofing, garage door, appliance repair, restoration, locksmith, landscaping, pest control, pool service, and other field-service companies.

The product is not a generic chatbot or workflow builder. It should feel like a calm, dependable receptionist living inside the owner phone.

## Platform Strategy

Trowel has two surfaces:

- Mobile app: daily operations dashboard for existing contractor customers and team members.
- Web portal: public site, signup, SaaS billing, onboarding, Twilio/A2P setup, team setup, calendar setup, service/rate setup, contractor Stripe Connect setup, and admin/account management.

The mobile app is the operating layer. The web portal is the setup, admin, and subscription layer.

## Primary Mobile Tabs

- Today: live operational summary, urgent approvals, daily digest preview, revenue and reliability checks.
- Calls: voice AI call queue, call outcomes, escalation state, repeat issue scores, customer memory context.
- Jobs: scheduling, technician assignment, emergency holds, conflict detection, payment status.
- Customers: customer memory, history, repeat issue risk, open work, payment status, and follow-up context.
- Settings: onboarding, enrichment confirmations, integrations, roles, payment rules, AI safety controls.

## MVP Contract

The MVP must do five things extremely well:

- Answer naturally with low latency and smooth turn-taking.
- Book appointments only against real availability.
- Handle after-hours calls and protect revenue.
- Escalate emergencies, angry customers, low-confidence calls, pricing uncertainty, and scheduling uncertainty.
- Summarize operations daily.

Reliability is more important than sophistication.

## Backend Architecture Target

- Frontend: React Native or Expo with TypeScript for production mobile; current repo is a TanStack/Vite interface prototype.
- Backend: Node.js and TypeScript services.
- Database: PostgreSQL with tenant isolation.
- Realtime: WebSockets for live calls, dispatch, jobs, and notifications.
- Queues: BullMQ or Temporal for enrichment, sync, reminders, digests, and retries.
- Voice/SMS: Twilio Voice and Twilio SMS.
- AI: OpenAI realtime voice plus retrieval-based operational memory.
- Auth: Clerk or Auth0.
- Platform billing: Stripe Billing and Stripe Checkout on the web portal for the contractor SaaS subscription.
- Contractor payments: Stripe Connect for contractor-owned invoices, deposits, diagnostic fees, service payments, and payment links.
- Storage: S3-compatible storage for call recordings, transcripts, photos, and attachments.
- Push: Firebase/APNs.

## Core Services

- Voice receptionist service
- SMS continuity service
- Customer memory service
- Repeat issue detection service
- Scheduling engine
- Calendar provider adapters
- Emergency dispatch service
- Payment request service
- Enrichment service
- Notification service
- Daily digest service
- RBAC and audit service

## Customer Memory Priority

When a customer contacts the business, retrieve context in this order:

1. Unresolved issues
2. Recent appointments
3. Repeat complaints
4. Technician continuity
5. Emergency history
6. Communication preferences

The AI should sound familiar and competent, but never invasive.

## Scheduling Safety Rules

The AI must never invent availability, double-book technicians, ignore travel buffers, schedule outside configured rules, or overwrite calendar data silently.

If uncertainty exists, the system must escalate to the owner, dispatcher, or manual approval mode.

## App Store / Play Store Payment Rules Strategy

The mobile app is an existing-customer operations dashboard.

SaaS subscription signup and billing happen on the website/web portal through Stripe Billing and Stripe Checkout. The mobile app must not include SaaS pricing, checkout, upgrade/downgrade, plan comparison, trial conversion, or external payment-routing language for the app subscription.

The mobile app may display neutral entitlement/account status such as active, onboarding pending, payment failed, suspended, canceled, trialing, or contact support. Non-active states should use neutral support language, not subscription purchase language.

Contractor client invoicing is separate and is for real-world contractor services. Contractor client payments use Stripe Connect and go to the contractor connected Stripe account. The platform does not take a cut of contractor client payments for now, but the data model leaves room for a future application fee.

The mobile app may create/send invoices, request deposits, send payment links, mark manual payments, and display invoice/payment status for real-world contractor services. Keep language clear so app subscription billing is never confused with contractor customer invoicing.

References:

- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Apple In-App Purchase: https://developer.apple.com/in-app-purchase/
- Google Play Payments Policy: https://support.google.com/googleplay/android-developer/answer/10281818
- Stripe Connect: https://stripe.com/connect
- Stripe Connect Invoices: https://docs.stripe.com/connect/invoices
- Stripe Connect Payment Links: https://docs.stripe.com/connect/payment-links

## Payment Safety Rules

Payments are optional. Payment setup must not block onboarding.

The AI must never invent prices. It can request a diagnostic fee, deposit, emergency deposit, invoice payment, or waived payment only when the amount comes from confirmed business settings, owner-approved service rules, dispatcher approval, or predefined deposit configuration.

Two payment flows must stay separate:

- Flow A: contractor pays Trowel for the SaaS subscription. This is web-only platform billing using Stripe Billing/Checkout.
- Flow B: homeowner/customer pays the contractor for real-world services. This uses the contractor connected Stripe account through Stripe Connect and may be initiated from mobile job/customer screens.

## Enrichment Rules

The enrichment pipeline may use only publicly accessible, legally compliant sources such as the contractor website, sitemap, schema markup, public contact pages, public services pages, public FAQ pages, compliant business APIs, and public directories where allowed.

Every enriched field must carry:

- confidence score
- source URL
- editable flag
- owner confirmation requirement
- timestamp

Scraped or enriched information is never treated as confirmed until the owner approves it.

## RBAC

- Owner/Admin: all data, integrations, payment configuration, refunds, dispatch override, approvals, permissions.
- Owner/Admin web portal only: platform SaaS billing management.
- Office Manager: calls, conversations, appointments, job-level payments, scheduling rules where allowed.
- Dispatcher: assign and reschedule jobs, approve dispatch, send payment links where allowed.
- Technician: assigned jobs and assigned customer context only.
- Internal Platform Admin: businesses, subscription status, onboarding status, Twilio/A2P status, Stripe Connect status, error logs, webhook logs, support actions, and audit logs.

## Data Model Areas

- businesses
- technicians
- customers
- customer_memory
- issue_history
- equipment_history
- repeat_issue_flags
- sentiment_history
- technician_relationships
- unresolved_issue_tracking
- customer_preferences
- calls
- conversations
- appointments
- jobs
- escalations
- uploaded_photos
- ai_summaries
- notifications
- dispatch_events
- calendars
- calendar_providers
- technician_availability
- scheduling_rules
- blocked_time
- sync_events
- payment_accounts
- payment_requests
- deposits
- invoices
- payment_events
- refund_events
- platform_customers
- platform_subscriptions
- platform_invoices
- entitlement_states
- connected_accounts
- contractor_invoices
- contractor_payment_links
- contractor_payments
- contractor_refunds
- job_payment_status
- twilio_numbers
- a2p_registrations
- operational_audit_logs

Keep platform SaaS billing tables separate from contractor customer payment tables.

## Product Tone

Calm, concise, helpful, and operationally intelligent. Avoid workflow-builder language, AI novelty language, and infrastructure jargon in the contractor-facing app.
