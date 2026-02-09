import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Body = {
  companyId: string;
  transactionId: string;
  name: string; // Payee display name
  kind?: "individual" | "business";
  serviceProvided?: string | null;
};

function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v)
  );
}

function cleanText(v: unknown, max = 200): string {
  const s = String(v ?? "").trim();
  return s.slice(0, max);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const companyId = body?.companyId;
    const transactionId = body?.transactionId;
    const rawName = body?.name;
    const kind = (body?.kind === "business" ? "business" : "individual") as "individual" | "business";
    const serviceProvided = body?.serviceProvided ?? null;

    // ---- Validation ----
    if (!isUuid(companyId)) {
      return NextResponse.json({ ok: false, error: "Valid companyId (uuid) is required." }, { status: 400 });
    }
    if (!isUuid(transactionId)) {
      return NextResponse.json({ ok: false, error: "Valid transactionId (uuid) is required." }, { status: 400 });
    }
    const name = cleanText(rawName, 200);
    if (!name) {
      return NextResponse.json({ ok: false, error: "Payee name is required." }, { status: 400 });
    }

    const db = supabaseAdmin;


    // ---- Find existing payee by company + (name OR display_name) (case-insensitive exact match) ----
    const { data: existingCandidates, error: findErr } = await db
      .from("payees")
      .select("id, name, display_name")
      .eq("company_id", companyId)
      .or(`name.ilike.${name},display_name.ilike.${name}`)
      .limit(1);

    if (findErr) {
      return NextResponse.json({ ok: false, error: findErr.message }, { status: 400 });
    }

    let payeeId: string | null = existingCandidates?.[0]?.id ?? null;

    // ---- Create payee if not found ----
    if (!payeeId) {
      const insertPayload: any = {
        company_id: companyId,
        kind,
        notes: serviceProvided ?? null, // if your schema has 'notes'
        name, // write both if both columns exist; harmless if only one exists
        display_name: name,
      };

      const { data: inserted, error: insertErr } = await db
        .from("payees")
        .insert(insertPayload)
        .select("id")
        .single();

      if (insertErr) {
        return NextResponse.json({ ok: false, error: insertErr.message }, { status: 400 });
      }
      payeeId = inserted!.id;
    }

    // ---- Link payee to transaction (idempotent upsert) ----
    // Requires a UNIQUE or PK constraint on (transaction_id, payee_id) in transaction_payees.
    const { error: linkErr } = await db
      .from("transaction_payees")
      .upsert(
        { transaction_id: transactionId, payee_id: payeeId },
        { onConflict: "transaction_id,payee_id", ignoreDuplicates: true }
      );

    if (linkErr) {
      return NextResponse.json({ ok: false, error: linkErr.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, payeeId });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
