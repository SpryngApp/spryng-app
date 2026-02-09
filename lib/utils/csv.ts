// lib/utils/csv.ts

/**
 * Minimal RFC4180-ish CSV parser (dependency-free).
 * - Uses first line as headers
 * - Handles quoted fields and escaped quotes ("")
 * - Trims whitespace around unquoted fields
 * - Normalizes CRLF/CR to LF
 * - Strips UTF-8 BOM
 * - Skips empty trailing lines
 */

export type CSVRow = {
  date: string;
  amount: string;
  description: string;
  type?: string;
  counterparty?: string;
  currency?: string;
  // Note: extra columns (if present) are ignored by the return type but safely parsed internally.
};

type AnyRow = Record<string, string>;

/**
 * Parse a CSV buffer into rows keyed by header names.
 * If required columns are missing in a given row, returns empty strings for them.
 */
export function parseCSV(buf: Buffer): CSVRow[] {
  const text = bufferToText(buf);
  const lines = toLines(text);

  if (lines.length === 0) return [];

  const headers = splitCSVLine(lines[0]).map((h) => h.trim());
  const rows: AnyRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue; // skip empty/blank lines
    const cols = splitCSVLine(line);
    const row: AnyRow = {};
    headers.forEach((h, idx) => {
      // Trim only outside quotes (splitCSVLine preserves inner content correctly)
      row[h] = (cols[idx] ?? "").trim();
    });
    rows.push(row);
  }

  // Coerce to the expected shape while tolerating missing columns
  return rows.map((r) => ({
    date: pickFirst(r, ["date", "posted_at", "transaction_date"]) ?? "",
    amount: pickFirst(r, ["amount", "amt", "value"]) ?? "",
    description: pickFirst(r, ["description", "memo", "name", "raw_description"]) ?? "",
    type: pickFirst(r, ["type", "direction", "drcr", "debit/credit"]) ?? undefined,
    counterparty: pickFirst(r, ["counterparty", "payee", "to", "from", "name"]) ?? undefined,
    currency: pickFirst(r, ["currency", "curr", "ccy"]) ?? undefined,
  }));
}

/* ---------------- internals ---------------- */

function bufferToText(buf: Buffer): string {
  // Convert to UTF-8 string and remove BOM if present
  return buf.toString("utf8").replace(/^\uFEFF/, "");
}

function toLines(text: string): string[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  // Trim trailing empty lines
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  return lines;
}

/**
 * Split a single CSV line into fields, honoring:
 * - quoted fields
 * - escaped double quotes ("")
 * - commas inside quotes
 */
function splitCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // Escaped quote ("")
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

/**
 * Pick the first non-empty value from a row across a list of header aliases.
 */
function pickFirst(row: AnyRow, keys: string[]): string | null {
  for (const k of keys) {
    if (row[k] != null && row[k] !== "") return row[k];
    // Also try case-insensitive match if exact key not found
    const hit = findKeyCaseInsensitive(row, k);
    if (hit && row[hit] !== "") return row[hit];
  }
  return null;
}

function findKeyCaseInsensitive(obj: AnyRow, key: string): string | null {
  const lower = key.toLowerCase();
  for (const k of Object.keys(obj)) {
    if (k.toLowerCase() === lower) return k;
  }
  return null;
}
