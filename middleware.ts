// middleware.ts

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env missing, don't block the app (but auth won't work correctly)
  if (!url || !anonKey) return NextResponse.next();

  const res = NextResponse.next();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          res.cookies.set(name, value, options);
        });
      },
    },
  });

  // Refresh session if needed
  await supabase.auth.getUser();

  return res;
}

export const config = {
  matcher: ["/app/:path*", "/onboarding/:path*", "/auth/callback"],
};
