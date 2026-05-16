# Batch 12 Persistence Foundation

Batch 12 prepares the backend for real PostgreSQL persistence while keeping the app safely mock-backed.

## Added

- Repository mode selector in `src/lib/persistence.ts`
- Repository port status for customers, calls, jobs, dispatch, technicians, payments, notifications, onboarding, and audit logs
- Seed-shaped records in `src/lib/seed-data.ts`
- Migration additions in `db/migrations/0002_persistence_readiness.sql`
- Settings backend storage status showing mock mode, seed records, repository ports, API contracts, tables, and guards

## Current State

- Active repository mode: `mock`
- Database schema: staged
- Seed data: staged
- PostgreSQL client: not connected
- Live vendor side effects: disabled

## Next Step

Batch 13 can add the real PostgreSQL adapter shell:

- database client factory
- repository implementations using SQL
- seed loader script
- tenant isolation tests
- env-based repository mode switch
