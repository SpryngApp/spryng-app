// modules/reports/api/get.ts
"use server";

import { supabaseAdmin } from "@/lib/supabase/server";

/* ---------- Types for view rows (adjust if your views differ) ---------- */

export type CheckRegisterRow = {
  id: string;
  company_id: string;
  posted_at: string | null;
  amount: number | null;
  description_raw: string | null;
  direction: "debit" | "credit";
  currency: string | null;
  category?: string | null;
};

export type Summary1099Row = {
  company_id: string;
  payee_id: string;
  display_name: string | null;
  total_outgoing: number; // expected aggregated amount
};

export type QuarterlyWageRow = {
  id?: string;
  company_id: string;
  transaction_id: string;
  state: string | null;
  quarter: string | null; // e.g., "2025Q4"
  reason: string | null;
  status: "pending" | "reviewed" | "ignored" | string;
  created_at?: string;
};

/* ------------------------- Util: input validation ---------------------- */

function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v)
  );
}

/* ----------------------- Generic view fetch helper --------------------- */

async function fromView<T>(
  view: string,
  companyId: string,
  limit = 500
): Promise<{ data: T[]; error?: string }> {
  if (!isUuid(companyId)) {
    return { data: [], error: "Invalid companyId (uuid required)." };
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from(view)
    .select("*")
    .eq("company_id", companyId)
    .limit(Math.max(1, Math.min(limit, 5000))); // hard cap to avoid huge payloads

  if (error) return { data: [], error: error.message };
  return { data: (data as T[]) ?? [] };
}

/* ----------------------------- API exports ----------------------------- */

export async function getCheckRegister(
  companyId: string,
  opts?: { limit?: number }
): Promise<{ data: CheckRegisterRow[]; error?: string }> {
  return fromView<CheckRegisterRow>("v_check_register", companyId, opts?.limit ?? 500);
}

export async function get1099Summary(
  companyId: string,
  opts?: { limit?: number }
): Promise<{ data: Summary1099Row[]; error?: string }> {
  return fromView<Summary1099Row>("v_1099_summary", companyId, opts?.limit ?? 500);
}

export async function getQuarterlyWages(
  companyId: string,
  opts?: { limit?: number }
): Promise<{ data: QuarterlyWageRow[]; error?: string }> {
  return fromView<QuarterlyWageRow>("v_quarterly_wages", companyId, opts?.limit ?? 500);
}
