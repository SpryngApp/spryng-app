// scripts/import-payment-exclusions.mjs
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

/**
 * Import/Upsert family-payment UI exclusions into:
 *   public.state_payment_exclusions
 *
 * Accepts either:
 *  A) Flat row array: [{ state_code, employer_entity_type, ... }]
 *  B) State dataset: [{ state_code, status, rules: [...] }]
 *
 * Usage:
 *   node scripts/import-payment-exclusions.mjs data/state-registration/family_ui_rules_updated.json
 *   node scripts/import-payment-exclusions.mjs ... --dry-run
 */

const argv = process.argv.slice(2);
const filePath = argv.find((a) => !a.startsWith("--"));
const DRY_RUN = argv.includes("--dry-run");

// ---- Load env (Windows-friendly) ----
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY. Add them to .env.local and re-run."
  );
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

if (!filePath) {
  throw new Error(
    "Usage: node scripts/import-payment-exclusions.mjs path/to/family_ui_rules.json [--dry-run]"
  );
}

const abs = path.resolve(process.cwd(), filePath);
if (!fs.existsSync(abs)) throw new Error(`File not found: ${abs}`);

const raw = fs.readFileSync(abs, "utf8");
const parsed = JSON.parse(raw);

// Accept either an array or { data: [...] }
const input = Array.isArray(parsed)
  ? parsed
  : Array.isArray(parsed?.data)
    ? parsed.data
    : null;

if (!input) {
  throw new Error("JSON must be an array, or an object with a `data` array.");
}

// ---------- Normalizers ----------
const VALID_ENTITY_TYPES = new Set([
  "sole_prop_sml",
  "partnership_mml",
  "s_corp",
  "c_corp",
  "nonprofit",
  "domestic_household",
  "agricultural",
  "other",
  "unknown",
]);

const VALID_CATEGORIES = new Set([
  "general",
  "domestic",
  "agricultural",
  "nonprofit",
  "government",
  "unknown",
]);

const VALID_RELATIONSHIPS = new Set([
  "spouse",
  "child",
  "parent",
  "stepchild",
  "adopted_child",
  "sibling",
  "other_family",
  "friend",
  "unknown",
]);

const VALID_AGE_OPS = new Set(["na", "<", "<=", "=", ">=", ">"]);
const VALID_EFFECTS = new Set(["excluded", "included", "depends", "unknown"]);
const VALID_OWNER_FLAGS = new Set(["yes", "no", "unknown"]);

function toStr(v) {
  return typeof v === "string" ? v.trim() : "";
}

function upper2(v) {
  const s = toStr(v).toUpperCase();
  return s;
}

function ensureNotesArray(v) {
  if (Array.isArray(v)) return v.map((x) => toStr(x)).filter(Boolean);
  return [];
}

function normalizeEntityType(v, notes) {
  const s = toStr(v).toLowerCase();
  if (!s) return "unknown";
  if (VALID_ENTITY_TYPES.has(s)) return s;

  // Common aliases
  if (
    [
      "sole_prop",
      "soleproprietor",
      "sole_proprietor",
      "single_member_llc",
      "singlememberllc",
      "sml",
      "smllc",
      "disregarded_llc",
      "disregarded_entity",
    ].includes(s)
  )
    return "sole_prop_sml";

  if (
    ["partnership", "multi_member_llc", "multimemberllc", "mml", "llp"].includes(
      s
    )
  )
    return "partnership_mml";

  if (["scorp", "s-corp", "s_corporation"].includes(s)) return "s_corp";
  if (["ccorp", "c-corp", "c_corporation"].includes(s)) return "c_corp";

  // Dataset sometimes uses quiz-ish values like "llc_unsure"
  if (s.includes("llc")) {
    notes.push(
      `Original employer_entity_type was "${s}" (normalized to "unknown")`
    );
    return "unknown";
  }

  notes.push(`Unrecognized employer_entity_type "${s}" (normalized to "unknown")`);
  return "unknown";
}

function normalizeRelationship(v, notes) {
  const s = toStr(v).toLowerCase();
  if (!s) return "unknown";
  if (VALID_RELATIONSHIPS.has(s)) return s;

  // Light aliasing
  if (s.includes("spouse")) return "spouse";
  if (s.includes("child")) return "child";
  if (s.includes("parent")) return "parent";
  if (s.includes("sibling") || s.includes("brother") || s.includes("sister"))
    return "sibling";
  if (s.includes("friend")) return "friend";
  if (s.includes("step")) return "stepchild";
  if (s.includes("adopt")) return "adopted_child";
  if (s.includes("family")) return "other_family";

  notes.push(`Unrecognized relationship "${s}" (normalized to "unknown")`);
  return "unknown";
}

