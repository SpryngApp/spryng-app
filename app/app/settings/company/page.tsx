// app/app/settings/company/page.tsx

import { getSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function CompanySettingsPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_workspace_id")
    .eq("id", user!.id)
    .maybeSingle();

  const workspaceId = profile?.active_workspace_id ?? null;

  const { data: employer } = workspaceId
    ? await supabase.from("employers").select("id, display_name, state_code, entity_type_raw").eq("workspace_id", workspaceId).maybeSingle()
    : { data: null as any };

  if (!workspaceId || !employer?.id) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Company settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Your company isn’t set up yet.
        </p>
        <Link
          href="/onboarding/company"
          className="mt-6 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Complete setup
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Company settings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Editing can come next; for now this confirms your foundation is wired correctly.
        </p>

        <div className="mt-6 space-y-2 text-sm text-slate-700">
          <p><span className="text-slate-500">Company:</span> {employer.display_name}</p>
          <p><span className="text-slate-500">State:</span> {employer.state_code ?? "—"}</p>
          <p><span className="text-slate-500">Entity type:</span> {employer.entity_type_raw ?? "—"}</p>
          <p><span className="text-slate-500">Workspace ID:</span> {workspaceId}</p>
        </div>
      </div>
    </div>
  );
}
