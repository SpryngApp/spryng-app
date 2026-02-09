-- Foundation: profiles, workspaces, workspace_members, employers (1 employer per workspace),
-- and quiz session claiming columns.
-- Safe to run on a new or existing project (uses IF NOT EXISTS patterns where possible).

begin;

-- Needed for gen_random_uuid()
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1) profiles (1:1 with auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  active_workspace_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_active_workspace_id on public.profiles(active_workspace_id);

-- ------------------------------------------------------------
-- 2) workspaces
-- ------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workspaces_owner_user_id on public.workspaces(owner_user_id);

-- Wire active_workspace_id FK after workspaces exists
do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'profiles'
      and constraint_name = 'profiles_active_workspace_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_active_workspace_id_fkey
      foreign key (active_workspace_id)
      references public.workspaces(id)
      on delete set null;
  end if;
end $$;

-- ------------------------------------------------------------
-- 3) workspace_members
-- ------------------------------------------------------------
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  status text not null default 'active' check (status in ('active','invited')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists idx_workspace_members_user_id on public.workspace_members(user_id);

-- ------------------------------------------------------------
-- 4) employers (ONE per workspace enforced)
-- ------------------------------------------------------------
create table if not exists public.employers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  display_name text not null,

  -- minimal business identity (you can extend later)
  state_code text null check (state_code is null or state_code ~ '^[A-Z]{2}$'),

  -- store what user answered (quiz) without over-normalizing too early
  entity_type_raw text null,
  smllc_tax_treatment text null,
  mmllc_tax_treatment text null,

  -- normalized evaluator-friendly value (optional but handy)
  employer_entity_type text null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- This is the key that prevents confusion/drift:
  constraint employers_one_per_workspace unique (workspace_id)
);

create index if not exists idx_employers_workspace_id on public.employers(workspace_id);
create index if not exists idx_employers_state_code on public.employers(state_code);

-- ------------------------------------------------------------
-- 5) quiz session claiming (ties pre-signup quiz → user/workspace/employer later)
-- ------------------------------------------------------------
-- These ALTERs are written to be safe if you rerun locally, but migrations run once in Supabase.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'quiz_sessions'
  ) then
    -- Attach quiz sessions to auth user/workspace/employer after signup
    if not exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='quiz_sessions' and column_name='user_id'
    ) then
      alter table public.quiz_sessions add column user_id uuid null references auth.users(id) on delete set null;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='quiz_sessions' and column_name='workspace_id'
    ) then
      alter table public.quiz_sessions add column workspace_id uuid null references public.workspaces(id) on delete set null;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='quiz_sessions' and column_name='employer_id'
    ) then
      alter table public.quiz_sessions add column employer_id uuid null references public.employers(id) on delete set null;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='quiz_sessions' and column_name='claimed_at'
    ) then
      alter table public.quiz_sessions add column claimed_at timestamptz null;
    end if;

    if not exists (
      select 1 from information_schema.columns
      where table_schema='public' and table_name='quiz_sessions' and column_name='claim_token'
    ) then
      alter table public.quiz_sessions add column claim_token text null;
    end if;

    -- Optional but recommended: unique claim_token if you decide to use it
    -- (keeps URL-based claims safer than raw session_id if you ever want that)
    if not exists (
      select 1
      from pg_indexes
      where schemaname='public' and indexname='quiz_sessions_claim_token_key'
    ) then
      create unique index quiz_sessions_claim_token_key
      on public.quiz_sessions (claim_token)
      where claim_token is not null;
    end if;
  end if;
end $$;

commit;
