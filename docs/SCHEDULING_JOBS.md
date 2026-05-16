# Scheduling And Jobs Backend Contract

Batch 3 turns scheduling and jobs from screen data into backend-facing workflow contracts.

## Current Prototype State

- `src/lib/scheduling.ts` assesses availability, conflicts, schedule source, and approval reasons.
- `src/lib/job-workflow.ts` defines booking holds, job transitions, provider adapters, and internal calendar state.
- Jobs UI now shows backend workflow status: holds, approvals, adapters, hold expiry, and allowed transitions.

## Booking Hold Contract

Booking holds protect a slot before the system writes a final appointment.

Required fields:

- `business_id`
- `job_id`
- `technician_id`
- `appointment_id`
- `window_id`
- `source_kind`
- `status`
- `expires_at`
- `conflicts`
- `approval_required`
- `created_by`
- `created_from_conversation_id`

Statuses:

- `available`
- `held`
- `blocked`
- `requires_approval`
- `expired`
- `converted_to_appointment`

## Job Status Transitions

Allowed transitions:

- `scheduled -> en_route`
- `scheduled -> in_progress`
- `en_route -> in_progress`
- `in_progress -> completed`
- `scheduled -> held`
- `held -> scheduled`
- `scheduled -> canceled`

Rules:

- Emergency jobs can be held automatically, but not confirmed without owner/dispatcher approval.
- Completed jobs cannot be reopened without an audit entry.
- Active jobs cannot be canceled directly.
- Rescheduling must run availability and conflict checks before writing.

## Conflict Detection

Conflict checks must include:

- technician trade fit
- technician service area
- technician shift
- PTO/off-duty state
- current job block
- emergency eligibility
- job load
- travel buffer
- payment gate when payment is required
- source sync confidence

## Provider Adapter Interface

Every calendar or field-service provider should implement:

- `readAvailability`
- `createHold`
- `bookAppointment`
- `rescheduleAppointment`
- `cancelAppointment`
- `syncWebhook`
- `handleRateLimit`
- `dedupeAppointment`

Provider classes:

- Field-service systems: ServiceTitan, Jobber, Housecall Pro, Workiz, FieldPulse.
- General calendars: Google, Outlook/Microsoft 365, iCloud, Calendly, Cal.com, Square.
- Internal calendar: Trowel lightweight fallback.

## Internal Calendar

Internal calendar must store:

- technician shifts
- blocked time
- PTO
- emergency holds
- recurring jobs
- service areas
- travel buffers
- appointment statuses
- assignment history

## API Endpoints

Initial endpoints:

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `POST /api/jobs/:id/hold`
- `POST /api/jobs/:id/transition`
- `POST /api/jobs/:id/assign`
- `POST /api/jobs/:id/reschedule`
- `GET /api/availability`
- `POST /api/availability/hold`
- `GET /api/calendar/providers`
- `POST /api/calendar/providers/:id/sync`

Every write endpoint must enforce RBAC and write an audit log entry.

