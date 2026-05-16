-- Trowel core PostgreSQL schema foundation.
-- This migration is intentionally provider-neutral and does not enable live integrations.

create table if not exists businesses (
  id text primary key,
  name text not null,
  legal_name text not null,
  public_phone text,
  website text,
  timezone text not null,
  status text not null check (status in ('setup', 'ready', 'live', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users (
  id text primary key,
  auth_provider_user_id text not null unique,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists business_memberships (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'dispatcher', 'technician')),
  assigned_technician_id text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create table if not exists customers (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  service_address text,
  membership_status text,
  preferred_channel text,
  sentiment text,
  unresolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_memory (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  summary text not null,
  ai_safe_context text not null,
  priority integer not null default 0,
  source text not null,
  created_at timestamptz not null default now()
);

create table if not exists repeat_issue_flags (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  repeat_issue_flag boolean not null default false,
  callback_risk_score integer not null default 0,
  customer_frustration_score integer not null default 0,
  unresolved_issue_score integer not null default 0,
  source_conversation_id text,
  created_at timestamptz not null default now()
);

create table if not exists technicians (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  name text not null,
  role text not null,
  trades text[] not null default '{}',
  service_areas text[] not null default '{}',
  status text not null check (status in ('available', 'on_job', 'off_duty', 'pto')),
  emergency_eligible boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists jobs (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id),
  technician_id text references technicians(id),
  trade text not null,
  title text not null,
  service_area text,
  status text not null check (status in ('scheduled', 'en_route', 'in_progress', 'completed', 'held')),
  emergency boolean not null default false,
  source_conversation_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  job_id text not null references jobs(id) on delete cascade,
  technician_id text references technicians(id),
  starts_at timestamptz,
  ends_at timestamptz,
  window_label text,
  status text not null,
  source_of_truth text not null,
  provider_reference text,
  created_at timestamptz not null default now()
);

create table if not exists dispatch_events (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text references customers(id),
  job_id text references jobs(id),
  urgency text not null,
  issue_summary text not null,
  recommended_technician_id text references technicians(id),
  confidence_score integer not null default 0,
  eta_minutes integer,
  status text not null default 'needs_review',
  created_at timestamptz not null default now()
);

create table if not exists dispatch_approvals (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  dispatch_event_id text not null references dispatch_events(id) on delete cascade,
  approved_by_user_id text not null references users(id),
  decision text not null check (decision in ('approved', 'overridden', 'rejected')),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists conversations (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text references customers(id),
  channel text not null check (channel in ('voice', 'sms', 'webchat', 'whatsapp')),
  status text not null,
  last_message_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists calls (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  conversation_id text references conversations(id),
  twilio_call_sid text unique,
  caller_phone text not null,
  status text not null,
  recording_url text,
  transcript_url text,
  created_at timestamptz not null default now()
);

create table if not exists payment_requests (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text references customers(id),
  job_id text references jobs(id),
  appointment_id text references appointments(id),
  amount_cents integer not null,
  reason text not null,
  status text not null check (status in ('not_required', 'requested', 'pending', 'paid', 'failed', 'waived', 'refunded')),
  provider text not null,
  provider_payment_id text,
  sent_at timestamptz,
  paid_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  priority text not null check (priority in ('urgent', 'important', 'normal')),
  destination text not null,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists notification_delivery_events (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  notification_id text not null references notifications(id) on delete cascade,
  channel text not null,
  status text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists operational_audit_logs (
  id bigserial primary key,
  business_id text not null references businesses(id) on delete cascade,
  actor_user_id text references users(id),
  action text not null,
  entity_type text not null,
  entity_id text not null,
  severity text not null check (severity in ('info', 'sensitive', 'security')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_customers_business on customers(business_id);
create index if not exists idx_jobs_business_status on jobs(business_id, status);
create index if not exists idx_dispatch_business_status on dispatch_events(business_id, status);
create index if not exists idx_conversations_business_customer on conversations(business_id, customer_id);
create index if not exists idx_payment_requests_business_status on payment_requests(business_id, status);
create index if not exists idx_notifications_business_status on notifications(business_id, status);
create index if not exists idx_audit_business_created on operational_audit_logs(business_id, created_at desc);
