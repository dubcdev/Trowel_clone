# Batch 11 Backend Wiring

Batch 11 turns the prototype data model into a broader mobile API surface without adding live vendor side effects yet.

## Added

- `GET /api/calls`
- `GET /api/dispatch`
- `GET /api/team`
- `GET /api/onboarding`
- `GET /api/settings/readiness`
- `src/lib/mobile-api.ts` typed frontend API client

## Why This Matters

The mobile screens can now move away from direct static imports one screen at a time. The route handlers still return mock-backed data, but they pass through tenant permission checks and match the production boundary we will later connect to PostgreSQL, Clerk/Auth0, Twilio, Stripe, and scheduling providers.

## Guardrails

- No real Twilio calls yet.
- No real Stripe calls yet.
- No calendar writes yet.
- No customer data leaves the app.
- Technician views remain filtered by tenant/role where assigned access applies.

## Next Backend Step

Replace the mock repository reads with PostgreSQL-backed repositories and add route-level tests for:

- owner vs technician data access
- dispatch approval audit creation
- payment request safety
- call review buckets
- onboarding readiness payload shape
