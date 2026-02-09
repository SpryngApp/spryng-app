begin;

-- ------------------------------------------------------------
-- 1) Create/Upsert profile row when a new auth user is created
-- ------------------------------------------------------------
create or replace function public.handle_new_auth_user_profile()
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

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_auth_user_profile();


-- ------------------------------------------------------------
-- 2) Set active_workspace_id on first workspace creation
--    (only if profile.active_workspace_id is currently null)
-- ------------------------------------------------------------
create or replace function public.set_active_workspace_on_first_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only act when we know who owns it
  if new.owner_user_id is null then
    return new;
  end if;

  -- Upsert profile (in case it doesn't exist yet) and only set active_workspace_id if empty
  insert into public.profiles (id, active_workspace_id)
  values (new.owner_user_id, new.id)
  on conflict (id) do update
    set active_workspace_id = coalesce(public.profiles.active_workspace_id, excluded.active_workspace_id),
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists trg_set_active_workspace_first on public.workspaces;

create trigger trg_set_active_workspace_first
after insert on public.workspaces
for each row execute function public.set_active_workspace_on_first_workspace();

commit;
