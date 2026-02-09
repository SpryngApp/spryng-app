import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Body = {
  companyId: string;
  fileName: string;
  fileBase64: string; // base64 of the CSV file
};

function isUuid(v: unknown): v is string {
  return (
    typeof v === "string" &&
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v)
  );
}

function sanitizeFileName(name: string): string {
  const base = (name || "upload.csv").replace(/[/\\]+/g, " ").trim();
  const cleaned = base.replace(/[^a-zA-Z0-9._ -]/g, "");
  return cleaned || "upload.csv";
}

function normalizeDate(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = String(s).trim();
  if (!t) return null;
  // Accept common forms: YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(t)) {
    const [a, b, c] = t.split("/");
    const mm = a.padStart(2, "0");
    const dd = b.padStart(2, "0");
    const yyyy = c.length === 2 ? `20${c}` : c;
    return `${yyyy}-${mm}-${dd}`;
  }
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseMoney(input: any): number | null {
  if (input == null) return null;
  let s = String(input).trim();
  if (!s) return null;
  // Handle parentheses for negatives and remove currency/commas
  const negative = /^\(.*\)$/.test(s);
  s = s.replace(/[\$,]/g, "");
  s = s.replace(/^\((.*)\)$/, "$1");
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return negative ? -Math.abs(n) : n;
}

/**
 * Minimal RFC4180-ish CSV parser.
 * - Handles quotes and escaped quotes
 * - Returns objects keyed by header names (original headers)
 * - Trims CRLF; ignores empty trailing lines
 */
function parseCSVBuffer(buf: Buffer): { headers: string[]; rows: Record<string, string>[] } {
  const text = buf.toString("utf8").replace(/\uFEFF/g, ""); // strip UTF-8 BOM if present
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  // Drop any extra blank lines at the end
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!lines.length) return { headers: [], rows: [] };

  const headers = splitCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const cols = splitCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (cols[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return { headers, rows };
}

function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }
  out.push(cur);
  return out;
}

// Map common header labels to normalized keys used by RPC args
function pick(row: Record<string, string>, choices: string[]): string | null {
  for (const c of choices) {
    if (row[c] != null && row[c] !== "") return row[c];
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const companyId = body?.companyId;
    const fileName = sanitizeFileName(body?.fileName || "");
    const fileBase64 = body?.fileBase64;

    if (!isUuid(companyId)) {
      return NextResponse.json({ ok: false, error: "Valid companyId (uuid) is required." }, { status: 400 });
    }
    if (!fileBase64 || typeof fileBase64 !== "string") {
      return NextResponse.json({ ok: false, error: "fileBase64 is required (base64 string)." }, { status: 400 });
    }

    // Basic size guard (e.g., 15 MB)
    const buf = Buffer.from(fileBase64, "base64");
    const MAX = 15 * 1024 * 1024;
    if (buf.byteLength > MAX) {
      return NextResponse.json({ ok: false, error: "CSV too large. Max 15MB." }, { status: 413 });
    }

    // Parse CSV
    const { headers, rows } = parseCSVBuffer(buf);
    if (!headers.length || !rows.length) {
      return NextResponse.json({ ok: false, error: "CSV appears empty or malformed." }, { status: 400 });
    }

    const db = supabaseAdmin;

    // Upload original CSV to storage for audit trail
    const bucket = process.env.NEXT_PUBLIC_DOCS_BUCKET;
    if (!bucket) {
      return NextResponse.json({ ok: false, error: "NEXT_PUBLIC_DOCS_BUCKET not configured." }, { status: 500 });
    }

    const storagePath = `companies/${companyId}/uploads/${Date.now()}-${fileName}`;
    const { error: uploadErr } = await db.storage
      .from(bucket)
      .upload(storagePath, buf, { contentType: "text/csv", upsert: true });

    if (uploadErr) {
      return NextResponse.json({ ok: false, error: `Upload failed: ${uploadErr.message}` }, { status: 500 });
    }

    // Iterate and upsert transactions
    let inserted = 0;
    let failed = 0;
    const sampleErrors: string[] = [];

    for (const r of rows) {
      // Normalize by popular header aliases
      const date = pick(r, ["date", "posted_at", "transaction_date"]);
      const desc = pick(r, ["description", "memo", "name", "raw_description"]);
      const amountRaw = pick(r, ["amount", "amt", "value"]);
      const type = pick(r, ["type", "direction", "drcr", "debit/credit"]) || null;
      const counterparty = pick(r, ["counterparty", "payee", "name", "to", "from"]);
      const currency = pick(r, ["currency", "curr", "ccy"]) || "USD";

      const posted = normalizeDate(date);
      const amount = parseMoney(amountRaw);

      if (!posted || amount == null || !desc) {
        failed++;
        if (sampleErrors.length < 5) {
          sampleErrors.push(
            `Skipped row (${JSON.stringify({
              date,
              desc,
              amountRaw,
            })}) — required fields invalid.`
          );
        }
        continue;
      }

      const { error } = await db.rpc("upsert_transaction", {
        p_company_id: companyId,
        p_account_id: null, // optional; wire later if you have bank accounts
        p_source: "csv",
        p_posted: posted,
        p_amount: amount,
        p_description_raw: desc,
        p_type: type,
        p_counterparty_raw: counterparty,
        p_currency: currency as any,
      });

      if (error) {
        failed++;
        if (sampleErrors.length < 5) sampleErrors.push(error.message);
      } else {
        inserted++;
      }
    }

    return NextResponse.json({
      ok: true,
      storagePath,
      totalRows: rows.length,
      inserted,
      failed,
      sampleErrors,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unexpected error processing CSV." },
      { status: 400 }
    );
  }
}
