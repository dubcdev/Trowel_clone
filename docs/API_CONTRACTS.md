# API Contracts

Batch 10 created the first backend contract layer. Batch 11 expands it into a broader mobile API surface that the app can move onto screen by screen once PostgreSQL and auth are live.

## Current State

- API contracts live in `src/lib/backend.ts`.
- Tenant guards are modeled with `requireTenantPermission`.
- Mock-backed repositories use the existing app data boundary.
- Mock-backed HTTP routes now exist for the first mobile API set.
- Calls, dispatch, team, onboarding, and settings readiness now have first-class mock-backed API routes.
- A typed frontend client boundary lives in `src/lib/mobile-api.ts`.
- Repository ports and the active mock/database mode live in `src/lib/persistence.ts`.
- Seed-shaped current app records live in `src/lib/seed-data.ts`.
- PostgreSQL adapter shell lives in `src/lib/postgres.ts` and `src/lib/postgres-repositories.ts`.
- Reviewable seed SQL can be generated with `bun run seed:sql`.
- Technician views are filtered to assigned jobs/customers.
- Sensitive write actions have audit-log drafts.
- SQL migration foundation lives in `db/migrations/0001_core_schema.sql`.

## Mobile API Shape

The first mobile APIs should stay lightweight:

- `GET /api/mobile/snapshot`
- `GET /api/calls`
- `GET /api/customers`
- `GET /api/jobs`
- `GET /api/dispatch`
- `GET /api/team`
- `GET /api/onboarding`
- `PATCH /api/jobs/:jobId/status`
- `GET /api/notifications`
- `GET /api/settings/readiness`
- `POST /api/dispatch/:dispatchId/approve`
- `POST /api/payments/requests`
- `GET /api/audit-log`

## Required Guard

Every handler must check:

1. user is authenticated
2. user belongs to requested business
3. role has permission
4. technician is assigned when using technician-only views
5. sensitive actions create an audit log

## Pending Live Work

- Replace mock-backed route handlers with database-backed handlers.
- Connect Clerk or Auth0 session claims.
- Connect PostgreSQL pool/client.
- Run `db/migrations/0001_core_schema.sql` and `db/migrations/0002_persistence_readiness.sql`.
- Load seed-shaped data from `src/lib/seed-data.ts` or a generated seed script.
- Replace `createUnavailableDatabaseClient()` with a real PostgreSQL driver implementation.
- Configure `VITE_TROWEL_DATABASE_URL` and then `VITE_TROWEL_REPOSITORY_MODE=database`.
- Move route components from static imports to `mobileApi` calls after data loading strategy is chosen.
- Move current seeded data into migrations or seed scripts.
- Add API tests for tenant isolation and role permissions.
