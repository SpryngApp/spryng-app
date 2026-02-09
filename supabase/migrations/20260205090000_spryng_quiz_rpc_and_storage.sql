-- =========================================
-- Spryng Quiz: Private rules + public-safe RPC
-- + Lead capture + Stored quiz runs (sovereign dataset)
-- =========================================

create extension if not exists pgcrypto;

-- -----------------------------------------
-- 1) Keep state_registration_rules private
-- -----------------------------------------
alter table if exists public.state_registration_rules enable row level security;

revoke all on table public.state_registration_rules from anon, authenticated;
revoke all on table public.state_registration_rules from public;

-- No SELECT policies intentionally (server/service-role only).

-- -----------------------------------------
-- 2) Lead capture BEFORE quiz (via RPC)
-- -----------------------------------------
create table if not exists public.quiz_leads (
  lead_id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  full_name text null,
  state_code text null,
  industry text null,
  source text null,
  metadata jsonb not null default '{}'::jsonb
);

-- Minimal validation
alter table public.quiz_leads
  add constraint quiz_leads_email_len_chk
  check (length(email) <= 320);

create index if not exists quiz_leads_created_at_idx on public.quiz_leads (created_at desc);
create index if not exists quiz_leads_email_lower_idx on public.quiz_leads ((lower(email)));

alter table public.quiz_leads enable row level security;

-- Lock down table completely; inserts only via RPC
revoke all on table public.quiz_leads from anon, authenticated;
revoke all on table public.quiz_leads from public;

drop function if exists public.quiz_create_lead(text, text, text, text, text, jsonb);

create function public.quiz_create_lead(
  p_email text,
  p_full_name text default null,
  p_state_code text default null,
  p_industry text default null,
  p_source text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := nullif(trim(coalesce(p_email,'')), '');
  v_lead_id uuid;
  v_state text := nullif(upper(trim(coalesce(p_state_code,''))), '');
begin
  if v_email is null or position('@' in v_email) = 0 then
    return jsonb_build_object('ok', false, 'error', jsonb_build_object('code','BAD_EMAIL','message','Valid email required'));
  end if;

  insert into public.quiz_leads (email, full_name, state_code, industry, source, metadata)
  values (v_email, nullif(trim(coalesce(p_full_name,'')), ''), v_state, nullif(trim(coalesce(p_industry,'')), ''), nullif(trim(coalesce(p_source,'')), ''), coalesce(p_metadata,'{}'::jsonb))
  returning lead_id into v_lead_id;

  return jsonb_build_object('ok', true, 'data', jsonb_build_object('lead_id', v_lead_id));
end;
$$;

revoke all on function public.quiz_create_lead(text, text, text, text, text, jsonb) from public;
grant execute on function public.quiz_create_lead(text, text, text, text, text, jsonb) to anon, authenticated;

-- -----------------------------------------
-- 3) Stored quiz runs (answers + computed result)
--    Private table; written only by RPC.
-- -----------------------------------------
create table if not exists public.quiz_runs (
  run_id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- optional link to pre-quiz lead capture
  lead_id uuid null references public.quiz_leads(lead_id) on delete set null,

  -- optional link to logged-in user (if they take quiz post-login)
  user_id uuid null,

  quiz_version text not null default 'v1',
  state_code text not null,

  -- structured inputs + outputs
  answers jsonb not null default '{}'::jsonb,
  result jsonb not null default '{}'::jsonb,

  -- helpful for analytics without exposing rules
  result_key text null,           -- e.g., register_now | not_yet | needs_more_info | state_data_missing
  liability_bucket text null,     -- general | domestic | agricultural | nonprofit
  signals jsonb not null default '{}'::jsonb, -- derived flags for analysis

  client_meta jsonb not null default '{}'::jsonb
);

create index if not exists quiz_runs_created_at_idx on public.quiz_runs (created_at desc);
create index if not exists quiz_runs_state_code_idx on public.quiz_runs (state_code);
create index if not exists quiz_runs_result_key_idx on public.quiz_runs (result_key);

alter table public.quiz_runs enable row level security;

-- Lock down table completely
revoke all on table public.quiz_runs from anon, authenticated;
revoke all on table public.quiz_runs from public;

-- (Intentionally no policies. Read/write through service role or RPC only.)

