-- 20260205012100_onboarding_state.sql
create table if not exists public.onboarding_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete set null,
  steps jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_onboarding_state_updated_at on public.onboarding_state;
create trigger trg_onboarding_state_updated_at
before update on public.onboarding_state
for each row execute procedure public.set_updated_at();

alter table public.onboarding_state enable row level security;

drop policy if exists "onboarding_select_own" on public.onboarding_state;
create policy "onboarding_select_own"
on public.onboarding_state
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "onboarding_update_own" on public.onboarding_state;
create policy "onboarding_update_own"
on public.onboarding_state
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
