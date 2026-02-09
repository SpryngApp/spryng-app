import EmployerRegistrationClient from "@/components/registration/EmployerRegistrationClient";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { resolveActiveWorkspaceId } from "@/lib/workspace/active";

type Rules = {
  portal?: { registration_url?: string; login_url?: string; help_url?: string };
  steps?: Array<{
    step_key: string;
    title: string;
    body: string;
    cta_label?: string;
    cta_url?: string;
    proof_required?: boolean;
  }>;
};

function fallbackSteps(portalUrl: string | null, state: string) {
  return [
    {
      step_key: "create_or_login",
      title: "Create your portal login (or sign in)",
      body: `Open the ${state} employer portal and sign in. If you’re new, create an account.`,
      cta_label: "Open portal",
      cta_url: portalUrl ?? undefined,
      proof_required: false,
    },
    {
      step_key: "complete_registration",
      title: "Complete employer/UI registration",
      body: "Fill out the registration application using the packet values in Spryng.",
      cta_label: "Open portal",
      cta_url: portalUrl ?? undefined,
      proof_required: false,
    },
    {
      step_key: "save_confirmation",
      title: "Save your confirmation",
      body: "Download or screenshot the submission confirmation and upload it to Spryng.",
      cta_label: "Open portal",
      cta_url: portalUrl ?? undefined,
      proof_required: true,
    },
    {
      step_key: "watch_for_letter",
      title: "Watch for an account notice or verification step",
      body: "Some states require additional verification or send an account letter. Save it to Spryng when it arrives.",
      proof_required: true,
    },
  ];
}

export default async function Page() {
  const supabase = await createSupabaseServerComponentClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-slate-700">Please sign in.</p>
      </div>
    );
  }

  const workspaceId = await resolveActiveWorkspaceId(supabase, auth.user.id);

  const employerRes = await supabase
    .from("employers")
    .select("id, legal_name, ein, entity_type, state_code")
    .eq("workspace_id", workspaceId)
    .single();

  const employer = employerRes.data;
  if (!employer) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-slate-700">No employer found. Please complete onboarding.</p>
      </div>
    );
  }

  const caseRes = await supabase
    .from("employer_registration_cases")
    .select("status")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const caseStatus =
    (caseRes.data?.status as "not_started" | "in_progress" | "submitted" | "completed" | "blocked") ??
    "not_started";

  const rulesRes = await supabase
    .from("state_registration_rules")
    .select("rules")
    .eq("state_code", employer.state_code)
    .maybeSingle();

  const rules = (rulesRes.data?.rules ?? {}) as Rules;

  const portal = {
    registration_url: rules.portal?.registration_url ?? null,
    login_url: rules.portal?.login_url ?? null,
    help_url: rules.portal?.help_url ?? null,
  };

  const portalUrl = portal.registration_url || portal.login_url || null;

  const steps =
    rules.steps && rules.steps.length > 0
      ? rules.steps
      : fallbackSteps(portalUrl, employer.state_code);

  const artifactsRes = await supabase
    .from("workspace_artifacts")
    .select("id, step_key, file_name, created_at")
    .eq("workspace_id", workspaceId)
    .eq("category", "registration_proof")
    .order("created_at", { ascending: false });

  return (
    <EmployerRegistrationClient
      employer={{
        id: employer.id,
        legal_name: employer.legal_name,
        ein: employer.ein,
        entity_type: employer.entity_type,
        state_code: employer.state_code,
      }}
      portal={portal}
      steps={steps}
      caseStatus={caseStatus}
      artifacts={artifactsRes.data ?? []}
    />
  );
}
