import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Body = {
  companyId: string;
  payeeId?: string | null;
  docType?: string | null;
  fileName: string;
};

function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[1-5][0-9a-fA-F-]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
}

function sanitizeFileName(name: string): string {
  // Remove path separators and trim; keep basic ascii, dot, dash, underscore, space
  const base = name.replace(/[/\\]+/g, " ").trim();
  const cleaned = base.replace(/[^a-zA-Z0-9._ -]/g, "");
  return cleaned || "document";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const companyId = body?.companyId;
    const payeeId = body?.payeeId ?? null;
    const docType = (body?.docType ?? "general").toLowerCase();
    const fileName = sanitizeFileName(body?.fileName || "");

    if (!isUuid(companyId)) {
      return NextResponse.json({ ok: false, error: "Valid companyId (uuid) is required." }, { status: 400 });
    }
    if (payeeId !== null && !isUuid(payeeId)) {
      return NextResponse.json({ ok: false, error: "payeeId must be a uuid or null." }, { status: 400 });
    }
    if (!fileName) {
      return NextResponse.json({ ok: false, error: "fileName is required." }, { status: 400 });
    }

    const bucket = process.env.NEXT_PUBLIC_DOCS_BUCKET;
    if (!bucket) {
      return NextResponse.json({ ok: false, error: "Storage bucket env (NEXT_PUBLIC_DOCS_BUCKET) not set." }, { status: 500 });
    }

    // Generate a stable document id and path
    const docId = (globalThis.crypto?.randomUUID?.() as string) || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const storagePath = `companies/${companyId}/docs/${docType}/${docId}-${fileName}`;

    const db = supabaseAdmin();

    // Create DB record first so path is tracked even if upload happens shortly after
    const { data: inserted, error: insertErr } = await db
      .from("documents")
      .insert({
        id: docId,
        company_id: companyId,
        payee_id: payeeId,
        doc_type: docType,
        storage_path: storagePath,
        original_name: fileName, // if column exists; safe to ignore if not in schema
      } as any)
      .select("id, storage_path")
      .single();

    if (insertErr) {
      return NextResponse.json({ ok: false, error: insertErr.message }, { status: 400 });
    }

    // Create a signed upload URL for client-side PUT
    const { data: urlData, error: urlErr } = await db.storage.from(bucket).createSignedUploadUrl(storagePath);
    if (urlErr || !urlData?.signedUrl) {
      return NextResponse.json(
        { ok: false, error: urlErr?.message || "Failed to create signed upload URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      documentId: inserted.id,
      path: storagePath,
      uploadUrl: urlData.signedUrl,
      token: (urlData as any).token ?? null, // some clients want this for multipart libs; harmless to include
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unexpected error" }, { status: 400 });
  }
}
