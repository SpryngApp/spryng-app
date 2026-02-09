-- ============================
-- Spryng: Goals + Reporting + Registration Cases (minimal foundation)
-- ============================

-- 0) Updated-at trigger helper (safe to re-run)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================
-- 1) employer_registration_cases (foundation for future done-for-you)
-- =========================================
create table if not exists public.employer_registration_cases (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  employer_id uuid not null references public.employers(id) on delete cascade,
  state_code text not null,
  mode text not null default 'self_serve' check (mode in ('self_serve', 'done_for_you')),
  status text not null default 'not_started' check (
    status in (
      'not_started',
      'in_progress',
      'submitted',
      'completed',
      'blocked'
    )
  ),
  current_step_key text,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_employer_registration_cases_updated_at on public.employer_registration_cases;
create trigger trg_employer_registration_cases_updated_at
before update on public.employer_registration_cases
for each row execute function public.set_updated_at();

alter table public.employer_registration_cases enable row level security;

-- Member access via workspace_members (preferred over owner_id/owner_user_id)
drop policy if exists "erc_select_member" on public.employer_registration_cases;
create policy "erc_select_member"
on public.employer_registration_cases
for select
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = employer_registration_cases.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "erc_insert_member" on public.employer_registration_cases;
create policy "erc_insert_member"
on public.employer_registration_cases
for insert
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = employer_registration_cases.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "erc_update_member" on public.employer_registration_cases;
create policy "erc_update_member"
on public.employer_registration_cases
for update
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = employer_registration_cases.workspace_id
      and wm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = employer_registration_cases.workspace_id
      and wm.user_id = auth.uid()
  )
);

-- =========================================
-- 2) workspace_goals (First Employee Goal)
-- =========================================
create table if not exists public.workspace_goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null check (type in ('first_employee')),
  target_month date not null, -- store as first day of month (YYYY-MM-01)
  target_role text,
  industry text,
  monthly_revenue_range text,
  owner_hours_range text,
  help_focus text,
  inputs jsonb,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists workspace_goals_one_per_type
on public.workspace_goals (workspace_id, type);

drop trigger if exists trg_workspace_goals_updated_at on public.workspace_goals;
create trigger trg_workspace_goals_updated_at
before update on public.workspace_goals
for each row execute function public.set_updated_at();

alter table public.workspace_goals enable row level security;

drop policy if exists "wg_select_member" on public.workspace_goals;
create policy "wg_select_member"
on public.workspace_goals
for select
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_goals.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "wg_insert_member" on public.workspace_goals;
create policy "wg_insert_member"
on public.workspace_goals
for insert
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_goals.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "wg_update_member" on public.workspace_goals;
create policy "wg_update_member"
on public.workspace_goals
for update
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_goals.workspace_id
      and wm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_goals.workspace_id
      and wm.user_id = auth.uid()
  )
);

-- =========================================
-- 3) employer_reporting_settings (first report due date + future reporting)
-- =========================================
create table if not exists public.employer_reporting_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  employer_id uuid not null references public.employers(id) on delete cascade,
  first_report_due_date date,
  first_report_due_date_source text, -- e.g., 'portal', 'agency_page', 'accountant'
  inputs jsonb,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_employer_reporting_settings_updated_at on public.employer_reporting_settings;
create trigger trg_employer_reporting_settings_updated_at
before update on public.employer_reporting_settings
for each row execute function public.set_updated_at();

alter table public.employer_reporting_settings enable row level security;

drop policy if exists "ers_select_member" on public.employer_reporting_settings;
create policy "ers_select_member"
on public.employer_reporting_settings
for select
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = employer_reporting_settings.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "ers_insert_member" on public.employer_reporting_settings;
create policy "ers_insert_member"
on public.employer_reporting_settings
for insert
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = employer_reporting_settings.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "ers_update_member" on public.employer_reporting_settings;
create policy "ers_update_member"
on public.employer_reporting_settings
for update
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = employer_reporting_settings.workspace_id
      and wm.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = employer_reporting_settings.workspace_id
      and wm.user_id = auth.uid()
  )
);
