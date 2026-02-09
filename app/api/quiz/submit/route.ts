import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Expecting:
    // {
    //   companyId: string (uuid),
    //   answers: {
    //     state: string,
    //     paysIndividuals: "yes"|"no",
    //     servicesYouProvide: string[],
    //     servicesYouPayFor: string[],
    //     totalPaid90d: number,
    //     numHelpers: number,
    //     usesContracts: "always"|"sometimes"|"never",
    //     hasW9s: "all"|"some"|"none"
    //   }
    // }

    const db = supabaseAdmin;
    const a = body.answers ?? {};
    const { data, error } = await db.rpc("submit_readiness_assessment", {
      p_company: body.companyId,
      p_state: a.state ?? null,
      p_pays_individuals: (a.paysIndividuals === "yes"),
      p_services_you_provide: a.servicesYouProvide ?? [],
      p_services_you_pay_for: a.servicesYouPayFor ?? [],
      p_total_paid_90d: a.totalPaid90d ?? 0,
      p_num_helpers: a.numHelpers ?? 0,
      p_uses_contracts: a.usesContracts ?? null,
      p_has_w9s: a.hasW9s ?? null,
      p_answers: a
    });

    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true, assessmentId: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
