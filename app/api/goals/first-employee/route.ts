import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { resolveActiveWorkspaceId } from "@/lib/workspace/active";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type GoalPayload = {
  target_month: string; // YYYY-MM-01 (we store first of month)
  target_role?: string | null;
  industry?: string | null;
  monthly_revenue_range?: string | null;
  owner_hours_range?: string | null;
  help_focus?: string | null;
  inputs?: Record<string, unknown> | null;
};

function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data, error: null }, { status });
}
function err(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, data: null, error: { code, message, details } }, { status });
}

export async function POST(req: Request) {
  const supabase = await createSupabaseRouteClient();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) return err("UNAUTHENTICATED", "Please sign in.", 401);

  let body: GoalPayload;
  try {
    body = (await req.json()) as GoalPayload;
  } catch {
    return err("BAD_JSON", "Invalid request body.", 400);
  }

  if (!body.target_month || !/^\d{4}-\d{2}-\d{2}$/.test(body.target_month)) {
    return err("VALIDATION", "target_month must be an ISO date like YYYY-MM-01.", 422);
  }

  // Normalize: store the first day of the month (safe even if user sends another day)
  const dt = new Date(body.target_month + "T00:00:00Z");
  if (Number.isNaN(dt.getTime())) return err("VALIDATION", "target_month is not a valid date.", 422);
  const normalized = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), 1))
    .toISOString()
    .slice(0, 10);

  const workspaceId = await resolveActiveWorkspaceId(supabase, auth.user.id);

  const payload = {
    workspace_id: workspaceId,
    type: "first_employee",
    target_month: normalized,
    target_role: body.target_role ?? null,
    industry: body.industry ?? null,
    monthly_revenue_range: body.monthly_revenue_range ?? null,
    owner_hours_range: body.owner_hours_range ?? null,
    help_focus: body.help_focus ?? null,
    inputs: body.inputs ?? null,
  };

  const { data, error } = await supabase
    .from("workspace_goals")
    .upsert(payload, { onConflict: "workspace_id,type" })
    .select("*")
    .single();

  if (error) return err("DB_UPSERT_FAILED", error.message, 400, error);

  return ok(data, 200);
}

export async function GET() {
  const supabase = await createSupabaseRouteClient();
  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) return err("UNAUTHENTICATED", "Please sign in.", 401);

  const workspaceId = await resolveActiveWorkspaceId(supabase, auth.user.id);

  const { data, error } = await supabase
    .from("workspace_goals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("type", "first_employee")
    .maybeSingle();

  if (error) return err("DB_READ_FAILED", error.message, 400, error);
  return ok(data ?? null);
}