-- -----------------------------------------
-- 4) Public-safe RPC: quiz blueprint
--    Returns question tiles + options + UI hints only.
--    No raw thresholds.
-- -----------------------------------------
drop function if exists public.quiz_get_blueprint(text);

create function public.quiz_get_blueprint(p_state_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(p_state_code));
  v_row record;

  v_rules jsonb;
  v_status text;

  v_has_general_wage boolean := false;
  v_has_general_weeks boolean := false;
  v_has_domestic boolean := false;
  v_has_ag boolean := false;
  v_has_np boolean := false;
  v_withholding_required boolean := false;

  v_questions jsonb := '[]'::jsonb;
begin
  if v_code is null or length(v_code) <> 2 then
    return jsonb_build_object('ok', false, 'error', jsonb_build_object('code','BAD_STATE','message','state_code must be a 2-letter code'));
  end if;

  select r.state_code, r.state_name, r.rules
  into v_row
  from public.state_registration_rules r
  where r.state_code = v_code
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', jsonb_build_object('code','STATE_NOT_FOUND','message','State not found in dataset'));
  end if;

  v_rules := coalesce(v_row.rules, '{}'::jsonb);
  v_status := coalesce(v_rules->>'status', 'missing');

  v_has_general_wage := (v_rules #>> '{ui_liability,general,wage_threshold,amount}') is not null;
  v_has_general_weeks := (v_rules #>> '{ui_liability,general,weeks_threshold,weeks}') is not null;

  v_has_domestic := (v_rules #>> '{ui_liability,domestic,wage_threshold,amount}') is not null
                    or (v_rules #>> '{ui_liability,domestic,weeks_threshold,weeks}') is not null;

  v_has_ag := (v_rules #>> '{ui_liability,agricultural,wage_threshold,amount}') is not null
              or (v_rules #>> '{ui_liability,agricultural,weeks_threshold,weeks}') is not null;

  v_has_np := (v_rules #>> '{ui_liability,nonprofit,wage_threshold,amount}') is not null
              or (v_rules #>> '{ui_liability,nonprofit,weeks_threshold,weeks}') is not null;

  v_withholding_required := coalesce((v_rules #>> '{withholding,required_from_first_payroll}')::boolean, false);

  -- Lead capture happens before quiz; not included here.

  -- Entity type (helps interpret edge cases later; you’re building the sovereign dataset now)
  v_questions := v_questions
    || jsonb_build_array(jsonb_build_object(
      'id','entity_type',
      'type','tile_select',
      'title','How is your business set up?',
      'helper','If you’re not sure, pick your best guess — you can update it later.',
      'icon','building',
      'options', jsonb_build_array(
        jsonb_build_object('value','sole_prop_sml', 'label','Sole proprietor / Single-member LLC'),
        jsonb_build_object('value','partnership_mml', 'label','Partnership / Multi-member LLC'),
        jsonb_build_object('value','s_corp', 'label','S-Corp'),
        jsonb_build_object('value','c_corp', 'label','C-Corp'),
        jsonb_build_object('value','nonprofit', 'label','Nonprofit'),
        jsonb_build_object('value','not_sure', 'label','Not sure yet')
      )
    ));

  -- Industry
  v_questions := v_questions
    || jsonb_build_array(jsonb_build_object(
      'id','industry',
      'type','tile_select',
      'title','What kind of work do you do?',
      'helper','This helps Spryng use examples that match your world.',
      'icon','briefcase',
      'options', jsonb_build_array(
        jsonb_build_object('value','services', 'label','Services'),
        jsonb_build_object('value','ecommerce', 'label','E-commerce / Products'),
        jsonb_build_object('value','construction', 'label','Construction / Trades'),
        jsonb_build_object('value','trucking', 'label','Trucking / Logistics'),
        jsonb_build_object('value','cleaning', 'label','Cleaning'),
        jsonb_build_object('value','creative', 'label','Creative / Marketing'),
        jsonb_build_object('value','other', 'label','Other')
      )
    ));

  -- Helpers (main)
  v_questions := v_questions
    || jsonb_build_array(jsonb_build_object(
      'id','paid_helpers',
      'type','tile_select',
      'title','Have you paid anyone to help with work in ' || v_row.state_name || '?',
      'helper','Include cash, Zelle/Venmo, checks, reimbursements — any payment outside payroll.',
      'icon','users',
      'options', jsonb_build_array(
        jsonb_build_object('value','yes', 'label','Yes'),
        jsonb_build_object('value','no', 'label','No'),
        jsonb_build_object('value','not_sure', 'label','Not sure')
      )
    ));

  -- Family/friends catch (shown especially if they said “no” or “not sure”)
  v_questions := v_questions
    || jsonb_build_array(jsonb_build_object(
      'id','paid_family_friends',
      'type','tile_select',
      'title','What about family or friends — have you ever paid them to help?',
      'helper','People often skip this by accident. Even “just helping out” payments count here.',
      'icon','heart',
      'show_if', jsonb_build_object('question','paid_helpers','in', jsonb_build_array('no','not_sure')),
      'options', jsonb_build_array(
        jsonb_build_object('value','yes', 'label','Yes'),
        jsonb_build_object('value','no', 'label','No')
      )
    ));

  -- Outside payroll
  v_questions := v_questions
    || jsonb_build_array(jsonb_build_object(
      'id','outside_payroll',
      'type','tile_select',
      'title','Were any of those payments outside payroll?',
      'helper','“Outside payroll” means you paid them directly (not on payroll).',
      'icon','wallet',
      'options', jsonb_build_array(
        jsonb_build_object('value','yes', 'label','Yes'),
        jsonb_build_object('value','no', 'label','No'),
        jsonb_build_object('value','mix', 'label','A mix of both'),
        jsonb_build_object('value','not_sure', 'label','Not sure')
      )
    ));

  -- Same course of business
  v_questions := v_questions
    || jsonb_build_array(jsonb_build_object(
      'id','same_course',
      'type','tile_select',
      'title','Was the work part of what you sell to customers?',
      'helper','Example: a cleaning company paying cleaners = “yes.” a bakery paying a logo designer = “no.”',
      'icon','target',
      'options', jsonb_build_array(
        jsonb_build_object('value','yes', 'label','Yes'),
        jsonb_build_object('value','no', 'label','No'),
        jsonb_build_object('value','not_sure', 'label','Not sure')
      )
    ));

  -- Payment / weeks questions only if state has those tests
  if v_has_general_wage then
    v_questions := v_questions
      || jsonb_build_array(jsonb_build_object(
        'id','payments_quarter',
        'type','amount_range',
        'title','In the last 3 months, about how much did you pay people for work in ' || v_row.state_name || '?',
        'helper','Estimate is fine. States often use “wages” language even when payments were outside payroll.',
        'icon','dollar'
      ));
  end if;

  if v_has_general_weeks then
    v_questions := v_questions
      || jsonb_build_array(jsonb_build_object(
        'id','weeks_worked',
        'type','number_range',
        'title','About how many different weeks this year has anyone worked for you?',
        'helper','Even one day in a week counts as a week.',
        'icon','calendar'
      ));
  end if;

  if (v_has_domestic or v_has_ag or v_has_np) then
    v_questions := v_questions
      || jsonb_build_array(jsonb_build_object(
        'id','worker_type',
        'type','tile_select',
        'title','Which best describes the help you pay?',
        'helper','Some states have different registration rules for household help, farm labor, or nonprofits.',
        'icon','layers',
        'options', jsonb_build_array(
          jsonb_build_object('value','general','label','General business work'),
          jsonb_build_object('value','domestic','label','Household / in-home help'),
          jsonb_build_object('value','agricultural','label','Agricultural / farm work'),
          jsonb_build_object('value','nonprofit','label','Nonprofit staffing')
        )
      ));
  end if;

  -- Hiring goals (lead + product relevance even if not liable yet)
  v_questions := v_questions
    || jsonb_build_array(jsonb_build_object(
      'id','hiring_goals',
      'type','tile_select',
      'title','Are you planning to hire in the next few months?',
      'helper','If yes, Spryng can help you track progress and get ready before registration becomes urgent.',
      'icon','sparkles',
      'options', jsonb_build_array(
        jsonb_build_object('value','yes','label','Yes'),
        jsonb_build_object('value','no','label','No'),
        jsonb_build_object('value','maybe','label','Maybe')
      )
    ));

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'state_code', v_row.state_code,
      'state_name', v_row.state_name,
      'status', v_status,
      'signals', jsonb_build_object(
        'has_general_wage_test', v_has_general_wage,
        'has_general_weeks_test', v_has_general_weeks,
        'has_domestic_rules', v_has_domestic,
        'has_agricultural_rules', v_has_ag,
        'has_nonprofit_rules', v_has_np,
        'withholding_required', v_withholding_required
      ),
      'questions', v_questions
    )
  );
end;
$$;

revoke all on function public.quiz_get_blueprint(text) from public;
grant execute on function public.quiz_get_blueprint(text) to anon, authenticated;

-- -----------------------------------------
-- 5) Evaluation (internal compares; returns curated messaging)
-- -----------------------------------------
drop function if exists public.quiz_evaluate(text, jsonb);

create function public.quiz_evaluate(p_state_code text, p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(p_state_code));
  v_row record;

  v_rules jsonb;
  v_status text;

  -- Normalize answers (client should send simple values)
  a_paid_helpers text := lower(nullif(trim(coalesce(p_answers->>'paid_helpers','')), ''));
  a_paid_family text := lower(nullif(trim(coalesce(p_answers->>'paid_family_friends','')), ''));
  a_outside_payroll text := lower(nullif(trim(coalesce(p_answers->>'outside_payroll','')), ''));
  a_same_course text := lower(nullif(trim(coalesce(p_answers->>'same_course','')), ''));
  a_worker_type text := lower(nullif(trim(coalesce(p_answers->>'worker_type','')), ''));
  a_entity_type text := lower(nullif(trim(coalesce(p_answers->>'entity_type','')), ''));
  a_hiring_goals text := lower(nullif(trim(coalesce(p_answers->>'hiring_goals','')), ''));

  a_payments_quarter numeric := nullif((p_answers->>'payments_quarter')::numeric, 0);
  a_payments_year numeric := nullif((p_answers->>'payments_year')::numeric, 0);
  a_weeks_worked int := nullif((p_answers->>'weeks_worked')::int, 0);
  a_max_workers_same_week int := nullif((p_answers->>'max_workers_same_week')::int, 0);

  -- Derived booleans
  b_paid_anyone boolean := false;
  b_paid_outside_payroll boolean := false;
  b_hiring_soon boolean := false;

  -- thresholds (kept internal)
  t_wage_amount numeric;
  t_wage_period text;
  t_weeks int;
  t_weeks_min_employees int;

  v_bucket text := 'general';
  v_liability_met boolean := false;
  v_needs_more_info boolean := false;

  v_headline text;
  v_summary text;
  v_next_steps jsonb := '[]'::jsonb;
  v_cta text;

  v_withholding_required boolean := false;
begin
  if v_code is null or length(v_code) <> 2 then
    return jsonb_build_object('ok', false, 'error', jsonb_build_object('code','BAD_STATE','message','state_code must be a 2-letter code'));
  end if;

  select r.state_code, r.state_name, r.rules
  into v_row
  from public.state_registration_rules r
  where r.state_code = v_code
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'error', jsonb_build_object('code','STATE_NOT_FOUND','message','State not found in dataset'));
  end if;

  v_rules := coalesce(v_row.rules, '{}'::jsonb);
  v_status := coalesce(v_rules->>'status', 'missing');
  v_withholding_required := coalesce((v_rules #>> '{withholding,required_from_first_payroll}')::boolean, false);

  if v_status <> 'complete' and v_status <> 'partial' then
    return jsonb_build_object(
      'ok', true,
      'data', jsonb_build_object(
        'result', 'state_data_missing',
        'headline', 'We’re still finalizing rules for ' || v_row.state_name || '.',
        'summary', 'You can still create an account to track payments outside payroll and get notified when your state guidance is ready.',
        'cta', 'Create my Spryng account',
        'next_steps', jsonb_build_array(
          'Create your Spryng account to track payments outside payroll.',
          'Keep basic proof (who, what, when, how much) for any payments.',
          'We’ll notify you when your state’s registration steps are ready.'
        ),
        'disclaimer', 'Spryng provides general guidance to help you get organized. For official requirements, consult your state agency.'
      )
    );
  end if;

  -- Decide if they paid anyone (catch family/friends)
  b_paid_anyone := (a_paid_helpers = 'yes') or (a_paid_family = 'yes');

  b_paid_outside_payroll := (a_outside_payroll in ('yes','mix'));
  b_hiring_soon := (a_hiring_goals in ('yes','maybe'));

  -- bucket selection
  if a_worker_type in ('domestic','agricultural','nonprofit') then
    v_bucket := a_worker_type;
  else
    v_bucket := 'general';
  end if;

  -- pull thresholds for bucket; fallback to general
  t_wage_amount := nullif((v_rules #>> array['ui_liability', v_bucket, 'wage_threshold', 'amount'])::numeric, 0);
  t_wage_period := nullif(v_rules #>> array['ui_liability', v_bucket, 'wage_threshold', 'period'], '');

  t_weeks := (v_rules #>> array['ui_liability', v_bucket, 'weeks_threshold', 'weeks'])::int;
  t_weeks_min_employees := (v_rules #>> array['ui_liability', v_bucket, 'weeks_threshold', 'min_employees'])::int;

  if t_wage_amount is null and t_weeks is null then
    v_bucket := 'general';
    t_wage_amount := nullif((v_rules #>> '{ui_liability,general,wage_threshold,amount}')::numeric, 0);
    t_wage_period := nullif(v_rules #>> '{ui_liability,general,wage_threshold,period}', '');
    t_weeks := (v_rules #>> '{ui_liability,general,weeks_threshold,weeks}')::int;
    t_weeks_min_employees := (v_rules #>> '{ui_liability,general,weeks_threshold,min_employees}')::int;
  end if;

  v_liability_met := false;
  v_needs_more_info := false;

  if not b_paid_anyone then
    v_liability_met := false;
  else
    -- wage test
    if t_wage_amount is not null and t_wage_period is not null then
      if t_wage_period = 'quarter' then
        if a_payments_quarter is null then
          v_needs_more_info := true;
        elsif a_payments_quarter >= t_wage_amount then
          v_liability_met := true;
        end if;
      elsif t_wage_period = 'year' then
        if a_payments_year is null then
          v_needs_more_info := true;
        elsif a_payments_year >= t_wage_amount then
          v_liability_met := true;
        end if;
      end if;
    end if;

    -- weeks test
    if t_weeks is not null then
      if a_weeks_worked is null then
        v_needs_more_info := true;
      else
        if coalesce(t_weeks_min_employees, 1) > 1 and a_max_workers_same_week is null then
          v_needs_more_info := true;
        elsif a_weeks_worked >= t_weeks
          and coalesce(a_max_workers_same_week, 1) >= coalesce(t_weeks_min_employees, 1) then
          v_liability_met := true;
        end if;
      end if;
    end if;
  end if;

  if v_needs_more_info then
    v_headline := 'You’re close — we just need one more detail.';
    v_summary := 'To give you the most accurate answer for ' || v_row.state_name || ', we need a quick estimate on your recent payments and/or weeks worked.';
    v_cta := 'Continue';
    v_next_steps := jsonb_build_array(
      'Estimate your total payments for work in the last 3 months (including payments outside payroll).',
      'Estimate how many different weeks anyone worked for you this year (even one day counts).'
    );

    return jsonb_build_object(
      'ok', true,
      'data', jsonb_build_object(
        'result', 'needs_more_info',
        'headline', v_headline,
        'summary', v_summary,
        'cta', v_cta,
        'next_steps', v_next_steps,
        'liability_bucket', v_bucket,
        'withholding_required', v_withholding_required,
        'disclaimer', 'Spryng provides general guidance to help you get organized. For official requirements, consult your state agency.'
      )
    );
  end if;

  if v_liability_met then
    v_headline := 'Based on your answers, you likely need to register in ' || v_row.state_name || '.';
    v_summary := 'Paying people for work (especially outside payroll) can trigger employer registration sooner than most owners expect.';
    v_cta := 'Create my Spryng account';
    v_next_steps := jsonb_build_array(
      'Create your Spryng account to get the step-by-step registration checklist for ' || v_row.state_name || '.',
      'Start saving proof: who you paid, what they did, how much, dates, and how you paid.',
      'Keep your payment trail clean going forward so you’re audit-ready.'
    );
  else
    if b_hiring_soon or b_paid_outside_payroll then
      v_headline := 'You may not need to register yet — but you’re smart to get ahead of it.';
      v_summary := 'Spryng can track payments outside payroll and show you when you’re approaching your state’s trigger points — so registration doesn’t sneak up on you.';
      v_cta := 'Create my Spryng account';
      v_next_steps := jsonb_build_array(
        'Create your Spryng account to track your progress in ' || v_row.state_name || '.',
        'Log any payments outside payroll and keep proof automatically.',
        'When you hit your state’s thresholds, Spryng will guide you through registration.'
      );
    else
      v_headline := 'Based on what you shared, you likely don’t need to register yet.';
      v_summary := 'If anything changes — more help, more frequent work, or higher payments — your registration timing can shift quickly.';
      v_cta := 'Save my progress';
      v_next_steps := jsonb_build_array(
        'If you start paying for help, track it (especially payments outside payroll).',
        'Keep basic proof for any payments: who, what, when, how much, and how paid.',
        'Recheck your status if you hire or expand in the next few months.'
      );
    end if;
  end if;

  -- Gentle note (no state-specific claims yet)
  if (a_paid_family = 'yes') then
    v_next_steps := v_next_steps || jsonb_build_array(
      'Note: Because you mentioned paying family or friends, Spryng will help you double-check any special treatment that may apply based on your entity type.'
    );
  end if;

  if (a_same_course = 'yes') then
    v_next_steps := v_next_steps || jsonb_build_array(
      'When the work is core to what you sell, it’s worth being extra careful about documentation.'
    );
  end if;

  return jsonb_build_object(
    'ok', true,
    'data', jsonb_build_object(
      'result', case when v_liability_met then 'register_now' else 'not_yet' end,
      'headline', v_headline,
      'summary', v_summary,
      'cta', v_cta,
      'next_steps', v_next_steps,
      'liability_bucket', v_bucket,
      'withholding_required', v_withholding_required,
      'disclaimer', 'Spryng provides general guidance to help you get organized. For official requirements, consult your state agency.'
    )
  );
end;
$$;

revoke all on function public.quiz_evaluate(text, jsonb) from public;
grant execute on function public.quiz_evaluate(text, jsonb) to anon, authenticated;

-- -----------------------------------------
-- 6) ONE RPC for pre-login quiz:
--    evaluate + store answers + store result
--    (so your dataset is consistent and tamper-resistant)
-- -----------------------------------------
drop function if exists public.quiz_submit(text, jsonb, uuid, jsonb, text);

create function public.quiz_submit(
  p_state_code text,
  p_answers jsonb,
  p_lead_id uuid default null,
  p_client_meta jsonb default '{}'::jsonb,
  p_quiz_version text default 'v1'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_eval jsonb;
  v_data jsonb;
  v_result_key text;
  v_bucket text;
  v_signals jsonb := '{}'::jsonb;
  v_user_id uuid := null;
begin
  -- if called with auth, capture user id (optional)
  begin
    v_user_id := auth.uid();
  exception when others then
    v_user_id := null;
  end;

  v_eval := public.quiz_evaluate(p_state_code, coalesce(p_answers,'{}'::jsonb));
  v_data := coalesce(v_eval->'data', '{}'::jsonb);
  v_result_key := nullif(v_data->>'result', '');
  v_bucket := nullif(v_data->>'liability_bucket', '');

  -- store a few derived signals for analysis (no raw thresholds)
  v_signals := jsonb_build_object(
    'paid_helpers', lower(coalesce(p_answers->>'paid_helpers','')) = 'yes',
    'paid_family_friends', lower(coalesce(p_answers->>'paid_family_friends','')) = 'yes',
    'outside_payroll', lower(coalesce(p_answers->>'outside_payroll','')) in ('yes','mix'),
    'same_course', lower(coalesce(p_answers->>'same_course','')) = 'yes',
    'hiring_goals', lower(coalesce(p_answers->>'hiring_goals','')) in ('yes','maybe'),
    'entity_type', coalesce(p_answers->>'entity_type', null),
    'industry', coalesce(p_answers->>'industry', null)
  );

  insert into public.quiz_runs (
    lead_id, user_id, quiz_version, state_code, answers, result, result_key, liability_bucket, signals, client_meta
  )
  values (
    p_lead_id, v_user_id, coalesce(nullif(p_quiz_version,''),'v1'), upper(trim(p_state_code)),
    coalesce(p_answers,'{}'::jsonb),
    v_data,
    v_result_key,
    v_bucket,
    v_signals,
    coalesce(p_client_meta,'{}'::jsonb)
  );

  return v_eval;
end;
$$;

revoke all on function public.quiz_submit(text, jsonb, uuid, jsonb, text) from public;
grant execute on function public.quiz_submit(text, jsonb, uuid, jsonb, text) to anon, authenticated;
