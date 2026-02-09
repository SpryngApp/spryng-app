begin;

-- ------------------------------------------------------------
-- 0) Updated-at helper (if you don't already have it)
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ------------------------------------------------------------
-- 1) WORKSPACES: make owner_user_id canonical, remove owner_id drift
-- ------------------------------------------------------------

-- Ensure owner_user_id exists
alter table public.workspaces
  add column if not exists owner_user_id uuid null references auth.users(id) on delete set null;

-- Backfill from owner_id if it exists
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='workspaces' and column_name='owner_id'
  ) then
    execute $q$
      update public.workspaces
      set owner_user_id = coalesce(owner_user_id, owner_id)
      where owner_user_id is null and owner_id is not null
    $q$;
  end if;
end $$;

-- Ensure default for client-side inserts
alter table public.workspaces
  alter column owner_user_id set default auth.uid();

-- OPTIONAL but recommended: remove owner_id column + its FK/index (prevents future confusion)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema='public' and table_name='workspaces' and column_name='owner_id'
  ) then
    alter table public.workspaces drop constraint if exists workspaces_owner_id_fkey;
    drop index if exists public.workspaces_owner_idx;
    alter table public.workspaces drop column if exists owner_id;
  end if;
end $$;

-- updated_at trigger (safe)
drop trigger if exists trg_workspaces_updated_at on public.workspaces;
create trigger trg_workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 2) WORKSPACES: RLS + policies (owner_user_id + ACTIVE membership)
-- ------------------------------------------------------------
alter table public.workspaces enable row level security;

drop policy if exists "workspaces_select_members" on public.workspaces;
drop policy if exists "workspaces_insert_owner" on public.workspaces;
drop policy if exists "workspaces_update_owner" on public.workspaces;
drop policy if exists "workspaces_delete_owner" on public.workspaces;

create policy "workspaces_select_members"
on public.workspaces
for select
to authenticated
using (
  owner_user_id = auth.uid()
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

create policy "workspaces_insert_owner"
on public.workspaces
for insert
to authenticated
with check (owner_user_id = auth.uid());

create policy "workspaces_update_owner"
on public.workspaces
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "workspaces_delete_owner"
on public.workspaces
for delete
to authenticated
using (owner_user_id = auth.uid());

-- ------------------------------------------------------------
-- 3) WORKSPACE_MEMBERS: remove duplicate constraints/indexes in your current schema
-- ------------------------------------------------------------
alter table public.workspace_members enable row level security;

-- Drop duplicate FKs if present (keep the *_id_fkey ones)
alter table public.workspace_members drop constraint if exists workspace_members_user_fk;
alter table public.workspace_members drop constraint if exists workspace_members_workspace_fk;

-- Drop redundant indexes (PK already enforces uniqueness)
drop index if exists public.workspace_members_workspace_user_uq;
drop index if exists public.workspace_members_user_idx;
-- Keep idx_workspace_members_user_id

-- updated_at trigger for workspace_members
drop trigger if exists trg_workspace_members_updated_at on public.workspace_members;
create trigger trg_workspace_members_updated_at
before update on public.workspace_members
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 4) WORKSPACE_MEMBERS: policies (simple + safe)
-- ------------------------------------------------------------
drop policy if exists "workspace_members_select_visible" on public.workspace_members;
drop policy if exists "workspace_members_insert_admin" on public.workspace_members;
drop policy if exists "workspace_members_update_admin" on public.workspace_members;
drop policy if exists "workspace_members_delete_admin" on public.workspace_members;
drop policy if exists "workspace_members_delete_self" on public.workspace_members;

-- Select: you can always see your row; active members can see member list
create policy "workspace_members_select_visible"
on public.workspace_members
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.workspace_members me
    where me.workspace_id = workspace_members.workspace_id
      and me.user_id = auth.uid()
      and me.status = 'active'
  )
);

-- Insert/Update: only active owner/admin can manage members
create policy "workspace_members_insert_admin"
on public.workspace_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspace_members me
    where me.workspace_id = workspace_members.workspace_id
      and me.user_id = auth.uid()
      and me.status = 'active'
      and me.role in ('owner','admin')
  )
);

create policy "workspace_members_update_admin"
on public.workspace_members
for update
to authenticated
using (
  exists (
    select 1
    from public.workspace_members me
    where me.workspace_id = workspace_members.workspace_id
      and me.user_id = auth.uid()
      and me.status = 'active'
      and me.role in ('owner','admin')
  )
)
with check (
  exists (
    select 1
    from public.workspace_members me
    where me.workspace_id = workspace_members.workspace_id
      and me.user_id = auth.uid()
      and me.status = 'active'
      and me.role in ('owner','admin')
  )
);

create policy "workspace_members_delete_admin"
on public.workspace_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspace_members me
    where me.workspace_id = workspace_members.workspace_id
      and me.user_id = auth.uid()
      and me.status = 'active'
      and me.role in ('owner','admin')
  )
);

create policy "workspace_members_delete_self"
on public.workspace_members
for delete
to authenticated
using (user_id = auth.uid());

commit;
