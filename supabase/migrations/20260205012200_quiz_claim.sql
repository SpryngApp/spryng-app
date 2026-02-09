-- 20260205012200_quiz_claim.sql
-- Adds claim fields to quiz_sessions and a safe claim RPC.

create extension if not exists "pgcrypto";

alter table public.quiz_sessions
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists claimed_at timestamptz,
  add column if not exists workspace_id uuid references public.workspaces(id) on delete set null,
  add column if not exists claim_token_hash text;

create index if not exists quiz_sessions_user_id_idx on public.quiz_sessions(user_id);
create index if not exists quiz_sessions_workspace_id_idx on public.quiz_sessions(workspace_id);

-- Claim function:
-- - requires an authenticated user (auth.uid())
-- - requires a matching claim token hash
-- - claims only once (user_id must be null)
-- - creates a default workspace + membership if missing
create or replace function public.claim_quiz_session(p_session_id uuid, p_claim_token text)
returns table (workspace_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_hash text := encode(digest(p_claim_token, 'sha256'), 'hex');
  v_ws uuid;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  update public.quiz_sessions qs
     set user_id = v_uid,
         claimed_at = now()
   where qs.id = p_session_id
     and qs.user_id is null
     and qs.claim_token_hash = v_hash
  returning qs.workspace_id into v_ws;

  if not found then
    raise exception 'invalid_or_claimed';
  end if;

  if v_ws is null then
    insert into public.workspaces (name, owner_id)
    values ('My Workspace', v_uid)
    returning id into v_ws;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (v_ws, v_uid, 'owner')
    on conflict do nothing;

    update public.quiz_sessions set workspace_id = v_ws where id = p_session_id;
  end if;

  insert into public.onboarding_state (user_id, workspace_id, steps)
  values (v_uid, v_ws, jsonb_build_object('claimed_quiz', true))
  on conflict (user_id) do update
    set workspace_id = excluded.workspace_id,
        steps = public.onboarding_state.steps || excluded.steps,
        updated_at = now();

  return query select v_ws;
end;
$$;

-- Allow authenticated users to call the RPC
grant execute on function public.claim_quiz_session(uuid, text) to authenticated;
