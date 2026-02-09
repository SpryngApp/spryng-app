import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { resolveActiveWorkspaceId, resolveEmployerIdForWorkspace } from "@/lib/workspace/active";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Payload = {
  storage_bucket: string;
  storage_path: string;
  step_key?: string | null;
  category?: "registration_proof" | "notice" | "report_proof" | "other";
  file_name?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
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

  if (!body.storage_bucket || !body.storage_path) {
    return err("VALIDATION", "storage_bucket and storage_path are required.", 422);
  }

  const workspaceId = await resolveActiveWorkspaceId(supabase, auth.user.id);
  const employerId = await resolveEmployerIdForWorkspace(supabase, workspaceId);

  const { data, error } = await supabase
    .from("workspace_artifacts")
    .insert({
      workspace_id: workspaceId,
      employer_id: employerId,
      category: body.category ?? "registration_proof",
      step_key: body.step_key ?? null,
      storage_bucket: body.storage_bucket,
      storage_path: body.storage_path,
      file_name: body.file_name ?? null,
      mime_type: body.mime_type ?? null,
      size_bytes: body.size_bytes ?? null,
    })
    .select("*")
    .single();

  if (error) return err("DB_INSERT_FAILED", error.message, 400, error);
  return ok(data, 200);
}