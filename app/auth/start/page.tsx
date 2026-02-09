// app/auth/start/page.tsx

import { redirect } from "next/navigation";
import { sanitizeNextPath } from "@/lib/supabase/env";

export default function AuthStartPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = sanitizeNextPath(searchParams?.next || "/onboarding", "/onboarding");
  redirect(`/login?next=${encodeURIComponent(next)}`);
}
