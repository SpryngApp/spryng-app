-- Add hashed claim token columns for secure quiz claiming
-- This keeps your existing claim_token column intact for now (optional to remove later).

alter table public.quiz_sessions
  add column if not exists claim_token_hash text null,
  add column if not exists claim_token_created_at timestamptz null;

-- Backfill: if you have existing claim_token values, hash them into claim_token_hash
-- Requires pgcrypto (usually enabled in Supabase).
do $$
begin
  -- If pgcrypto is not enabled, this will fail; enable it in Supabase if needed:
  -- create extension if not exists pgcrypto;

  update public.quiz_sessions
    set claim_token_hash = encode(digest(claim_token, 'sha256'), 'hex'),
        claim_token_created_at = coalesce(claim_token_created_at, created_at)
  where claim_token is not null
    and claim_token_hash is null;
exception when undefined_function then
  -- digest() not available (pgcrypto not enabled). Leave backfill for later.
  -- You can enable pgcrypto and re-run the UPDATE.
  raise notice 'pgcrypto digest() not available; skipped backfill. Enable pgcrypto and re-run the UPDATE.';
end $$;

-- Unique partial index on claim_token_hash (mirrors your existing claim_token unique partial index pattern)
create unique index if not exists quiz_sessions_claim_token_hash_uq
on public.quiz_sessions (claim_token_hash)
where claim_token_hash is not null;

-- Optional but recommended:
-- If you are moving fully to hashed tokens, you can drop the old unique index on claim_token
-- (and eventually drop the claim_token column itself).
-- Do this only after you confirm nothing else in your code writes/reads claim_token.
-- drop index if exists public.quiz_sessions_claim_token_key;

-- Optional hardening: (later) remove raw token storage entirely:
-- alter table public.quiz_sessions drop column if exists claim_token;
