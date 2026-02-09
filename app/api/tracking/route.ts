// app/api/tracking/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type PostgrestError } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonOk(data: unknown, status = 200) {
  const payload =
    data && typeof data === "object" && !Array.isArray(data) ? data : { data };
  return NextResponse.json({ ok: true, ...(payload as any) }, { status });
}

function jsonErr(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, details } }, { status });
}

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return { url, anonKey, serviceKey };
}

function toStr(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function clampInt(v: unknown, def: number, min: number, max: number) {
  const n = Number(v);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function parseMoneyToCents(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) {
    if (v < 0) return null;
    return Math.round(v * 100);
  }
  const s = toStr(v);
  if (!s) return null;

  // tolerate "$1,234.56"
  const cleaned = s.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function parseDateOnly(v: unknown): string | null {
  const s = toStr(v);
  if (!s) return null;

  // accept YYYY-MM-DD or ISO strings; store as YYYY-MM-DD
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;

  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function escapeCsv(value: unknown): string {
  const s = value == null ? "" : String(value);
  // wrap if contains comma/quote/newline
  if (/[,"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function getAuthedUserAndWorkspace() {
  const cookieStore = await cookies();
  const { url, anonKey, serviceKey } = getEnv();

  const cookieJar: Array<{ name: string; value: string; options?: any }> = [];

  const supabaseAuth = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookieJar.push(...cookiesToSet);
      },
    },
  });

  const {
    data: { user },
    error: userErr,
  } = await supabaseAuth.auth.getUser();

  if (userErr || !user) {
    return { ok: false as const, cookieJar, error: userErr };
  }

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data: profile, error: profErr } = await admin
    .from("profiles")
    .select("active_workspace_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profErr) {
    return { ok: false as const, cookieJar, error: profErr };
  }

  const workspace_id = (profile?.active_workspace_id as string | null) ?? null;
  if (!workspace_id) {
    return { ok: true as const, cookieJar, user, admin, workspace_id: null as any };
  }

  // verify membership
  const { data: member, error: memErr } = await admin
    .from("workspace_members")
    .select("role,status")
    .eq("workspace_id", workspace_id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (memErr) return { ok: false as const, cookieJar, error: memErr };
  if (!member) return { ok: false as const, cookieJar, error: { code: "FORBIDDEN", message: "Not a member" } };

  // employer (optional but used for inserts)
  const { data: employer } = await admin
    .from("employers")
    .select("id")
    .eq("workspace_id", workspace_id)
    .maybeSingle();

  return {
    ok: true as const,
    cookieJar,
    user,
    admin,
    workspace_id,
    employer_id: (employer?.id as string | null) ?? null,
  };
}

export async function GET(req: Request) {
  const auth = await getAuthedUserAndWorkspace();

  if (!auth.ok) {
    const res = jsonErr("NOT_AUTHENTICATED", "You must be signed in.", 401, (auth as any).error);
    auth.cookieJar?.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return res;
  }

  if (!auth.workspace_id) {
    const res = jsonErr("NO_WORKSPACE", "Complete onboarding first.", 409);
    auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return res;
  }

  const url = new URL(req.url);
  const format = toStr(url.searchParams.get("format")).toLowerCase();

  const limit = clampInt(url.searchParams.get("limit"), 100, 1, 500);
  const cursor = toStr(url.searchParams.get("cursor")) || null; // created_at cursor

  let q = auth.admin
    .from("outside_payroll_entries")
    .select(
      "id,workspace_id,employer_id,payee_name,payee_type,purpose,payment_method,amount_cents,currency,paid_at,proof_url,notes,created_by,created_at,updated_at"
    )
    .eq("workspace_id", auth.workspace_id)
    .order("paid_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (cursor) q = q.lt("created_at", cursor);

  // For CSV exports, allow a bigger pull (still bounded)
  const effectiveLimit = format === "csv" ? 5000 : limit;
  q = q.limit(effectiveLimit);

  const { data: rows, error } = await q;
  if (error) {
    const res = jsonErr("READ_FAILED", "Could not load entries.", 500, error);
    auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return res;
  }

  if (format === "csv") {
    const header = [
      "paid_at",
      "payee_name",
      "payee_type",
      "purpose",
      "payment_method",
      "amount",
      "currency",
      "proof_url",
      "notes",
      "created_at",
    ];

    const lines = [header.join(",")];

    for (const r of rows ?? []) {
      const amount = typeof r.amount_cents === "number" ? (r.amount_cents / 100).toFixed(2) : "";
      lines.push(
        [
          escapeCsv(r.paid_at),
          escapeCsv(r.payee_name),
          escapeCsv(r.payee_type),
          escapeCsv(r.purpose),
          escapeCsv(r.payment_method),
          escapeCsv(amount),
          escapeCsv(r.currency),
          escapeCsv(r.proof_url),
          escapeCsv(r.notes),
          escapeCsv(r.created_at),
        ].join(",")
      );
    }

    const csv = lines.join("\n");
    const res = new NextResponse(csv, {
      status: 200,
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="outside-payroll-tracking.csv"`,
        "cache-control": "no-store",
      },
    });

    auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return res;
  }

  const next_cursor = rows && rows.length ? (rows[rows.length - 1].created_at as string) : null;

  const res = jsonOk({ entries: rows ?? [], next_cursor }, 200);
  auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
  return res;
}

export async function POST(req: Request) {
  const auth = await getAuthedUserAndWorkspace();

  if (!auth.ok) {
    const res = jsonErr("NOT_AUTHENTICATED", "You must be signed in.", 401, (auth as any).error);
    auth.cookieJar?.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return res;
  }

  if (!auth.workspace_id) {
    const res = jsonErr("NO_WORKSPACE", "Complete onboarding first.", 409);
    auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return res;
  }

  try {
    const body = (await req.json()) as Record<string, unknown>;

    const payee_name = toStr(body.payee_name);
    if (!payee_name || payee_name.length < 2) {
      const res = jsonErr("BAD_INPUT", "Payee name is required.", 400);
      auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return res;
    }

    const paid_at = parseDateOnly(body.paid_at) ?? parseDateOnly(new Date().toISOString());
    if (!paid_at) {
      const res = jsonErr("BAD_INPUT", "paid_at must be a valid date.", 400);
      auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return res;
    }

    const amount_cents = parseMoneyToCents(body.amount);
    if (amount_cents == null) {
      const res = jsonErr("BAD_INPUT", "amount must be a valid number (e.g., 250 or 250.00).", 400);
      auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return res;
    }

    const payee_type = toStr(body.payee_type) || null;
    const purpose = toStr(body.purpose) || null;
    const payment_method = toStr(body.payment_method) || null;
    const proof_url = toStr(body.proof_url) || null;
    const notes = toStr(body.notes) || null;

    const { data: inserted, error: insErr } = await auth.admin
      .from("outside_payroll_entries")
      .insert({
        workspace_id: auth.workspace_id,
        employer_id: auth.employer_id ?? null,
        payee_name,
        payee_type,
        purpose,
        payment_method,
        amount_cents,
        currency: "USD",
        paid_at,
        proof_url,
        notes,
        created_by: auth.user.id,
      })
      .select(
        "id,workspace_id,employer_id,payee_name,payee_type,purpose,payment_method,amount_cents,currency,paid_at,proof_url,notes,created_by,created_at,updated_at"
      )
      .single();

    if (insErr) {
      const res = jsonErr("INSERT_FAILED", "Could not create entry.", 500, insErr);
      auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
      return res;
    }

    const res = jsonOk({ entry: inserted }, 200);
    auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return res;
  } catch (e: any) {
    const res = jsonErr("UNHANDLED", e?.message || "Unknown error", 500);
    auth.cookieJar.forEach((c) => res.cookies.set(c.name, c.value, c.options));
    return res;
  }
}
