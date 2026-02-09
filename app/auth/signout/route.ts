// app/auth/signout/route.ts

import { NextResponse } from "next/server";
import { applyCookieJar, getSupabaseRouteClient } from "@/lib/supabase/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const { supabase, cookieJar } = await getSupabaseRouteClient();

  await supabase.auth.signOut();

  const res = NextResponse.redirect(new URL("/", req.url));
  return applyCookieJar(res, cookieJar);
}

// Optional convenience GET
export async function GET(req: Request) {
  const { supabase, cookieJar } = await getSupabaseRouteClient();

  await supabase.auth.signOut();

  const res = NextResponse.redirect(new URL("/", req.url));
  return applyCookieJar(res, cookieJar);
}
