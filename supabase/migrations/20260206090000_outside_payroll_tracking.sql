begin;

-- ------------------------------------------------------------
-- Outside-payroll tracking entries
-- ------------------------------------------------------------
create table if not exists public.outside_payroll_entries (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  employer_id uuid null references public.employers(id) on delete set null,

  payee_name text not null,
  payee_type text null, -- optional: contractor | vendor | family | friend | other
  purpose text null,    -- what the payment was for (plain language)
  payment_method text null, -- cash | check | ach | zelle | venmo | card | other

  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),

  paid_at date not null,     -- date of payment (keeps MVP simple)
  proof_url text null,       -- link to receipt/invoice folder/doc
  notes text null,

  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_outside_payroll_entries_workspace_id
  on public.outside_payroll_entries(workspace_id);

create index if not exists idx_outside_payroll_entries_employer_id
  on public.outside_payroll_entries(employer_id);

create index if not exists idx_outside_payroll_entries_paid_at
  on public.outside_payroll_entries(paid_at);

create index if not exists idx_outside_payroll_entries_created_at
  on public.outside_payroll_entries(created_at);

drop trigger if exists trg_outside_payroll_entries_updated_at on public.outside_payroll_entries;
create trigger trg_outside_payroll_entries_updated_at
before update on public.outside_payroll_entries
for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- RLS + Policies (workspace member can read; member can insert;
-- update/delete: creator OR owner/admin)
-- ------------------------------------------------------------
alter table public.outside_payroll_entries enable row level security;

drop policy if exists "ope_select_members" on public.outside_payroll_entries;
drop policy if exists "ope_insert_members" on public.outside_payroll_entries;
drop policy if exists "ope_update_owner_admin_or_creator" on public.outside_payroll_entries;
drop policy if exists "ope_delete_owner_admin_or_creator" on public.outside_payroll_entries;

-- SELECT: active members can read entries in their workspace
create policy "ope_select_members"
on public.outside_payroll_entries
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = outside_payroll_entries.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

-- INSERT: active members can insert into their workspace
create policy "ope_insert_members"
on public.outside_payroll_entries
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = outside_payroll_entries.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

-- UPDATE: creator OR active owner/admin of the workspace
create policy "ope_update_owner_admin_or_creator"
on public.outside_payroll_entries
for update
to authenticated
using (
  created_by = auth.uid()
  OR exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = outside_payroll_entries.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role in ('owner','admin')
  )
)
with check (
  created_by = auth.uid()
  OR exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = outside_payroll_entries.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role in ('owner','admin')
  )
);

-- DELETE: creator OR active owner/admin of the workspace
create policy "ope_delete_owner_admin_or_creator"
on public.outside_payroll_entries
for delete
to authenticated
using (
  created_by = auth.uid()
  OR exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = outside_payroll_entries.workspace_id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
      and wm.role in ('owner','admin')
  )
);

commit;
