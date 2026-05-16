# Auth And RBAC Contract

Batch 2 establishes the permission model before connecting a real auth provider.

## Current Prototype State

- `src/lib/rbac.ts` defines roles, permissions, mock sessions, and access helpers.
- `src/lib/role.tsx` exposes the current session, role, permissions, and `can(permission)`.
- Settings shows current role permissions.
- Dispatch actions are permission-aware.
- Owner-only setup controls are visually locked for lower-permission roles.

## Production Auth Provider

Use Clerk or Auth0.

Required claims:

- `user_id`
- `business_id`
- `role`
- `membership_id`
- `assigned_technician_id` when role is technician
- `permissions_version`

## Roles

- Owner/Admin: full operational control.
- Office Manager: calls, customers, jobs, job-level payments, onboarding confirmation where allowed.
- Dispatcher: dispatch, job assignment, scheduling, payment links and waivers where allowed.
- Technician: assigned jobs and assigned customer context only.

## Required Server Checks

Every server endpoint must verify:

- user is authenticated
- user is an active member of the business
- requested business id matches membership
- role has the required permission
- technician role can access only assigned jobs/customers
- action is written to `operational_audit_logs` when sensitive

## Sensitive Permissions

- `dispatch:approve`
- `dispatch:override`
- `jobs:assign`
- `jobs:reschedule`
- `payments:configure`
- `payments:send_link`
- `payments:waive`
- `payments:refund`
- `settings:manage`
- `onboarding:confirm`
- `team:manage`
- `audit:view`

## API Enforcement Pattern

Each API handler should call a shared guard:

```ts
requirePermission(session, businessId, "dispatch:approve");
```

For technician-scoped access:

```ts
requireAssignedTechnician(session, job.technicianId);
```

## Audit Events

Audit these actions:

- role changed
- technician added or removed
- dispatch approved
- dispatch manually overridden
- technician reassigned
- job rescheduled
- payment link sent
- deposit waived
- refund issued
- onboarding field confirmed
- AI receptionist profile changed
- integration connected or disconnected

