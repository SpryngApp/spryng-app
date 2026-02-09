-- 20260205000200_admin_state_payment_exclusions_stats.sql
-- Admin-only stats RPC (no raw data), runs as definer.

create or replace function public.admin_state_payment_exclusions_stats()
returns table (
  total_rows bigint,
  distinct_states bigint,
  last_verified_min date,
  last_verified_max date
)
language sql
security definer
set search_path = public
as $$
  select
    count(*)::bigint as total_rows,
    count(distinct state_code)::bigint as distinct_states,
    min(last_verified) as last_verified_min,
    max(last_verified) as last_verified_max
  from public.state_payment_exclusions;
$$;

-- Don’t expose to anon/authenticated by default
revoke all on function public.admin_state_payment_exclusions_stats() from anon;
revoke all on function public.admin_state_payment_exclusions_stats() from authenticated;

-- Allow service role only
grant execute on function public.admin_state_payment_exclusions_stats() to service_role;
