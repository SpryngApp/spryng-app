begin;

-- Ensure owner_user_id exists (canonical)
alter table public.workspaces
  add column if not exists owner_user_id uuid null references auth.users(id) on delete set null;

-- Backfill owner_user_id from owner_id if owner_id exists (handles past drift safely)
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workspaces'
      and column_name = 'owner_id'
  ) then
    execute $q$
      update public.workspaces
      set owner_user_id = coalesce(owner_user_id, owner_id)
      where owner_user_id is null
        and owner_id is not null
    $q$;
  end if;
end $$;

-- Ensure workspace has a name (avoid future not-null surprises)
update public.workspaces
set name = 'My workspace'
where name is null or btrim(name) = '';

-- Enable RLS
alter table public.workspaces enable row level security;

-- Drop old policies (some may reference owner_id)
drop policy if exists "workspaces_select_members" on public.workspaces;
drop policy if exists "workspaces_insert_owner" on public.workspaces;
drop policy if exists "workspaces_update_owner" on public.workspaces;
drop policy if exists "workspaces_delete_owner" on public.workspaces;

-- New policies: owner_user_id + ACTIVE membership
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

-- OPTIONAL cleanup: if owner_id exists, keep it but stop relying on it.
-- If you want to fully remove owner_id (cleanest), uncomment the block below.

-- do $$
-- begin
--   if exists (
--     select 1
--     from information_schema.columns
--     where table_schema='public' and table_name='workspaces' and column_name='owner_id'
--   ) then
--     alter table public.workspaces drop constraint if exists workspaces_owner_id_fkey;
--     drop index if exists public.workspaces_owner_idx;
--     alter table public.workspaces drop column if exists owner_id;
--   end if;
-- end $$;

commit;
