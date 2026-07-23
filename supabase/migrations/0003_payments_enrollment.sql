-- 0003_payments_enrollment.sql
-- Venakan Learn payment + enrollment module.
--
-- Sections 1–4 (table changes) were already applied in Supabase via the
-- corrected DDL and are included here (idempotent) so the repo records the
-- schema the code targets. Sections 5–6 (the enroll_seat function and the
-- v_training_registrations view) are NEW and MUST be run in the Supabase SQL
-- Editor for the module to work.

-- ── 1. Tuition + seat tracking on programs (already applied) ──
alter table training_programs
  add column if not exists tuition_cents integer not null default 0,
  add column if not exists currency text not null default 'usd',
  add column if not exists seats_total integer,
  add column if not exists seats_enrolled integer not null default 0;

-- ── 2. Enrollment lifecycle on training_interest (already applied) ──
alter table training_interest
  add column if not exists status text not null default 'submitted',
  add column if not exists payment_token uuid unique default gen_random_uuid(),
  add column if not exists approved_at timestamptz,
  add column if not exists enrolled_at timestamptz;

do $$ begin
  alter table training_interest
    add constraint chk_ti_status
    check (status in ('submitted','approved_pending_payment','enrolled','payment_failed','withdrawn'));
exception when duplicate_object then null; end $$;

-- ── 3. Payments (one row per Checkout Session) (already applied) ──
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references training_interest(id),
  program_id uuid not null references training_programs(id),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_cents integer not null,
  currency text not null default 'usd',
  status text not null default 'pending'
    check (status in ('pending','paid','expired','failed','refunded')),
  is_manual boolean not null default false,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists idx_payments_application on payments(application_id);

-- ── 4. Webhook idempotency ledger (already applied) ──
create table if not exists stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

-- ══════════════════════════════════════════════════════════════════════════
-- RUN THESE TWO (5 and 6) IN THE SUPABASE SQL EDITOR:
-- ══════════════════════════════════════════════════════════════════════════

-- ── 5. Atomic, guarded seat increment (called by the webhook / mark-paid) ──
-- Returns the new seats_enrolled, or NULL when the cohort is already full.
create or replace function public.enroll_seat(p_program_id uuid)
returns integer
language sql
as $$
  update training_programs
     set seats_enrolled = seats_enrolled + 1
   where id = p_program_id
     and (seats_total is null or seats_enrolled < seats_total)
  returning seats_enrolled;
$$;

-- ── 6. Dashboard view: registrations + program + lookups + latest payment ──
-- No prior v_training_registrations definition was found in the repo, so this
-- is the full definition. It preserves the base registration columns and the
-- program/experience/eligibility joins, and adds the latest payment via a
-- LEFT JOIN LATERAL (created_at desc, limit 1). If a different view already
-- exists in your DB, reconcile any extra columns you rely on.
create or replace view v_training_registrations as
select
  ti.id,
  ti.created_at,
  ti.first_name,
  ti.last_name,
  ti.email,
  ti.phone,
  ti.linkedin_url,
  ti.resume_path,
  ti.source,
  ti.status,
  ti.payment_token,
  ti.approved_at,
  ti.enrolled_at,
  ti.program_id,
  tp.name          as program_name,
  tp.tuition_cents,
  tp.currency,
  tp.seats_total,
  tp.seats_enrolled,
  ti.experience_range_id,
  er.label         as experience_label,
  ti.eligibility_id,
  el.label         as eligibility_label,
  el.is_program_eligible,
  lp.status        as payment_status,
  lp.amount_cents  as payment_amount_cents,
  lp.paid_at
from training_interest ti
  left join training_programs tp on tp.id = ti.program_id
  left join lookup_experience_ranges er on er.id = ti.experience_range_id
  left join lookup_employment_eligibility el on el.id = ti.eligibility_id
  left join lateral (
    select p.status, p.amount_cents, p.paid_at
    from payments p
    where p.application_id = ti.id
    order by p.created_at desc
    limit 1
  ) lp on true;
