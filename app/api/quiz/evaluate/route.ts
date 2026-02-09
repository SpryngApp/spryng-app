// app/api/quiz/evaluate/route.ts

import { NextResponse } from "next/server";
import { createClient, type PostgrestError } from "@supabase/supabase-js";
import { createHash, randomBytes, randomUUID } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const CLAIM_COOKIE = "spryng_quiz_claim";
const CLAIM_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Bump this whenever you change evaluator logic in a meaningful way
const EVALUATOR_VERSION = "2026-02-06.1";

function asObject(v: unknown): Record<string, unknown> {
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return { data: v };
}

function jsonOk(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, ...asObject(data) }, { status });
}

function jsonErr(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

function toStr(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function upper2(v: unknown) {
  const s = toStr(v).toUpperCase();
  return /^[A-Z]{2}$/.test(s) ? s : "";
}

function sha256Hex(input: string) {
  return createHash("sha256").update(input).digest("hex");
}

function makeClaimToken() {
  return randomBytes(32).toString("base64url");
}

function getEnv() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY");
  }
  return { url, serviceKey };
}

function isUndefinedColumn(err: PostgrestError | null | undefined) {
  // postgres: undefined_column
  return err?.code === "42703";
}

type QuizAssessment = {
  assessment_id: string;
  state_code: string;
  state_name: string;

  recommendation:
    | "register_now"
    | "track_for_later"
    | "needs_one_detail"
    | "household_path"
    | "not_supported_yet";
  confidence: "high" | "medium" | "low";

  headline: string;
  subhead?: string;

  why: string[];
  next_steps: string[];

  missing_inputs?: Array<{
    key:
      | "entity_tax_treatment"
      | "payment_frequency"
      | "total_paid_range"
      | "household_vs_business"
      | "same_course_of_business"
      | "helper_relationship"
      | "payee_is_owner";
    prompt: string;
    choices?: { value: string; label: string }[];
  }>;

  callouts?: Array<
    "FAMILY_PAYMENTS" | "OWNER_MEMBER_PAYMENTS" | "SAME_COURSE_CORE" | "OUTSIDE_PAYROLL_PROOF_ROUTINE"
  >;

  cta_primary:
    | { kind: "create_account"; label: string }
    | { kind: "save_progress"; label: string }
    | { kind: "view_steps"; label: string }
    | { kind: "email_results"; label: string };

  cta_secondary?:
    | { kind: "create_account"; label: string }
    | { kind: "save_progress"; label: string }
    | { kind: "view_steps"; label: string }
    | { kind: "email_results"; label: string };

  data_coverage: {
    state_registration_rules: "complete" | "partial" | "missing";
    payment_exclusions: "complete" | "partial" | "missing";
    notes?: string[];
  };

  evaluator_version: string;
  created_at: string;
};

type IncomingPayloadNew = {
  quiz_version?: string;
  hints?: Record<string, unknown> | null;
  answers?: Record<string, unknown>;
  meta?: { client_session_id?: string; utm?: Record<string, unknown> };
};

type IncomingPayloadLegacy = {
  lead?: { name?: string; email?: string };
  state_code?: string;
  answers?: Record<string, unknown>;
  meta?: { client_session_id?: string; utm?: Record<string, unknown> };
};

type IncomingPayload = IncomingPayloadNew & IncomingPayloadLegacy;

type UiLiability = {
  notes?: string[] | null;
  general?: any;
  domestic?: any;
  agricultural?: any;
  nonprofit?: any;
};

function paidHelpersOutsidePayroll(answers: Record<string, unknown>): boolean | "not_sure" {
  const s = toStr(answers.paid_helpers_outside_payroll).toLowerCase();
  if (s === "yes") return true;
  if (s === "no") return false;
  return "not_sure";
}

function hiringIntent(answers: Record<string, unknown>): boolean | "not_sure" {
  const s = toStr(answers.hiring_next_year).toLowerCase();
  if (s === "yes_3mo" || s === "yes_12mo") return true;
  if (s === "no") return false;
  return "not_sure";
}

function sameCourseFlag(answers: Record<string, unknown>): boolean | "not_sure" {
  const s = toStr(answers.same_course_of_business).toLowerCase();
  if (s === "yes_core") return true;
  if (s === "no_support") return false;
  return "not_sure";
}

