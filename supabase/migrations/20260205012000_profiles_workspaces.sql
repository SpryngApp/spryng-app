-- 20260205012000_profiles_workspaces.sql
-- Clean foundation: profiles (1:1 auth.users), workspaces, workspace_members
-- Fixes: workspaces.owner_id missing (policy referenced a non-existent column)

-- Extensions
create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Updated-at helper
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
-- PROFILES (1:1 with auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text null,
  full_name text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If table existed already, ensure expected columns exist (non-destructive)
alter table public.profiles
  add column if not exists email text null,
  add column if not exists full_name text null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Create a profile row automatically when a new auth user is created
-- (Works well with OAuth signups)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- WORKSPACES
-- One company per workspace is fine; "workspace" is the company container.
-- ------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid null references auth.users(id) on delete set null,
  name text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- IMPORTANT: if workspaces already existed, ensure owner_id exists before policies
alter table public.workspaces
  add column if not exists owner_id uuid null references auth.users(id) on delete set null,
  add column if not exists name text null,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

-- Helpful default for client-created workspaces (OAuth session present)
-- Service-role inserts can still set owner_id explicitly.
alter table public.workspaces
  alter column owner_id set default auth.uid();

drop trigger if exists trg_workspaces_updated_at on public.workspaces;
create trigger trg_workspaces_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- WORKSPACE MEMBERS
-- ------------------------------------------------------------
create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now()
);

-- If table existed already, ensure expected columns exist (non-destructive)
alter table public.workspace_members
  add column if not exists workspace_id uuid,
  add column if not exists user_id uuid,
  add column if not exists role text not null default 'member',
  add column if not exists created_at timestamptz not null default now();

-- Ensure FKs exist if columns were missing earlier (safe if already present)
do $$
begin
  alter table public.workspace_members
    add constraint workspace_members_workspace_fk
    foreign key (workspace_id) references public.workspaces(id) on delete cascade;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter table public.workspace_members
    add constraint workspace_members_user_fk
    foreign key (user_id) references auth.users(id) on delete cascade;
exception when duplicate_object then
  null;
end $$;

-- Role constraint (idempotent-ish)
do $$
begin
  alter table public.workspace_members
    add constraint workspace_members_role_check
    check (role in ('owner','admin','member'));
exception when duplicate_object then
  null;
end $$;

create unique index if not exists workspace_members_workspace_user_uq
  on public.workspace_members(workspace_id, user_id);

create index if not exists workspace_members_user_idx
  on public.workspace_members(user_id);

create index if not exists workspaces_owner_idx
  on public.workspaces(owner_id);

-- Optional: backfill owner_id from workspace_members if you already had memberships with role='owner'
-- If your existing workspace_members doesn't use role, this will just do nothing.
update public.workspaces w
set owner_id = wm.user_id
from public.workspace_members wm
where wm.workspace_id = w.id
  and wm.role = 'owner'
  and w.owner_id is null;

-- ------------------------------------------------------------
-- RLS + POLICIES
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

-- PROFILES
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Optional: allow user to insert own profile (not required if trigger handles it)
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

-- WORKSPACES
-- Read: user can read workspaces they belong to, or ones they own.
drop policy if exists workspaces_select_members on public.workspaces;
create policy workspaces_select_members
on public.workspaces
for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspaces.id
      and wm.user_id = auth.uid()
  )
);

-- Insert: must be owner
drop policy if exists workspaces_insert_owner on public.workspaces;
create policy workspaces_insert_owner
on public.workspaces
for insert
to authenticated
with check (owner_id = auth.uid());

-- Update/Delete: owner only
drop policy if exists workspaces_update_owner on public.workspaces;
create policy workspaces_update_owner
on public.workspaces
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists workspaces_delete_owner on public.workspaces;
create policy workspaces_delete_owner
on public.workspaces
for delete
to authenticated
using (owner_id = auth.uid());

-- WORKSPACE MEMBERS
-- Select: user can see memberships for workspaces they are in
drop policy if exists workspace_members_select_member on public.workspace_members;
create policy workspace_members_select_member
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
  )
);

-- Insert/Update/Delete: only workspace owner (keeps it safe + simple early)
drop policy if exists workspace_members_insert_owner on public.workspace_members;
create policy workspace_members_insert_owner
on public.workspace_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = auth.uid()
  )
);

drop policy if exists workspace_members_update_owner on public.workspace_members;
create policy workspace_members_update_owner
on public.workspace_members
for update
to authenticated
using (
  exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = auth.uid()
  )
);

drop policy if exists workspace_members_delete_owner on public.workspace_members;
create policy workspace_members_delete_owner
on public.workspace_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.workspaces w
    where w.id = workspace_members.workspace_id
      and w.owner_id = auth.uid()
  )
);
