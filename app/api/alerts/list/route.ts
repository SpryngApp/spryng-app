import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic"; // don't cache
export const revalidate = 0;

function isUuid(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-fA-F-]{36}$/.test(v);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const companyId = body?.companyId;

    if (!isUuid(companyId)) {
      return NextResponse.json(
        { ok: false, error: "Valid companyId (uuid) is required." },
        { status: 400 }
      );
    }

    const db = supabaseAdmin();

    const { data, error } = await db
      .from("alerts")
      .select(
        "id, company_id, kind, title, body, severity, related_transaction_id, created_at"
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, alerts: data ?? [] });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
