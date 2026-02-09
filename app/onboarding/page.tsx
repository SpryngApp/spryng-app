// app/onboarding/page.tsx

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const APP_HOME = "/app";
const AUTH_START = "/login";
const CLAIM_COOKIE = "spryng_quiz_claim";

export default async function OnboardingRouterPage() {
  const cookieStore = await cookies();
  const claimToken = cookieStore.get(CLAIM_COOKIE)?.value ?? "";

  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${AUTH_START}?next=/onboarding`);
  }

  // 1) Quiz carryover path
  if (claimToken) {
    redirect("/onboarding/claim");
  }

  // 2) Active workspace?
  const { data: profile } = await supabase
    .from("profiles")
    .select("active_workspace_id")
    .eq("id", user.id)
    .maybeSingle();

  const activeWorkspaceId = profile?.active_workspace_id ?? null;

  // 3) No workspace yet -> company setup
  if (!activeWorkspaceId) {
    redirect("/onboarding/company");
  }

  // 4) Ensure employer exists (1 company per workspace)
  const { data: employer } = await supabase
    .from("employers")
    .select("id")
    .eq("workspace_id", activeWorkspaceId)
    .maybeSingle();

  if (!employer?.id) {
    redirect("/onboarding/company");
  }

  redirect(APP_HOME);
}
