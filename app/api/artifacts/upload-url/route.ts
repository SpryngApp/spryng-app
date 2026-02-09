import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { resolveActiveWorkspaceId, resolveEmployerIdForWorkspace } from "@/lib/workspace/active";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Payload = {
  step_key: string;
  file_name: string;
  mime_type: string;
  size_bytes?: number;
  category?: "registration_proof" | "notice" | "report_proof" | "other";
};

function ok(data: unknown, status = 200) {
  return NextResponse.json({ ok: true, data, error: null }, { status });
}
function err(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, data: null, error: { code, message, details } }, { status });
}

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-()+\s]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
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

  if (!body.step_key) return err("VALIDATION", "step_key is required.", 422);
  if (!body.file_name) return err("VALIDATION", "file_name is required.", 422);
  if (!body.mime_type) return err("VALIDATION", "mime_type is required.", 422);

  const workspaceId = await resolveActiveWorkspaceId(supabase, auth.user.id);
  const employerId = await resolveEmployerIdForWorkspace(supabase, workspaceId);

  // Admin client for Storage signed URLs (do NOT use in client)
  const admin = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } }
  );

  const bucket = "workspace-files";
  const safeName = sanitizeFileName(body.file_name);
  const id = crypto.randomUUID();
  const path = `${workspaceId}/registration/${body.step_key}/${id}-${safeName}`;

  const { data, error } = await admin.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data) return err("SIGNED_UPLOAD_FAILED", error?.message ?? "Could not create upload URL.", 400, error);

  // We return token so client can call uploadToSignedUrl
  return ok(
    {
      bucket,
      path,
      token: data.token,
      employer_id: employerId,
      workspace_id: workspaceId,
      category: body.category ?? "registration_proof",
      step_key: body.step_key,
      file_name: safeName,
      mime_type: body.mime_type,
      size_bytes: body.size_bytes ?? null,
    },
    200
  );
}