function normalizeCategory(v) {
  const s = toStr(v).toLowerCase();
  if (!s) return "general";
  return VALID_CATEGORIES.has(s) ? s : "general";
}

function mapEffect(v) {
  const s = toStr(v).toLowerCase();
  if (!s) return "unknown";

  // dataset-style values
  if (s.includes("excluded")) return "excluded";
  if (s.includes("included") || s.includes("covered")) return "included";
  if (s.includes("depends")) return "depends";
  if (s.includes("unknown")) return "unknown";

  return "unknown";
}

function normalizePayeeIsOwner(v) {
  const s = toStr(v).toLowerCase();
  if (!s) return "unknown";
  if (VALID_OWNER_FLAGS.has(s)) return s;
  return "unknown";
}

function derivePayeeIsOwnerFromText(conditionsText) {
  const t = toStr(conditionsText).toLowerCase();
  if (!t) return "unknown";

  // SAFE inference only
  if (t.includes("not an owner") || t.includes("not a member") || t.includes("non-member")) {
    return "no";
  }
  return "unknown";
}

function normalizeAge(ageCondition) {
  const ac = ageCondition && typeof ageCondition === "object" ? ageCondition : null;

  const applies = ac?.applies === true;
  const op = toStr(ac?.operator);

  // accept either age_years OR years (agent outputs vary)
  const years =
    Number.isFinite(ac?.age_years) ? ac.age_years :
    Number.isFinite(ac?.years) ? ac.years :
    null;

  if (!applies || !op || !Number.isFinite(years)) {
    return { age_operator: "na", age_years: -1 };
  }

  const cleanOp = VALID_AGE_OPS.has(op) ? op : "na";
  const cleanYears = Number.isFinite(years) ? years : -1;

  return { age_operator: cleanOp, age_years: cleanOp === "na" ? -1 : cleanYears };
}

function normalizeStateCode(v, notes) {
  const s = upper2(v);
  if (!s) return "??";
  if (s.length !== 2) notes.push(`Unexpected state_code "${s}" (expected 2 letters)`);
  return s;
}

// ---------- Detect format ----------
const looksLikeFlatRows =
  input.length > 0 &&
  typeof input[0] === "object" &&
  input[0] != null &&
  "state_code" in input[0] &&
  "employer_entity_type" in input[0];

const looksLikeStateDataset =
  input.length > 0 &&
  typeof input[0] === "object" &&
  input[0] != null &&
  "state_code" in input[0] &&
  ("rules" in input[0] || "status" in input[0]);

if (!looksLikeFlatRows && !looksLikeStateDataset) {
  throw new Error(
    "Unrecognized JSON shape. Expected either flat rows with {state_code, employer_entity_type, ...} " +
      "or a state dataset with {state_code, status, rules: [...]}."
  );
}

// ---------- Print dataset status summary if available ----------
if (looksLikeStateDataset) {
  const counts = { complete: 0, partial: 0, missing: 0, other: 0 };
  for (const s of input) {
    const st = toStr(s.status).toLowerCase();
    if (st === "complete") counts.complete++;
    else if (st === "partial") counts.partial++;
    else if (st === "missing") counts.missing++;
    else counts.other++;
  }
  console.log("ℹ️  family_ui_rules status summary:", counts);
}

// ---------- Build payload ----------
let payload = [];

