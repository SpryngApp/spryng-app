import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import {
  resolveActiveWorkspaceId,
  resolveEmployerIdForWorkspace,
  resolveEmployerStateForWorkspace,
} from "@/lib/workspace/active";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Payload = {
  status: "not_started" | "in_progress" | "submitted" | "completed" | "blocked";
  current_step_key?: string | null;
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

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return err("BAD_JSON", "Invalid request body.", 400);
  }

  const workspaceId = await resolveActiveWorkspaceId(supabase, auth.user.id);
  const employerId = await resolveEmployerIdForWorkspace(supabase, workspaceId);
  const stateCode = await resolveEmployerStateForWorkspace(supabase, workspaceId);

  const payload = {
    workspace_id: workspaceId,
    employer_id: employerId,
    state_code: stateCode,
    status: body.status,
    current_step_key: body.current_step_key ?? null,
  };

  const { data, error } = await supabase
    .from("employer_registration_cases")
    .upsert(payload, { onConflict: "workspace_id" })
    .select("*")
    .single();

  if (error) return err("DB_UPSERT_FAILED", error.message, 400, error);
  return ok(data, 200);
}
