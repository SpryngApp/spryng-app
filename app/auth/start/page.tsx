// app/auth/start/page.tsx
import { redirect } from "next/navigation";
import { sanitizeNextPath } from "@/lib/supabase/env";

type AuthStartPageProps = {
  // Next.js 15+: searchParams is async
  searchParams?: Promise<{ next?: string }>;
};

export default async function AuthStartPage(props: AuthStartPageProps) {
  const sp = props.searchParams ? await props.searchParams : undefined;

  const next = sanitizeNextPath(sp?.next || "/onboarding", "/onboarding");
  redirect(`/login?next=${encodeURIComponent(next)}`);
}