if (looksLikeFlatRows) {
  payload = input.map((r) => {
    const notes = ensureNotesArray(r.notes);

    const state_code = normalizeStateCode(r.state_code, notes);
    const employer_entity_type = normalizeEntityType(r.employer_entity_type, notes);
    const relationship = normalizeRelationship(r.relationship, notes);
    const employment_category = normalizeCategory(r.employment_category);

    const age_operator = VALID_AGE_OPS.has(r.age_operator) ? r.age_operator : "na";
    const age_years = Number.isFinite(r.age_years) ? r.age_years : -1;

    const ui_coverage_effect = VALID_EFFECTS.has(r.ui_coverage_effect)
      ? r.ui_coverage_effect
      : "unknown";
    const ui_wage_reporting_effect = VALID_EFFECTS.has(r.ui_wage_reporting_effect)
      ? r.ui_wage_reporting_effect
      : "unknown";

    const payee_is_owner = normalizePayeeIsOwner(r.payee_is_owner);

    return {
      state_code,
      employer_entity_type,
      employment_category,
      relationship,
      payee_is_owner,
      age_operator,
      age_years,
      ui_coverage_effect,
      ui_wage_reporting_effect,
      conditions_text: r.conditions_text ?? null,
      notes,
      source_url: r.source_url ?? null,
      source_title: r.source_title ?? null,
      source_pinpoint: r.source_pinpoint ?? "",
      supporting_quote: r.supporting_quote ?? null,
      last_verified: r.last_verified ?? null,
    };
  });
} else {
  // Flatten state-first dataset
  for (const s of input) {
    const stateNotes = ensureNotesArray(s.notes);
    const stateSourceUrl = s.source_primary_url ?? null;
    const stateLastVerified = s.last_verified ?? null;

    const stateCode = normalizeStateCode(s.state_code, stateNotes);
    const rules = Array.isArray(s.rules) ? s.rules : [];

    for (const r of rules) {
      const notes = [...stateNotes, ...ensureNotesArray(r.notes)];

      const employer_entity_type = normalizeEntityType(r.employer_entity_type, notes);
      const employment_category = normalizeCategory(r.employment_category);
      const relationship = normalizeRelationship(r.relationship, notes);

      const { age_operator, age_years } = normalizeAge(r.age_condition);

      const ui_coverage_effect = mapEffect(r.coverage_effect);
      const ui_wage_reporting_effect = mapEffect(r.wage_reporting_effect);

      const authority = r.authority && typeof r.authority === "object" ? r.authority : {};
      const source_url = authority.source_url ?? stateSourceUrl;
      const source_title = authority.source_title ?? null;
      const source_pinpoint = authority.pinpoint ?? "";
      const supporting_quote = authority.supporting_quote ?? null;

      const payee_is_owner = normalizePayeeIsOwner(
        r.payee_is_owner ?? derivePayeeIsOwnerFromText(r.conditions_text)
      );

      const last_verified = authority.last_verified ?? stateLastVerified ?? null;

      payload.push({
        state_code: stateCode,
        employer_entity_type,
        employment_category,
        relationship,
        payee_is_owner,
        age_operator,
        age_years,
        ui_coverage_effect,
        ui_wage_reporting_effect,
        conditions_text: r.conditions_text ?? null,
        notes,
        source_url,
        source_title,
        source_pinpoint,
        supporting_quote,
        last_verified,
      });
    }
  }
}

// ---------- Guardrails ----------
payload = payload.filter((r) => {
  if (!r.state_code || r.state_code.length < 2) return false;
  return true;
});

if (payload.length === 0) {
  console.log("No rows to import (payload is empty).");
  process.exit(0);
}

// Quick DB ping so missing-table errors are obvious BEFORE chunk loop
{
  const { error: pingError } = await supabase
    .from("state_payment_exclusions")
    .select("id", { count: "exact", head: true });

  if (pingError) {
    console.error("❌ Cannot access public.state_payment_exclusions.");
    console.error(pingError);

    // Helpful hint for the common failure you hit earlier
    if (String(pingError?.code) === "PGRST205") {
      console.error(
        "\nHint: This usually means the table doesn't exist in Supabase yet, or migrations haven't been pushed/applied.\n" +
          "Run: supabase db push\n"
      );
    }
    process.exit(1);
  }
}

// ---------- Dry run ----------
if (DRY_RUN) {
  console.log("🧪 DRY RUN: would upsert rows:", payload.length);
  console.log("First row preview:", payload[0]);
  process.exit(0);
}

// ---------- Upsert ----------
const CHUNK = 500;
let total = 0;

for (let i = 0; i < payload.length; i += CHUNK) {
  const batch = payload.slice(i, i + CHUNK);

  const { error } = await supabase
    .from("state_payment_exclusions")
    .upsert(batch, {
      onConflict:
        "state_code,employer_entity_type,employment_category,relationship,payee_is_owner,age_operator,age_years,source_pinpoint",
    });

  if (error) {
    console.error("❌ Upsert failed on batch starting at", i);
    console.error(error);

    // Another common failure: onConflict doesn't match a UNIQUE constraint
    if (String(error?.message || "").toLowerCase().includes("no unique")) {
      console.error(
        "\nHint: Your table needs a UNIQUE constraint that matches the onConflict columns:\n" +
          "  (state_code, employer_entity_type, employment_category, relationship, payee_is_owner, age_operator, age_years, source_pinpoint)\n"
      );
    }

    process.exit(1);
  }

  total += batch.length;
  console.log(`✅ Upserted ${total}/${payload.length}`);
}

console.log(`✅ Done. Imported/updated ${payload.length} rows into state_payment_exclusions.`);
console.log(`   Source file: ${abs}`);