function whoDidYouPay(answers: Record<string, unknown>): string[] {
  const v = answers.who_did_you_pay;
  if (Array.isArray(v)) return v.map((x) => toStr(x)).filter(Boolean);
  return [];
}

function normalizeEmploymentCategory(
  answers: Record<string, unknown>
): "general" | "domestic" | "agricultural" | "nonprofit" | "government" | "unknown" {
  const s = toStr(answers.employment_category).toLowerCase();
  if (s === "general" || s === "domestic" || s === "agricultural" || s === "nonprofit" || s === "government") return s;
  return "unknown";
}

/**
 * Supports BOTH old bucket values and new bucket values so you don’t break older sessions.
 */
function rangeToMinMaxAmount(v: unknown): { min: number | null; max: number | null; unknown: boolean } {
  const s = toStr(v);
  if (!s || s === "not_sure") return { min: null, max: null, unknown: true };
  if (s === "zero") return { min: 0, max: 0, unknown: false };

  // NEW buckets
  if (s === "1_499") return { min: 1, max: 499, unknown: false };
  if (s === "500_2000") return { min: 500, max: 2000, unknown: false };
  if (s === "2000_10000") return { min: 2000, max: 10000, unknown: false };
  if (s === "gt_10000") return { min: 10001, max: null, unknown: false };

  // OLD buckets (tolerated)
  if (s === "1_249") return { min: 1, max: 249, unknown: false };
  if (s === "250_749") return { min: 250, max: 749, unknown: false };
  if (s === "750_999") return { min: 750, max: 999, unknown: false };
  if (s === "1000_2499") return { min: 1000, max: 2499, unknown: false };
  if (s === "2500_plus") return { min: 2500, max: null, unknown: false };

  return { min: null, max: null, unknown: true };
}

function rangeToMinMaxWeeks(v: unknown): { min: number | null; max: number | null; unknown: boolean } {
  const s = toStr(v);
  if (!s) return { min: null, max: null, unknown: true };
  if (s === "0") return { min: 0, max: 0, unknown: false };
  if (s === "1_2") return { min: 1, max: 2, unknown: false };
  if (s === "3_5") return { min: 3, max: 5, unknown: false };
  if (s === "6_9") return { min: 6, max: 9, unknown: false };
  if (s === "10_19") return { min: 10, max: 19, unknown: false };
  if (s === "20_plus") return { min: 20, max: null, unknown: false };
  return { min: null, max: null, unknown: true };
}

function pickLiabilityBranch(ui: UiLiability | null, category: string) {
  const c = category || "general";
  if (!ui) return null;
  if (c === "domestic") return ui.domestic ?? ui.general ?? null;
  if (c === "agricultural") return ui.agricultural ?? ui.general ?? null;
  if (c === "nonprofit") return ui.nonprofit ?? ui.general ?? null;
  return ui.general ?? null;
}

function extractThresholds(branch: any): {
  wage_amount: number | null;
  wage_period: "quarter" | "year" | null;
  weeks: number | null;
} {
  const wage_amount = typeof branch?.wage_threshold?.amount === "number" ? branch.wage_threshold.amount : null;
  const wage_period =
    branch?.wage_threshold?.period === "quarter"
      ? "quarter"
      : branch?.wage_threshold?.period === "year"
        ? "year"
        : null;

  const weeks = typeof branch?.weeks_threshold?.weeks === "number" ? branch.weeks_threshold.weeks : null;

  return { wage_amount, wage_period, weeks };
}

