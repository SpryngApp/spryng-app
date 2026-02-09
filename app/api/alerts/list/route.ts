import { NextResponse } from "next/server";
import { z } from "zod";

import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic"; // don't cache
export const revalidate = 0;

const BodySchema = z.object({
  companyId: z.string().uuid(),
});

type AlertRow = {
  id: string;
  company_id: string;
  kind: string | null;
  title: string | null;
  body: string | null;
  severity: string | null;
  related_transaction_id: string | null;
  created_at: string;
};

export async function POST(req: Request) {
  try {
    const raw = (await req.json().catch(() => ({}))) as unknown;
    const parsed = BodySchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Valid companyId (uuid) is required." },
        { status: 400 }
      );
    }

    const { companyId } = parsed.data;

    // NOTE: supabaseAdmin is a SupabaseClient (NOT a function)
    const { data, error } = await supabaseAdmin
      .from("alerts")
      .select(
        "id, company_id, kind, title, body, severity, related_transaction_id, created_at"
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, alerts: (data ?? []) as AlertRow[] });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unexpected error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
