// lib/supabase/server.ts
import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicEnv } from "./env";

/**
 * Supabase SSR passes cookies to setAll in the shape:
 * { name: string; value: string; options?: CookieOptions }
 *
 * Some versions of @supabase/ssr export CookieOptionsWithName that does NOT include
 * value/options, so we define our own safe type here to avoid TS drift.
 */
type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, any>;
};

function setCookieSafe(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  c: CookieToSet
) {
  const { name, value, options } = c;

  // Next's cookie store supports both signatures depending on runtime:
  // - cookieStore.set(name, value, options)
  // - cookieStore.set({ name, value, ...options })
  try {
    cookieStore.set(name, value, options);
  } catch {
    cookieStore.set({ name, value, ...(options ?? {}) });
  }
}

/**
 * Route Handlers: can READ + SET cookies.
 * Use this in /app/api/** route handlers.
 */
export async function createSupabaseRouteClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // We intentionally coerce here to avoid dependency on @supabase/ssr type exports
        for (const c of cookiesToSet as unknown as CookieToSet[]) {
          setCookieSafe(cookieStore, c);
        }
      },
    },
  });
}

/**
 * Server Components: can READ auth cookies but should not try to set them.
 * Use this in server components/pages/layouts for read-only queries.
 */
export async function createSupabaseServerComponentClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in Server Components
      },
    },
  });
}

/**
 * Backwards-compatible alias (your existing code uses this).
 */
export async function getSupabaseServerClient() {
  return createSupabaseServerComponentClient();
}

/**
 * Admin client (Service Role) for server-only usage.
 *
 * This is exported as `supabaseAdmin` to match your API route imports:
 *   import { supabaseAdmin } from "@/lib/supabase/server";
 *
 * Notes:
 * - Uses a lazy-initialized client so builds won't fail during static analysis.
 * - Throws a clear runtime error if required env vars are missing.
 * - Never use this on the client.
 */
let _admin: SupabaseClient | null = null;

function getSupabaseAdminClient(): SupabaseClient {
  if (_admin) return _admin;

  // Prefer public URL var (commonly used in Next apps), fallback to SUPABASE_URL.
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!url || !serviceKey) {
    throw new Error(
      "Missing Supabase admin env vars. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY in your environment."
    );
  }

  _admin = createSupabaseAdminClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return _admin;
}

export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdminClient() as any)[prop];
  },
}) as SupabaseClient;
