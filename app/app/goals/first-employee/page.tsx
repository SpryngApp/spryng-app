import Link from "next/link";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server";
import { resolveActiveWorkspaceId, resolveEmployerStateForWorkspace } from "@/lib/workspace/active";

function badge(status: "done" | "todo") {
  return status === "done"
    ? "inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700"
    : "inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700";
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
  const employerState = await resolveEmployerStateForWorkspace(supabase, workspaceId);

  const goalRes = await supabase
    .from("workspace_goals")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("type", "first_employee")
    .maybeSingle();

  const goal = goalRes.data;

  if (!goal) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">First employee goal</h1>
        <p className="mt-2 text-sm text-slate-600">
          Set a calm, step-by-step plan toward your first hire.
        </p>
        <Link
          href="/goals/first-employee/new"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Set a hiring goal
        </Link>
      </div>
    );
  }

  const regCase = await supabase
    .from("employer_registration_cases")
    .select("status")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const reporting = await supabase
    .from("employer_reporting_settings")
    .select("first_report_due_date")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const registrationDone = regCase.data?.status === "completed";
  const dueDateSaved = Boolean(reporting.data?.first_report_due_date);

  const targetMonth = goal.target_month as string;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hire your first employee</h1>
          <p className="mt-2 text-sm text-slate-600">
            Target: <span className="font-medium text-slate-900">{targetMonth}</span> · State:{" "}
            <span className="font-medium text-slate-900">{employerState}</span>
          </p>
        </div>
        <Link
          href="/goals/first-employee/new"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Edit goal
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Milestones</h2>

        <div className="mt-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Employer accounts ready</p>
              <p className="mt-1 text-sm text-slate-600">
                Complete registration and save proof so your records are audit-ready.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={badge(registrationDone ? "done" : "todo")}>
                {registrationDone ? "Completed" : "Not started"}
              </span>
              <Link
                href="/setup/employer-registration"
                className="text-sm font-semibold text-slate-900 hover:underline"
              >
                Open
              </Link>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">First report plan saved</p>
              <p className="mt-1 text-sm text-slate-600">
                Save your first due date so we can keep you on track.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={badge(dueDateSaved ? "done" : "todo")}>
                {dueDateSaved ? "Saved" : "Not saved"}
              </span>
              <Link
                href="/setup/first-report"
                className="text-sm font-semibold text-slate-900 hover:underline"
              >
                Open
              </Link>
            </div>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Tracking routine set</p>
              <p className="mt-1 text-sm text-slate-600">
                Keep audit-ready records even before payroll starts.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={badge("todo")}>Not started</span>
              <Link href="/tracking" className="text-sm font-semibold text-slate-900 hover:underline">
                Open
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Warm note</p>
            <p className="mt-1 text-sm text-slate-700">
              This is a real milestone. We’ll keep everything calm, clear, and step-by-step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
