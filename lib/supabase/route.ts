// lib/supabase/route.ts

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptionsWithName } from "@supabase/ssr";
import { getSupabasePublicEnv } from "./env";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptionsWithName;
};

/**
 * Route Handlers CAN set cookies on the response.
 * We capture any cookies Supabase wants to set, then apply them to the NextResponse you return.
 */
export async function getSupabaseRouteClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  const cookieJar: CookieToSet[] = [];

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookieJar.push(...cookiesToSet);
      },
    },
  });

  return { supabase, cookieJar };
}

export function applyCookieJar(
  res: import("next/server").NextResponse,
  cookieJar: CookieToSet[]
) {
  for (const c of cookieJar) {
    res.cookies.set(c.name, c.value, c.options);
  }
  return res;
}
