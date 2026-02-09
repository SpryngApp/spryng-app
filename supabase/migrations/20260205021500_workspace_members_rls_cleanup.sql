begin;

-- -------------------------------------------------------------------
-- 1) WORKSPACES: ensure RLS policies match owner_user_id (NOT owner_id)
-- -------------------------------------------------------------------

alter table public.workspaces enable row level security;

drop policy if exists "workspaces_select_members" on public.workspaces;
drop policy if exists "workspaces_insert_owner" on public.workspaces;
drop policy if exists "workspaces_update_owner" on public.workspaces;

-- Members can read the workspace if they have an ACTIVE membership row
create policy "workspaces_select_members"
on public.workspaces
for select
to authenticated
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
      and wm.status = 'active'
  )
);

-- Creator can insert a workspace only if they are setting themselves as owner_user_id
create policy "workspaces_insert_owner"
on public.workspaces
for insert
to authenticated
with check (owner_user_id = auth.uid());

-- Only the owner can update the workspace (simple + safe)
create policy "workspaces_update_owner"
on public.workspaces
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());


-- -------------------------------------------------------------------
-- 2) WORKSPACE_MEMBERS: cleanup duplicate constraints/indexes
-- -------------------------------------------------------------------

-- You currently have duplicate FKs. Keep the *_id_fkey ones.
alter table public.workspace_members
  drop constraint if exists workspace_members_user_fk;

alter table public.workspace_members
  drop constraint if exists workspace_members_workspace_fk;

-- You also have redundant indexes (PK already covers uniqueness)
drop index if exists public.workspace_members_workspace_user_uq;
drop index if exists public.workspace_members_user_idx;
-- Keep idx_workspace_members_user_id (or vice versa). We keep idx_workspace_members_user_id.


-- -------------------------------------------------------------------
-- 3) WORKSPACE_MEMBERS: enable RLS + add policies
-- -------------------------------------------------------------------

alter table public.workspace_members enable row level security;

drop policy if exists "workspace_members_select_visible" on public.workspace_members;
drop policy if exists "workspace_members_insert_admin" on public.workspace_members;
drop policy if exists "workspace_members_update_admin" on public.workspace_members;
drop policy if exists "workspace_members_delete_admin" on public.workspace_members;
drop policy if exists "workspace_members_delete_self" on public.workspace_members;

-- SELECT:
-- - You can always read your own membership row (even if invited)
-- - Active members can read all members in that workspace (needed for member lists/settings)
create policy "workspace_members_select_visible"
on public.workspace_members
for select
to authenticated
using (
  user_id = auth.uid()
  OR exists (
    select 1
    from public.workspace_members me
    where me.workspace_id = workspace_members.workspace_id
      and me.user_id = auth.uid()
      and me.status = 'active'
  )
);

-- INSERT:
-- Only an ACTIVE owner/admin of a workspace can add members (invites).
-- (We intentionally do NOT allow random self-joins from the client.)
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

-- UPDATE:
-- Only ACTIVE owner/admin can update membership rows.
-- (This avoids role escalation issues. Invite acceptance should be done via a server route or RPC later.)
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

-- DELETE:
-- Owners/admins can remove anyone; users can remove themselves (leave workspace).
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


-- -------------------------------------------------------------------
-- 4) updated_at trigger for workspace_members
-- -------------------------------------------------------------------

drop trigger if exists trg_workspace_members_updated_at on public.workspace_members;

create trigger trg_workspace_members_updated_at
before update on public.workspace_members
for each row
execute function set_updated_at();

commit;
