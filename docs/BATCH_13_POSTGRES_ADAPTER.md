# Batch 13 PostgreSQL Adapter Shell

Batch 13 prepares the app to switch from mock repositories to PostgreSQL repositories without turning on a live database yet.

## Added

- PostgreSQL config/client boundary in `src/lib/postgres.ts`
- SQL repository adapter stubs in `src/lib/postgres-repositories.ts`
- Repository mode switch support through `VITE_TROWEL_REPOSITORY_MODE`
- Database config status through `VITE_TROWEL_DATABASE_URL`
- Seed SQL export script: `bun run seed:sql`
- Generated seed file path: `db/seed/0001_mock_seed.sql`

## Current Safe Defaults

- Repository mode defaults to `mock`
- Database adapter throws if used before credentials are configured
- No live database writes happen
- No Twilio, Stripe, calendar, or SMS side effects happen

## To Turn On Database Later

1. Set `VITE_TROWEL_DATABASE_URL`
2. Run migrations in order:
   - `db/migrations/0001_core_schema.sql`
   - `db/migrations/0002_persistence_readiness.sql`
3. Generate seed SQL with `bun run seed:sql`
4. Review and load `db/seed/0001_mock_seed.sql`
5. Set `VITE_TROWEL_REPOSITORY_MODE=database`
6. Replace the unavailable client in `src/lib/postgres.ts` with the real database driver implementation
