# Backend Schema Draft

This is the first production schema contract for Trowel. It mirrors the prototype data and is designed for PostgreSQL.

The first migration contract is `db/migrations/0001_core_schema.sql`.

## Tenant Core

- `businesses`: contractor account, trade categories, timezone, public phone, website, go-live state.
- `business_locations`: physical locations, service areas, ZIP coverage, timezone overrides.
- `users`: authenticated users from Clerk/Auth0.
- `business_memberships`: user-to-business relationship, role, active state.
- `role_permissions`: granular permission map for owner, office manager, dispatcher, technician.
- `operational_audit_logs`: every sensitive operational action.

## Customers And Memory

- `customers`: identity, phone, service address, communication preference, membership status.
- `customer_memory`: durable memory summary and AI-safe notes.
- `issue_history`: prior issues, category, trade, urgency, resolution state.
- `equipment_history`: customer equipment and service history.
- `repeat_issue_flags`: repeat complaint, callback risk, frustration, unresolved scores.
- `sentiment_history`: sentiment over time and source conversation.
- `technician_relationships`: preferred tech and prior technician continuity.
- `unresolved_issue_tracking`: open issues that should be prioritized in future conversations.
- `customer_preferences`: contact method, time windows, notes, membership rules.

## Calls, Messages, And AI

- `calls`: Twilio call SID, caller, business, status, recording reference, transcript reference.
- `conversations`: voice, SMS, webchat, and future WhatsApp continuity thread.
- `conversation_messages`: inbound/outbound messages and AI/system/owner attribution.
- `uploaded_photos`: customer photo storage references and job/customer links.
- `ai_summaries`: call summaries, daily digests, customer memory summaries, dispatch summaries.
- `ai_decisions`: urgency, confidence, escalation, sentiment, repeat issue, and payment decision traces.

## Jobs, Scheduling, And Dispatch

- `jobs`: customer work item, trade, issue, status, priority, source conversation.
- `appointments`: booked or held windows, provider references, status, source of truth.
- `technicians`: skills, trades, emergency eligibility, active status.
- `technician_availability`: shifts, PTO, blocked time, working hours, emergency holds.
- `technician_assignments`: job-to-technician assignments, reassignment history.
- `dispatch_events`: emergency events, AI recommendation, urgency, confidence, ETA.
- `dispatch_approvals`: owner/dispatcher approval and override history.
- `calendar_providers`: Google, Outlook, iCloud, Calendly, field-service providers, CalDAV, ICS.
- `calendars`: connected calendars and sync state.
- `scheduling_rules`: business hours, booking windows, after-hours rules, drive buffers.
- `dispatch_windows`: bookable windows and protected emergency slots.
- `blocked_time`: manual blocks, PTO, current jobs, no-book zones.
- `recurring_jobs`: recurring service and maintenance schedules.
- `sync_events`: provider sync activity.
- `sync_failures`: sync failures, retries, duplicate prevention, rate-limit events.
- `appointment_status_history`: state changes and source attribution.

## Payments

- `payment_accounts`: Stripe Connect account and readiness state.
- `payment_policies`: diagnostic fees, deposits, emergency deposits, waivers, quote-required rules.
- `payment_requests`: payment link request, job/customer/appointment relationship.
- `deposits`: required or waived deposits.
- `invoices`: lightweight operational invoices/payment links.
- `payment_events`: provider webhook events.
- `refund_events`: refund state and source.
- `payment_status_history`: requested, pending, paid, failed, waived, refunded.

## Enrichment And Onboarding

- `enrichment_runs`: input identity, status, started/finished timestamps.
- `enrichment_sources`: source URL, source type, robots/rate-limit metadata.
- `enriched_fields`: field value, confidence, source URL, editable flag, confirmation requirement.
- `onboarding_confirmations`: owner confirmations by field and timestamp.
- `ai_receptionist_profiles`: confirmed voice, intake, scheduling, escalation, payment, and memory behavior.
- `demo_calls`: generated demo call samples and approval state.

## Notifications

- `notifications`: push/SMS/email notification records.
- `notification_preferences`: user and role preferences.
- `notification_delivery_events`: sent, failed, opened, actioned.
