// app/api/quiz/config/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  buildSpryngPostStateQuestions,
  SPRYNG_QUIZ_V2_VERSION,
  type SpryngQuizConfigHints,
} from "@/lib/quiz/spryngQuizV2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonOk(data: any, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}
function jsonErr(message: string, status = 400, details?: any) {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}

function normalizeStateParam(s: string | null) {
  if (!s) return null;
  const t = s.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(t)) return null;
  return t;
}

type UiLiability = {
  general?: any;
  domestic?: any;
  agricultural?: any;
  nonprofit?: any;
};

function pickPeriod(x: any): "quarter" | "year" | null {
  const p = x?.wage_threshold?.period;
  if (p === "quarter") return "quarter";
  if (p === "year") return "year";
  return null;
}

function hasWeeksThreshold(x: any): boolean {
  const wt = x?.weeks_threshold;
  if (!wt) return false;
  // Common shapes in your dataset: { weeks: number|null, unit: ... }
  if (typeof wt?.weeks === "number") return true;
  if (wt?.unit === "weeks") return true;
  return false;
}

export async function GET(req: Request) {
  try {
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return jsonErr("Server is missing Supabase env vars.", 500);
    }

    const { searchParams } = new URL(req.url);
    const state = normalizeStateParam(searchParams.get("state"));
    if (!state) return jsonErr("Invalid state param. Expected ?state=CA", 400);

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    // Read minimal columns needed to decide which questions to ask.
    // (No thresholds returned to client; this is server-only logic.)
    const { data, error } = await supabase
      .from("state_registration_rules")
      .select("state_code,state_name,status,ui_liability")
      .eq("state_code", state)
      .maybeSingle();

    if (error) return jsonErr("Failed to load state rules.", 500, error);
    if (!data) {
      // Still return a usable config, but mark coverage missing.
      const fallbackHints: SpryngQuizConfigHints = {
        state_code: state,
        state_name: state,
        state_rules_status: "missing",
        amount_timeframe_mode: "ask",
        fixed_amount_timeframe: null,
        needs_weeks_question: true,
      };

      return jsonOk({
        quiz_version: SPRYNG_QUIZ_V2_VERSION,
        hints: fallbackHints,
        questions: buildSpryngPostStateQuestions(fallbackHints),
      });
    }

    const ui: UiLiability = (data.ui_liability ?? {}) as UiLiability;

    const periodGeneral = pickPeriod(ui.general);
    const periodDomestic = pickPeriod(ui.domestic);
    const periodAg = pickPeriod(ui.agricultural);
    const periodNp = pickPeriod(ui.nonprofit);

    const periods = new Set<string>();
    for (const p of [periodGeneral, periodDomestic, periodAg, periodNp]) {
      if (p) periods.add(p);
    }

    const needsWeeks =
      hasWeeksThreshold(ui.general) ||
      hasWeeksThreshold(ui.domestic) ||
      hasWeeksThreshold(ui.agricultural) ||
      hasWeeksThreshold(ui.nonprofit);

    // If exactly one period is used across categories, we can skip asking timeframe.
    // Otherwise, we ask timeframe (still not exposing thresholds).
    const amountMode: "fixed" | "ask" = periods.size === 1 ? "fixed" : "ask";
    const fixed = amountMode === "fixed" ? ([...periods][0] as "quarter" | "year") : null;

    const hints: SpryngQuizConfigHints = {
      state_code: data.state_code,
      state_name: data.state_name,
      state_rules_status: (data.status ?? "missing") as any,
      amount_timeframe_mode: amountMode,
      fixed_amount_timeframe: fixed,
      needs_weeks_question: needsWeeks,
    };

    return jsonOk({
      quiz_version: SPRYNG_QUIZ_V2_VERSION,
      hints,
      questions: buildSpryngPostStateQuestions(hints),
    });
  } catch (e: any) {
    return jsonErr("Unexpected error building quiz config.", 500, e?.message);
  }
}
