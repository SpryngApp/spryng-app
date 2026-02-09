"use client";

import { createBrowserClient } from "@supabase/ssr";

function requiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
