// scripts/import-state-rules.mjs
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Always load env from project root (where you run `node ...`)
const cwd = process.cwd();
const envLocalPath = path.join(cwd, ".env.local");
const envPath = path.join(cwd, ".env");

// Load .env.local first (preferred), then .env as fallback
if (fs.existsSync(envLocalPath)) dotenv.config({ path: envLocalPath });
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

// Accept either SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role key only

if (!url || !serviceKey) {
  console.error("❌ Missing SUPABASE URL or Service Role Key.");
  console.error("   Resolved url present?", Boolean(url));
  console.error("   Resolved service role key present?", Boolean(serviceKey));
  console.error("");
  console.error("Looked for env files at:");
  console.error(`- ${envLocalPath} ${fs.existsSync(envLocalPath) ? "(found)" : "(not found)"}`);
  console.error(`- ${envPath} ${fs.existsSync(envPath) ? "(found)" : "(not found)"}`);
  console.error("");
  console.error("✅ Ensure .env.local contains:");
  console.error("   SUPABASE_URL=https://<your-project-ref>.supabase.co");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=sb_secret_<your-key>");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const filePath = process.argv[2];
if (!filePath) {
  throw new Error("Usage: node scripts/import-state-rules.mjs path/to/file.json");
}

const absoluteFilePath = path.isAbsolute(filePath)
  ? filePath
  : path.join(cwd, filePath);

if (!fs.existsSync(absoluteFilePath)) {
  throw new Error(`JSON file not found: ${absoluteFilePath}`);
}

const raw = fs.readFileSync(absoluteFilePath, "utf8");
const payload = JSON.parse(raw);

if (!Array.isArray(payload)) {
  throw new Error("Expected the JSON file to contain an array of records.");
}
if (payload.length === 0) {
  console.warn("⚠️ JSON array is empty. Nothing to import.");
  process.exit(0);
}

// Upsert by primary key: state_code
const { data, error } = await supabase
  .from("state_registration_rules")
  .upsert(payload, { onConflict: "state_code" })
  .select("state_code");

if (error) {
  console.error("❌ Supabase upsert failed:");
  console.error(error);
  process.exit(1);
}

console.log(`✅ Imported/updated ${data?.length ?? payload.length} records into state_registration_rules.`);
console.log(`   Source file: ${absoluteFilePath}`);
