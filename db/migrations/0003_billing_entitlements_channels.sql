-- Batch 14 billing, entitlement, Connect, and channel readiness additions.
-- Platform SaaS billing and contractor client payments are intentionally separate.

create table if not exists platform_customers (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  platform_customer_id text not null,
  owner_user_id text references users(id),
  billing_email text not null,
  created_at timestamptz not null default now()
);

create table if not exists platform_subscriptions (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  subscription_id text not null,
  subscription_status text not null,
  price_id text not null,
  current_period_end timestamptz,
  failed_payment_status text not null default 'none',
  entitlement_status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists platform_invoices (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  platform_invoice_id text not null,
  subscription_id text references platform_subscriptions(id) on delete cascade,
  status text not null,
  amount_due integer not null default 0,
  hosted_invoice_url text,
  created_at timestamptz not null default now()
);

create table if not exists entitlement_states (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  status text not null,
  mobile_access text not null,
  reason text,
  source_subscription_id text references platform_subscriptions(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists connected_accounts (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  connected_account_id text not null,
  connect_onboarding_status text not null,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  application_fee_percent numeric not null default 0,
  application_fee_amount integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contractor_invoices (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  job_id text references jobs(id) on delete set null,
  connected_account_id text references connected_accounts(id) on delete set null,
  provider_invoice_id text,
  amount integer not null,
  memo text not null,
  invoice_status text not null,
  payment_status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contractor_payment_links (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  job_id text references jobs(id) on delete set null,
  connected_account_id text references connected_accounts(id) on delete set null,
  provider_payment_link_id text,
  amount integer not null,
  reason text not null,
  payment_status text not null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists contractor_payments (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  job_id text references jobs(id) on delete set null,
  provider_payment_intent_id text,
  amount integer not null,
  payment_status text not null,
  paid_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists contractor_refunds (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  job_id text references jobs(id) on delete set null,
  payment_id text references contractor_payments(id) on delete set null,
  amount integer not null,
  status text not null,
  refunded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists job_payment_status (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  job_id text not null references jobs(id) on delete cascade,
  invoice_status text not null,
  payment_status text not null,
  amount_open integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists twilio_numbers (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  account_sid text not null,
  subaccount_sid text not null,
  phone_number_sid text not null,
  messaging_service_sid text,
  phone_number text not null,
  voice_status text not null,
  sms_status text not null,
  porting_status text not null,
  call_forwarding_status text not null,
  created_at timestamptz not null default now()
);

create table if not exists a2p_registrations (
  id text primary key,
  business_id text not null references businesses(id) on delete cascade,
  secondary_customer_profile_sid text,
  brand_registration_sid text,
  campaign_registration_sid text,
  status text not null,
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists idx_platform_subscriptions_business on platform_subscriptions(business_id, entitlement_status);
create index if not exists idx_entitlements_business on entitlement_states(business_id, status);
create index if not exists idx_connected_accounts_business on connected_accounts(business_id, connect_onboarding_status);
create index if not exists idx_contractor_invoices_job on contractor_invoices(business_id, job_id);
create index if not exists idx_contractor_payment_links_job on contractor_payment_links(business_id, job_id);
create index if not exists idx_job_payment_status_job on job_payment_status(business_id, job_id);
create index if not exists idx_twilio_numbers_business on twilio_numbers(business_id, voice_status, sms_status);
create index if not exists idx_a2p_business on a2p_registrations(business_id, status);
