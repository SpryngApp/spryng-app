// app/api/documents/getUploadUrl/route.ts
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

type InsertedDoc = {
  id: string;
  storage_path: string;
};

function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      v
    )
  );
}

function sanitizeFileName(name: string): string {
  // Remove path separators and trim; keep basic ascii, dot, dash, underscore, space
  const base = String(name ?? "").replace(/[/\\]+/g, " ").trim();
  const cleaned = base.replace(/[^a-zA-Z0-9._ -]/g, "");
  return cleaned || "document";
}

function safeRandomId() {
  // Node 18+ has global crypto.randomUUID; fallback just in case
  const ru = globalThis.crypto?.randomUUID?.bind(globalThis.crypto);
  return typeof ru === "function"
    ? ru()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const companyId = body?.companyId;
    const payeeId = body?.payeeId ?? null;
    const docTypeRaw = (body?.docType ?? "general").toString().trim();
    const docType = docTypeRaw ? docTypeRaw.toLowerCase() : "general";
    const fileName = sanitizeFileName(body?.fileName);

    if (!isUuid(companyId)) {
      return NextResponse.json(
        { ok: false, error: "Valid companyId (uuid) is required." },
        { status: 400 }
      );
    }
    if (payeeId !== null && !isUuid(payeeId)) {
      return NextResponse.json(
        { ok: false, error: "payeeId must be a uuid or null." },
        { status: 400 }
      );
    }
    if (!fileName) {
      return NextResponse.json(
        { ok: false, error: "fileName is required." },
        { status: 400 }
      );
    }

    const bucket = process.env.NEXT_PUBLIC_DOCS_BUCKET;
    if (!bucket) {
      return NextResponse.json(
        { ok: false, error: "Storage bucket env (NEXT_PUBLIC_DOCS_BUCKET) not set." },
        { status: 500 }
      );
    }

    const docId = safeRandomId();
    const storagePath = `companies/${companyId}/docs/${docType}/${docId}-${fileName}`;

    // ✅ supabaseAdmin is a client, NOT a function
    const db = supabaseAdmin;

    // Create DB record first so path is tracked even if upload happens shortly after
    const { data: inserted, error: insertErr } = await db
      .from("documents")
      .insert({
        id: docId,
        company_id: companyId,
        payee_id: payeeId,
        doc_type: docType,
        storage_path: storagePath,
        original_name: fileName,
      })
      .select("id, storage_path")
      .single<InsertedDoc>();

    if (insertErr) {
      return NextResponse.json(
        { ok: false, error: insertErr.message },
        { status: 400 }
      );
    }

    const { data: urlData, error: urlErr } = await db.storage
      .from(bucket)
      .createSignedUploadUrl(storagePath);

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
      token: "token" in urlData ? (urlData as { token?: string }).token ?? null : null,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
