-- Fix workspaces owner column drift safely:
-- - ensure owner_user_id exists
-- - drop any policies that depend on legacy owner_id (workspaces + workspace_members)
-- - backfill owner_user_id from owner_id if present
-- - drop owner_id
-- - enforce owner_user_id NOT NULL (only if safe)
-- - recreate baseline RLS policies that do NOT reference owner_id

begin;

-- 0) Ensure canonical owner_user_id column exists
alter table public.workspaces
  add column if not exists owner_user_id uuid null references auth.users(id) on delete set null;

-- 1) Drop ALL policies on workspaces + workspace_members (some reference workspaces.owner_id)
do $$
declare p record;
begin
  for p in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in ('workspaces', 'workspace_members')
  loop
    execute format('drop policy if exists %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- 2) Backfill from owner_id ONLY if that legacy column exists, then drop it
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'workspaces'
      and column_name  = 'owner_id'
  ) then
    execute $q$
      update public.workspaces
      set owner_user_id = owner_id
      where owner_user_id is null
        and owner_id is not null
    $q$;

    -- Drop FK + index + column (safe)
    execute 'alter table public.workspaces drop constraint if exists workspaces_owner_id_fkey';
    execute 'drop index if exists public.workspaces_owner_idx';
    execute 'alter table public.workspaces drop column if exists owner_id';
  end if;
end $$;

-- 3) Guardrail: owner_user_id must be present before we enforce NOT NULL
do $$
begin
  if exists (select 1 from public.workspaces where owner_user_id is null) then
    raise exception 'Cannot set workspaces.owner_user_id NOT NULL: found rows with NULL owner_user_id.';
  end if;
end $$;

alter table public.workspaces
  alter column owner_user_id set not null;

-- 4) Recreate baseline RLS policies (owner_user_id + active membership)
alter table public.workspaces enable row level security;

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

-- 5) Recreate baseline workspace_members policies (NO references to workspaces.owner_id)
alter table public.workspace_members enable row level security;

-- SELECT: you can always read your own row; active members can read member list
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

-- INSERT: allow workspace owner OR active owner/admin members to add rows
create policy "workspace_members_insert_admin"
on public.workspace_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_user_id = auth.uid()
  )
  or exists (
    select 1
    from public.workspace_members me
    where me.workspace_id = workspace_members.workspace_id
      and me.user_id = auth.uid()
      and me.status = 'active'
      and me.role in ('owner','admin')
  )
);

-- UPDATE: same rule as insert
create policy "workspace_members_update_admin"
on public.workspace_members
for update
to authenticated
using (
  exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_user_id = auth.uid()
  )
  or exists (
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
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_user_id = auth.uid()
  )
  or exists (
    select 1
    from public.workspace_members me
    where me.workspace_id = workspace_members.workspace_id
      and me.user_id = auth.uid()
      and me.status = 'active'
      and me.role in ('owner','admin')
  )
);

-- DELETE: admins/owners can remove anyone; users can remove themselves
create policy "workspace_members_delete_admin"
on public.workspace_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_user_id = auth.uid()
  )
  or exists (
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
