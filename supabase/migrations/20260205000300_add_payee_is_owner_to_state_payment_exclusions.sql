-- 20260205000300_add_payee_is_owner_to_state_payment_exclusions.sql
-- Adds payee_is_owner as a 3-state flag and updates unique key/index to support upserts.

do $$
begin
  -- If column doesn't exist, add it as TEXT (best long-term).
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'state_payment_exclusions'
      and column_name = 'payee_is_owner'
  ) then
    alter table public.state_payment_exclusions
      add column payee_is_owner text not null default 'unknown';
  else
    -- If it exists but is BOOLEAN from a prior attempt, convert to TEXT.
    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'state_payment_exclusions'
        and column_name = 'payee_is_owner'
        and data_type = 'boolean'
    ) then
      alter table public.state_payment_exclusions
        alter column payee_is_owner type text
        using (case when payee_is_owner then 'yes' else 'no' end);

      alter table public.state_payment_exclusions
        alter column payee_is_owner set default 'unknown';
    end if;
  end if;

  -- Add/ensure CHECK constraint (yes/no/unknown)
  if not exists (
    select 1
    from pg_constraint
    where conname = 'state_payment_exclusions_payee_is_owner_chk'
      and conrelid = 'public.state_payment_exclusions'::regclass
  ) then
    alter table public.state_payment_exclusions
      add constraint state_payment_exclusions_payee_is_owner_chk
      check (payee_is_owner in ('yes','no','unknown'));
  end if;

  -- Replace existing unique constraint with a version that includes payee_is_owner
  if exists (
    select 1
    from pg_constraint
    where conname = 'state_payment_exclusions_uq'
      and conrelid = 'public.state_payment_exclusions'::regclass
  ) then
    alter table public.state_payment_exclusions
      drop constraint state_payment_exclusions_uq;
  end if;

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

end $$;

-- Rebuild lookup index to include payee_is_owner (optional but nice)
drop index if exists public.state_payment_exclusions_lookup_idx;

create index if not exists state_payment_exclusions_lookup_idx
on public.state_payment_exclusions (state_code, employer_entity_type, employment_category, relationship, payee_is_owner);
