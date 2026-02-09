// lib/supabaseAdmin.ts
import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase admin client (Service Role).
 * - DO NOT import this in client components.
 * - Use for privileged API routes / server jobs only.
 *
 * This exports a *client value* (not a function) to prevent accidental `supabaseAdmin()`
 * call-sites that break builds.
 */
function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

const url = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

export const supabaseAdmin: SupabaseClient = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
