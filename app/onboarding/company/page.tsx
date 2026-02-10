// app/onboarding/company/page.tsx
import { sanitizeNextPath } from "@/lib/supabase/env";
import CompanyOnboardingClient from "./company.client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  // Next.js 15: searchParams is async (Promise)
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompanyOnboardingPage(props: PageProps) {
  const sp = (await props.searchParams) ?? {};
  const nextRaw = Array.isArray(sp.next) ? sp.next[0] : sp.next;

  // Where to go after onboarding succeeds
  const nextPath =
    sanitizeNextPath(typeof nextRaw === "string" ? nextRaw : "/app", "/app") ||
    "/app";

  return <CompanyOnboardingClient nextPath={nextPath} />;
}
