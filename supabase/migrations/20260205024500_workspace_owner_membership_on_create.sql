begin;

-- Update the existing function to ALSO create the owner membership row
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

  -- 1) Ensure profile exists + set active_workspace_id only if it's currently null
  insert into public.profiles (id, active_workspace_id)
  values (new.owner_user_id, new.id)
  on conflict (id) do update
    set active_workspace_id = coalesce(public.profiles.active_workspace_id, excluded.active_workspace_id),
        updated_at = now();

  -- 2) Ensure the owner is a workspace member (role=owner, status=active)
  insert into public.workspace_members (workspace_id, user_id, role, status)
  values (new.id, new.owner_user_id, 'owner', 'active')
  on conflict (workspace_id, user_id) do update
    set role = excluded.role,
        status = excluded.status,
        updated_at = now();

  return new;
end;
$$;

-- Trigger should already exist; this is just belt + suspenders.
drop trigger if exists trg_set_active_workspace_first on public.workspaces;

create trigger trg_set_active_workspace_first
after insert on public.workspaces
for each row execute function public.set_active_workspace_on_first_workspace();

commit;
