// modules/transactions/lib/rpc.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

export type UpsertTransactionParams = {
  companyId: string;          // uuid
  posted: string;             // YYYY-MM-DD
  amount: number;             // positive for credits? we pass raw; your RPC/DB derives direction
  description: string;
  type?: string | null;       // optional bank "type" or direction hint
  counterparty?: string | null;
  currency?: string | null;   // defaults to "USD"
  accountId?: string | null;  // future use; defaults null
  source?: string | null;     // e.g., "csv", "manual"; defaults "csv"
};

function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v)
  );
}

function isYmd(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

function clampText(v: unknown, max = 500): string {
  return String(v ?? "").trim().slice(0, max);
}

export async function upsertTransaction(params: UpsertTransactionParams): Promise<{
  ok: boolean;
  error?: string;
}> {
  const {
    companyId,
    posted,
    amount,
    description,
    type = null,
    counterparty = null,
    currency = "USD",
    accountId = null,
    source = "csv",
  } = params;

  // -------- input validation ----------
  if (!isUuid(companyId)) {
    return { ok: false, error: "Invalid companyId (uuid required)." };
  }
  if (!isYmd(posted)) {
    return { ok: false, error: 'Invalid posted date. Use "YYYY-MM-DD".' };
  }
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return { ok: false, error: "Invalid amount (finite number required)." };
  }
  const desc = clampText(description, 500);
  if (!desc) {
    return { ok: false, error: "Description is required." };
  }
  const ccy = clampText(currency || "USD", 8) || "USD";
  const ctr = counterparty ? clampText(counterparty, 200) : null;
  const tp = type ? clampText(type, 50) : null;
  const src = clampText(source || "csv", 32);

  try {
    const db = supabaseAdmin;

    const { error } = await db.rpc("upsert_transaction", {
      p_company_id: companyId,
      p_account_id: accountId,          // null is okay
      p_source: src,                    // "csv" | "manual" | "api"
      p_posted: posted,                 // YYYY-MM-DD
      p_amount: amount,                 // your SQL handles direction/normalization
      p_description_raw: desc,
      p_type: tp,                       // optional
      p_counterparty_raw: ctr,          // optional
      p_currency: ccy as any,           // text in DB; cast keeps TS happy
    });

    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Unexpected error calling upsert_transaction" };
  }
}
