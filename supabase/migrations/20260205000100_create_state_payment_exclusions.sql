-- 20260205000100_create_state_payment_exclusions.sql
-- Creates private, logic-friendly exclusions for family/friend payments by state + entity type.

create extension if not exists "pgcrypto";

create table if not exists public.state_payment_exclusions (
  id uuid primary key default gen_random_uuid(),

  -- Join key
  state_code text not null check (char_length(state_code) = 2),

  -- Employer context (simple but structured)
  employer_entity_type text not null
    check (employer_entity_type in (
      'sole_prop_sml',      -- sole proprietor / single-member LLC taxed as disregarded entity
      'partnership_mml',    -- partnership / multi-member LLC
      'llc',                -- LLC (use payee_is_owner + conditions_text for member nuance)
      's_corp',
      'c_corp',
      'nonprofit',
      'domestic_household',
      'agricultural',
      'other',
      'unknown'
    )),

  -- Optional category context
  employment_category text not null default 'general'
    check (employment_category in ('general','domestic','agricultural','nonprofit','government','unknown')),

  -- Who got paid
  relationship text not null
    check (relationship in (
      'spouse',
      'child',
      'parent',
      'stepchild',
      'adopted_child',
      'sibling',
      'other_family',
      'friend',
      'unknown'
    )),

  -- Important nuance for entity-member contexts (LLC member, partner, etc.)
  payee_is_owner text not null default 'unknown'
    check (payee_is_owner in ('yes','no','unknown')),

  -- Optional condition support, but made upsert-friendly (no nulls)
  age_operator text not null default 'na'
    check (age_operator in ('na','<','<=','=','>=','>')),
  age_years int not null default -1
    check (age_years >= -1),

  -- What the rule does (supports “depends” cases cleanly)
  ui_coverage_effect text not null default 'unknown'
    check (ui_coverage_effect in ('excluded','included','depends','unknown')),

  ui_wage_reporting_effect text not null default 'unknown'
    check (ui_wage_reporting_effect in ('excluded','included','depends','unknown')),

  -- Human-friendly explanation for quiz copy generation
  conditions_text text null,

  -- Evidence + traceability
  notes text[] not null default '{}',
  source_url text null,
  source_title text null,

  -- Pinpoint is upsert-friendly (no nulls)
  source_pinpoint text not null default '',
  supporting_quote text null,
  last_verified date null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stable upsert key (real columns only; no expression indexes)
alter table public.state_payment_exclusions
  add constraint state_payment_exclusions_uq
  unique (
    state_code,
    employer_entity_type,
    employment_category,
    relationship,
    payee_is_owner,
    age_operator,
    age_years,
    source_pinpoint
  );

create index if not exists state_payment_exclusions_lookup_idx
on public.state_payment_exclusions (state_code, employer_entity_type, employment_category, relationship, payee_is_owner);

-- updated_at trigger (scoped to this table to avoid collisions)
create or replace function public.tg_set_updated_at_state_payment_exclusions()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists set_updated_at_state_payment_exclusions on public.state_payment_exclusions;
create trigger set_updated_at_state_payment_exclusions
before update on public.state_payment_exclusions
for each row execute function public.tg_set_updated_at_state_payment_exclusions();

-- Keep it private
alter table public.state_payment_exclusions enable row level security;

-- No SELECT policies (default deny). Also revoke table grants from anon/authenticated.
revoke all on table public.state_payment_exclusions from anon;
revoke all on table public.state_payment_exclusions from authenticated;

-- Service role still works (used by server / scripts)
grant all on table public.state_payment_exclusions to service_role;
