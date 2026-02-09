create table if not exists public.workspace_artifacts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  employer_id uuid references public.employers(id) on delete set null,
  category text not null check (category in ('registration_proof', 'notice', 'report_proof', 'other')),
  step_key text,
  storage_bucket text not null,
  storage_path text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now()
);

create unique index if not exists workspace_artifacts_storage_unique
on public.workspace_artifacts (storage_bucket, storage_path);

alter table public.workspace_artifacts enable row level security;

drop policy if exists "wa_select_member" on public.workspace_artifacts;
create policy "wa_select_member"
on public.workspace_artifacts
for select
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_artifacts.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "wa_insert_member" on public.workspace_artifacts;
create policy "wa_insert_member"
on public.workspace_artifacts
for insert
with check (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_artifacts.workspace_id
      and wm.user_id = auth.uid()
  )
);

drop policy if exists "wa_delete_member" on public.workspace_artifacts;
create policy "wa_delete_member"
on public.workspace_artifacts
for delete
using (
  exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = workspace_artifacts.workspace_id
      and wm.user_id = auth.uid()
  )
);