function makeAssessment(opts: {
  state_code: string;
  state_name: string;
  state_rules_status: "complete" | "partial" | "missing";
  payment_exclusions_rows: number;
  answers: Record<string, unknown>;
  ui_liability: UiLiability | null;
  rules_todo: string[];
}): QuizAssessment {
  const nowIso = new Date().toISOString();
  const assessment_id = randomUUID();

  const category = normalizeEmploymentCategory(opts.answers);
  const paidOutside = paidHelpersOutsidePayroll(opts.answers);
  const plansToHire = hiringIntent(opts.answers);
  const sameCourse = sameCourseFlag(opts.answers);
  const who = whoDidYouPay(opts.answers);

  const hasFamily = who.includes("family") || who.includes("friends");
  const hasOwnerMember = who.includes("owner_member");

  const callouts: QuizAssessment["callouts"] = [];
  if (hasFamily) callouts.push("FAMILY_PAYMENTS");
  if (hasOwnerMember) callouts.push("OWNER_MEMBER_PAYMENTS");
  if (sameCourse === true) callouts.push("SAME_COURSE_CORE");
  if (paidOutside === true || paidOutside === "not_sure") callouts.push("OUTSIDE_PAYROLL_PROOF_ROUTINE");

  const data_coverage: QuizAssessment["data_coverage"] = {
    state_registration_rules: opts.state_rules_status,
    payment_exclusions: opts.payment_exclusions_rows > 0 ? "partial" : "missing",
  };

  const coverageNotes: string[] = [];
  if (opts.state_rules_status !== "complete" && opts.rules_todo.length) {
    coverageNotes.push("Some state logic is still being finalized; we may ask 1–2 follow-ups to be precise.");
  }
  if (hasFamily && opts.payment_exclusions_rows === 0) {
    coverageNotes.push("Family/friend payment exclusions are still expanding for every state.");
  }
  if (coverageNotes.length) data_coverage.notes = coverageNotes;

  if (category === "domestic" && opts.state_rules_status !== "missing") {
    return {
      assessment_id,
      state_code: opts.state_code,
      state_name: opts.state_name,
      recommendation: "household_path",
      confidence: opts.state_rules_status === "complete" ? "high" : "medium",
      headline: `Household help rules can be different in ${opts.state_name}.`,
      subhead: "We’ll guide you down the household path without compliance jargon.",
      why: [
        "Household help (like nannies/caregivers/housekeepers) often follows a separate set of state triggers.",
        "We’ll keep this simple and translate the state’s language into plain steps.",
      ],
      next_steps: [
        "Create an account to save your snapshot and get the household-specific checklist.",
        "Start a simple outside-payroll log: who you paid, what for, and how much.",
        "Keep proof: invoices, messages about the work, and payment confirmations.",
      ],
      callouts,
      cta_primary: { kind: "view_steps", label: "See my household steps" },
      cta_secondary: { kind: "create_account", label: "Create account to save this" },
      data_coverage,
      evaluator_version: EVALUATOR_VERSION,
      created_at: nowIso,
    };
  }

  if (opts.state_rules_status === "missing") {
    return {
      assessment_id,
      state_code: opts.state_code,
      state_name: opts.state_name,
      recommendation: "not_supported_yet",
      confidence: "low",
      headline: `We’re still finishing the state logic for ${opts.state_name}.`,
      subhead: "You can still save your progress and start tracking outside-payroll payments now.",
      why: [
        "We don’t want to guess — we only give state-specific guidance when we have it nailed.",
        "Saving your answers helps us send the right next steps as soon as your state is fully ready.",
      ],
      next_steps: [
        "Create an account to save this snapshot.",
        "Start a clean outside-payroll log: who you paid, what they did, and payment totals.",
        "Keep proof: invoices, messages, and payment confirmations in one place.",
      ],
      callouts,
      cta_primary: { kind: "create_account", label: "Create my Spryng account" },
      cta_secondary: { kind: "email_results", label: "Email me this result" },
      data_coverage,
      evaluator_version: EVALUATOR_VERSION,
      created_at: nowIso,
    };
  }

  if (paidOutside === false && plansToHire === false) {
    return {
      assessment_id,
      state_code: opts.state_code,
      state_name: opts.state_name,
      recommendation: "track_for_later",
      confidence: opts.state_rules_status === "complete" ? "high" : "medium",
      headline: `You may not need to register yet in ${opts.state_name}.`,
      subhead: "If you’re not paying helpers outside payroll (and not hiring soon), the next move is simple: stay organized.",
      why: ["Your answers don’t suggest an immediate trigger right now.", "Staying organized early prevents a scramble later."],
      next_steps: [
        "If you ever pay someone outside payroll, log it right away (who, what for, how much).",
        "Keep proof: invoices/agreements and payment confirmations.",
        "Create an account if you want reminders and a saved checklist for your state.",
      ],
      callouts,
      cta_primary: { kind: "create_account", label: "Create account (optional)" },
      cta_secondary: { kind: "email_results", label: "Email me this summary" },
      data_coverage,
      evaluator_version: EVALUATOR_VERSION,
      created_at: nowIso,
    };
  }

  if (paidOutside === false && (plansToHire === true || plansToHire === "not_sure")) {
    return {
      assessment_id,
      state_code: opts.state_code,
      state_name: opts.state_name,
      recommendation: "track_for_later",
      confidence: "medium",
      headline: `Planning ahead is the smart move for ${opts.state_name}.`,
      subhead: "Even before you hit a trigger, you can set up a clean tracking routine now.",
      why: [
        "You’re expecting to bring on help soon — most issues happen when tracking starts too late.",
        "Outside-payroll payments are where small business owners lose proof (without realizing it).",
      ],
      next_steps: [
        "Create an account to save your progress and get reminders when it’s time to act.",
        "When you start paying helpers, log the payment purpose + method immediately.",
        "Keep proof in one place (invoice, scope, messages, and payment confirmation).",
      ],
      callouts,
      cta_primary: { kind: "create_account", label: "Create my Spryng account" },
      cta_secondary: { kind: "email_results", label: "Email me this summary" },
      data_coverage,
      evaluator_version: EVALUATOR_VERSION,
      created_at: nowIso,
    };
  }

  const branch = pickLiabilityBranch(opts.ui_liability, category);
  const { wage_amount, wage_period, weeks } = extractThresholds(branch);

  const paid_amount_range = opts.answers.paid_amount_range;
  const paid_amount_timeframe = toStr(opts.answers.paid_amount_timeframe || "");
  const amt = rangeToMinMaxAmount(paid_amount_range);

  const weeks_range = opts.answers.weeks_with_help_range;
  const wks = rangeToMinMaxWeeks(weeks_range);

  const timeframeMatches =
    wage_period == null ||
    paid_amount_timeframe === "" ||
    paid_amount_timeframe === "not_sure" ||
    paid_amount_timeframe === wage_period;

  let amountTrigger: "met" | "not_met" | "unknown" = "unknown";
  if (wage_amount == null || amt.unknown || (!timeframeMatches && wage_period)) {
    amountTrigger = "unknown";
  } else {
    const min = amt.min ?? 0;
    const max = amt.max;
    if (min >= wage_amount) amountTrigger = "met";
    else if (max != null && max < wage_amount) amountTrigger = "not_met";
    else amountTrigger = "unknown";
  }

  let weeksTrigger: "met" | "not_met" | "unknown" = "unknown";
  if (weeks == null || wks.unknown) {
    weeksTrigger = "unknown";
  } else {
    const min = wks.min ?? 0;
    const max = wks.max;
    if (min >= weeks) weeksTrigger = "met";
    else if (max != null && max < weeks) weeksTrigger = "not_met";
    else weeksTrigger = "unknown";
  }

  const why: string[] = [];
  const missing_inputs: NonNullable<QuizAssessment["missing_inputs"]> = [];

  if (paidOutside === "not_sure") why.push("You’re not sure whether you’ve paid help outside payroll — that’s a common blind spot.");
  else why.push("You indicated you’ve paid people outside payroll, which can change employer obligations.");

  if (sameCourse === true) why.push("You said the help was part of what you sell to customers — states often treat core work more strictly.");
  else if (sameCourse === "not_sure") why.push("Whether the help was core to your business can affect how the state views the arrangement.");

  if (hasFamily) why.push("Payments to family or friends can be treated differently depending on entity type and tax setup.");

  if (amountTrigger === "met" || weeksTrigger === "met") {
    return {
      assessment_id,
      state_code: opts.state_code,
      state_name: opts.state_name,
      recommendation: "register_now",
      confidence: opts.state_rules_status === "complete" ? "high" : "medium",
      headline: `You may need to register as an employer in ${opts.state_name}.`,
      subhead: "We’ll keep this simple and tell you exactly what to do next — without compliance jargon.",
      why: why.slice(0, 5),
      next_steps: [
        "Create an account to get your state’s registration steps and a clean checklist.",
        "Gather proof for outside-payroll payments: invoice/scope, messages, and payment confirmations.",
        "Start (or tighten) your outside-payroll log: who, what for, amount, and dates.",
      ],
      callouts,
      cta_primary: { kind: "view_steps", label: "See my next steps" },
      cta_secondary: { kind: "create_account", label: "Create account to save this" },
      data_coverage,
      evaluator_version: EVALUATOR_VERSION,
      created_at: nowIso,
    };
  }

  const clearlyNotMet =
    (amountTrigger === "not_met" || wage_amount == null) && (weeksTrigger === "not_met" || weeks == null);

  if (clearlyNotMet && paidOutside === true) {
    return {
      assessment_id,
      state_code: opts.state_code,
      state_name: opts.state_name,
      recommendation: "track_for_later",
      confidence: opts.state_rules_status === "complete" ? "medium" : "low",
      headline: `You may not be at your state’s trigger yet in ${opts.state_name}.`,
      subhead: "The best move now is staying organized so you’re ready the moment you cross a line.",
      why: why.slice(0, 5),
      next_steps: [
        "Create an account so you can track progress and get reminders as your totals change.",
        "Keep your outside-payroll log updated (who, what for, totals, and dates).",
        "Save proof as you go — it’s much harder to recreate later.",
      ],
      callouts,
      cta_primary: { kind: "create_account", label: "Create account to track this" },
      cta_secondary: { kind: "email_results", label: "Email me this summary" },
      data_coverage,
      evaluator_version: EVALUATOR_VERSION,
      created_at: nowIso,
    };
  }

  if (amt.unknown || toStr(paid_amount_range) === "not_sure") {
    missing_inputs.push({
      key: "total_paid_range",
      prompt: "About how much have you paid outside payroll recently? (A rough range is fine.)",
    });
  }

  if (weeks != null && wks.unknown) {
    missing_inputs.push({
      key: "payment_frequency",
      prompt: "In how many different weeks did someone help you outside payroll? (A range is fine.)",
    });
  }

  const entity_raw = toStr(opts.answers.entity_type_raw);
  const smllc_t = toStr(opts.answers.smllc_tax_treatment);
  const mmllc_t = toStr(opts.answers.mmllc_tax_treatment);
  if (
    entity_raw === "not_sure" ||
    (entity_raw === "smllc" && smllc_t === "not_sure") ||
    (entity_raw === "mmllc" && mmllc_t === "not_sure")
  ) {
    missing_inputs.push({
      key: "entity_tax_treatment",
      prompt: "One more detail: how is your business taxed? (This can affect family/owner payments in some states.)",
    });
  }

  return {
    assessment_id,
    state_code: opts.state_code,
    state_name: opts.state_name,
    recommendation: "needs_one_detail",
    confidence: opts.state_rules_status === "complete" ? "medium" : "low",
    headline: `One quick detail will sharpen your result for ${opts.state_name}.`,
    subhead: "You’re close — we just want to match the state’s trigger cleanly without guessing.",
    why: why.slice(0, 5),
    next_steps: [
      "Create an account to save this snapshot and answer one quick follow-up for a cleaner result.",
      "List the people you paid outside payroll and what each person did (even if it felt casual).",
      "Keep proof: invoices, messages about the work, and payment confirmations.",
    ],
    missing_inputs: missing_inputs.length ? missing_inputs.slice(0, 3) : undefined,
    callouts,
    cta_primary: { kind: "create_account", label: "Save progress + finish" },
    cta_secondary: { kind: "email_results", label: "Email me this snapshot" },
    data_coverage,
    evaluator_version: EVALUATOR_VERSION,
    created_at: nowIso,
  };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingPayload;

    const answers =
      body?.answers && typeof body.answers === "object" && body.answers != null
        ? (body.answers as Record<string, unknown>)
        : {};

    const state_code = upper2(answers.state_code ?? body.state_code);
    if (!state_code) return jsonErr("BAD_STATE", "state_code must be a 2-letter code (e.g., IN).", 400);

    const lead_name = toStr(answers.lead_name ?? body?.lead?.name) || null;
    const lead_email = toStr(answers.lead_email ?? body?.lead?.email) || null;

    const client_session_id = toStr(body?.meta?.client_session_id) || null;
    const utm =
      body?.meta?.utm && typeof body.meta.utm === "object" && body.meta.utm != null ? body.meta.utm : {};

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const user_agent = req.headers.get("user-agent") || null;

    const { url, serviceKey } = getEnv();
    const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data: stateRow, error: stateErr } = await admin
      .from("state_registration_rules")
      .select("state_code,state_name,status,rules,ui_liability")
      .eq("state_code", state_code)
      .maybeSingle();

    if (stateErr) return jsonErr("STATE_RULES_READ_FAILED", "Could not read state rules.", 500, stateErr);

    const state_name = (stateRow?.state_name as string | null) ?? state_code;

    const statusFromCol = toStr((stateRow as any)?.status).toLowerCase();
    const statusFromRules = toStr((stateRow as any)?.rules?.status).toLowerCase();

    const state_rules_status: "complete" | "partial" | "missing" =
      statusFromCol === "complete" || statusFromCol === "partial" || statusFromCol === "missing"
        ? (statusFromCol as any)
        : statusFromRules === "complete" || statusFromRules === "partial" || statusFromRules === "missing"
          ? (statusFromRules as any)
          : stateRow
            ? "partial"
            : "missing";

    const rulesTodo: string[] = Array.isArray((stateRow as any)?.rules?.todo)
      ? (stateRow as any).rules.todo.filter((x: any) => typeof x === "string")
      : [];

    const ui_liability = ((stateRow as any)?.ui_liability ?? null) as UiLiability | null;

    let paymentExclusionRows = 0;
    const { count, error: exErr } = await admin
      .from("state_payment_exclusions")
      .select("id", { count: "exact", head: true })
      .eq("state_code", state_code);

    if (!exErr && typeof count === "number") paymentExclusionRows = count;

    // Idempotency: reuse session by client_session_id + state_code if possible
    let session_id: string | null = null;

    if (client_session_id) {
      const { data: existing, error: eErr } = await admin
        .from("quiz_sessions")
        .select("id")
        .eq("client_session_id", client_session_id)
        .eq("state_code", state_code)
        .maybeSingle();

      if (!eErr && existing?.id) session_id = existing.id as string;
    }

    if (!session_id) {
      const { data: session, error: sErr } = await admin
        .from("quiz_sessions")
        .insert({
          lead_name,
          lead_email,
          state_code,
          utm,
          client_session_id,
          ip,
          user_agent,
        })
        .select("id")
        .single();

      if (sErr) return jsonErr("QUIZ_SESSION_CREATE_FAILED", "Could not create quiz session.", 500, sErr);
      session_id = session.id as string;
    }

    const assessment = makeAssessment({
      state_code,
      state_name,
      state_rules_status,
      payment_exclusions_rows: paymentExclusionRows,
      answers,
      ui_liability,
      rules_todo: rulesTodo,
    });

    const { error: aErr } = await admin.from("quiz_answers").insert({
      session_id,
      answers: {
        ...answers,
        state_code,
        lead: { name: lead_name, email: lead_email },
        meta: {
          quiz_version: toStr(body?.quiz_version) || null,
          hints: body?.hints ?? null,
        },
      },
    });

    if (aErr) return jsonErr("QUIZ_ANSWERS_WRITE_FAILED", "Could not store quiz answers.", 500, aErr);

    const { error: rErr } = await admin.from("quiz_results").upsert(
      {
        session_id,
        evaluator_version: EVALUATOR_VERSION,
        result: assessment,
      },
      { onConflict: "session_id" }
    );

    if (rErr) return jsonErr("QUIZ_RESULT_WRITE_FAILED", "Could not store quiz result.", 500, rErr);

    // ---- Claim cookie + hash storage (supports both new + legacy schemas) ----
    const claimToken = makeClaimToken();
    const claimHash = sha256Hex(claimToken);
    const nowIso = new Date().toISOString();

    // Try claim_token_hash first; fall back to claim_token if column not present
    const { error: hashErr } = await admin
      .from("quiz_sessions")
      .update({
        claim_token_hash: claimHash,
        claim_token_created_at: nowIso,
        claim_token: null,
      } as any)
      .eq("id", session_id)
      .is("claimed_at", null);

    if (hashErr && isUndefinedColumn(hashErr)) {
      // Legacy fallback: store raw token in claim_token
      await admin
        .from("quiz_sessions")
        .update({ claim_token: claimToken } as any)
        .eq("id", session_id)
        .is("claimed_at", null);
    }

    const res = jsonOk({ session_id, assessment }, 200);

    res.cookies.set({
      name: CLAIM_COOKIE,
      value: claimToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: CLAIM_COOKIE_MAX_AGE,
    });

    return res;
  } catch (e: any) {
    return jsonErr("UNHANDLED", e?.message || "Unknown error", 500);
  }
}
