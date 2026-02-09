-- 20260205001000_create_quiz_storage.sql
-- Private quiz storage: sessions + answers + results (server/service-role writes; no public reads by default)

create extension if not exists "pgcrypto";

-- 1) Quiz sessions (lead + context)
create table if not exists public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),

  -- Optional link later if user creates an account
  user_id uuid null references auth.users(id) on delete set null,

  -- Lead capture (you said you want name+email before questions)
  lead_name text null,
  lead_email text null,

  state_code text not null check (char_length(state_code) = 2),

  -- Optional: marketing attribution
  utm jsonb not null default '{}'::jsonb,

  -- Optional: allow client to send a stable id to prevent dupes
  client_session_id text null,

  -- Optional request metadata
  ip text null,
  user_agent text null,

  created_at timestamptz not null default now()
);

create index if not exists quiz_sessions_state_idx
on public.quiz_sessions (state_code);

create unique index if not exists quiz_sessions_client_session_id_uq
on public.quiz_sessions (client_session_id)
where client_session_id is not null;

-- 2) Answers snapshot (store the raw answers JSON you evolve over time)
create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,

  answers jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now()
);

create index if not exists quiz_answers_session_idx
on public.quiz_answers (session_id);

-- 3) Results snapshot (store the computed result + evaluator version)
create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.quiz_sessions(id) on delete cascade,

  evaluator_version text not null,
  result jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists quiz_results_session_uq
on public.quiz_results (session_id);

create index if not exists quiz_results_created_idx
on public.quiz_results (created_at desc);

-- updated_at trigger (scoped)
create or replace function public.tg_set_updated_at_quiz_results()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists set_updated_at_quiz_results on public.quiz_results;
create trigger set_updated_at_quiz_results
before update on public.quiz_results
for each row execute function public.tg_set_updated_at_quiz_results();

-- RLS: keep private by default (no SELECT policies)
alter table public.quiz_sessions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.quiz_results enable row level security;

-- Remove default grants
revoke all on table public.quiz_sessions from anon;
revoke all on table public.quiz_sessions from authenticated;
revoke all on table public.quiz_answers from anon;
revoke all on table public.quiz_answers from authenticated;
revoke all on table public.quiz_results from anon;
revoke all on table public.quiz_results from authenticated;

-- Service role can write/read (server only)
grant all on table public.quiz_sessions to service_role;
grant all on table public.quiz_answers to service_role;
grant all on table public.quiz_results to service_role;
