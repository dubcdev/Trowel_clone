-- Batch 12 persistence-readiness additions.
-- These tables fill gaps between the prototype model and the production data contract.

create table if not exists business_locations (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  label text not null,
  address text,
  city text,
  state text,
  postal_code text,
  timezone text,
  created_at timestamptz not null default now()
);

create table if not exists role_permissions (
  id text primary key,
  role text not null,
  permission text not null,
  created_at timestamptz not null default now(),
  unique (role, permission)
);

create table if not exists issue_history (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  issue_type text not null,
  trade text,
  status text not null,
  summary text not null,
  source_conversation_id text,
  created_at timestamptz not null default now()
);

create table if not exists equipment_history (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  equipment_label text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists conversation_messages (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  conversation_id text not null references conversations(id) on delete cascade,
  speaker text not null,
  body text not null,
  confidence integer,
  occurred_at text,
  created_at timestamptz not null default now()
);

create table if not exists uploaded_photos (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text references customers(id),
  conversation_id text references conversations(id),
  object_key text not null,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create table if not exists ai_summaries (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  summary text not null,
  confidence integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists technician_availability (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  technician_id text not null references technicians(id) on delete cascade,
  status text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  source text not null,
  created_at timestamptz not null default now()
);

create table if not exists technician_assignments (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  technician_id text not null references technicians(id) on delete cascade,
  job_id text not null references jobs(id) on delete cascade,
  assigned_by_user_id text references users(id),
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists calendar_providers (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  provider text not null,
  status text not null,
  source_of_truth boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists calendars (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  provider_id text references calendar_providers(id) on delete set null,
  technician_id text references technicians(id) on delete set null,
  external_calendar_id text,
  label text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists sync_events (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  provider text not null,
  entity_type text not null,
  entity_id text not null,
  status text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists sync_failures (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  provider text not null,
  entity_type text not null,
  entity_id text not null,
  error_message text not null,
  retry_after timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists payment_accounts (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  provider text not null,
  provider_account_id text,
  onboarding_status text not null,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists payment_events (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  payment_request_id text references payment_requests(id) on delete cascade,
  provider_event_id text,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists notification_preferences (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  role text not null,
  notification_type text not null,
  channels text[] not null default '{}',
  enabled boolean not null default true,
  quiet_hours_bypass boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists onboarding_confirmations (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  card_id text not null,
  status text not null,
  fields jsonb not null default '[]'::jsonb,
  confirmed_by_user_id text references users(id),
  confirmed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table technicians add column if not exists shift jsonb not null default '{}'::jsonb;
alter table technicians add column if not exists current_job_id text;

alter table jobs add column if not exists window_label text;
alter table jobs add column if not exists payment_status text;

alter table dispatch_events add column if not exists service_area text;
alter table dispatch_events add column if not exists repeat_issue_score integer not null default 0;
alter table dispatch_events add column if not exists callback_risk_score integer not null default 0;
alter table dispatch_events add column if not exists frustration_score integer not null default 0;
alter table dispatch_events add column if not exists unresolved_score integer not null default 0;

alter table conversations add column if not exists provider text;
alter table conversations add column if not exists provider_conversation_id text;
alter table conversations add column if not exists urgency text;
alter table conversations add column if not exists confidence integer not null default 0;
alter table conversations add column if not exists summary text;

create table if not exists payment_status_history (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  payment_request_id text references payment_requests(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor text not null,
  note text not null,
  occurred_at_label text,
  created_at timestamptz not null default now()
);

create index if not exists idx_issue_history_customer on issue_history(business_id, customer_id);
create index if not exists idx_equipment_customer on equipment_history(business_id, customer_id);
create index if not exists idx_messages_conversation on conversation_messages(business_id, conversation_id);
create index if not exists idx_availability_technician on technician_availability(business_id, technician_id);
create index if not exists idx_sync_failures_business on sync_failures(business_id, created_at desc);
create index if not exists idx_onboarding_business on onboarding_confirmations(business_id, status);
create index if not exists idx_payment_status_history_request on payment_status_history(business_id, payment_request_id);
