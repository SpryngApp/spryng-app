// app/auth/callback/route.ts

import { NextResponse } from "next/server";
import { applyCookieJar, getSupabaseRouteClient } from "@/lib/supabase/route";
import { sanitizeNextPath } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);

  const code = url.searchParams.get("code");
  const next = sanitizeNextPath(url.searchParams.get("next"), "/onboarding");

  const oauthError =
    url.searchParams.get("error_description") ||
    url.searchParams.get("error") ||
    null;

  const { supabase, cookieJar } = await getSupabaseRouteClient();

  if (oauthError) {
    const res = NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, req.url)
    );
    return applyCookieJar(res, cookieJar);
  }

  if (!code) {
    const res = NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, req.url)
    );
    return applyCookieJar(res, cookieJar);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    const res = NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent(next)}`, req.url)
    );
    return applyCookieJar(res, cookieJar);
  }

  const res = NextResponse.redirect(new URL(next, req.url));
  return applyCookieJar(res, cookieJar);
}
