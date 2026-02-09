// app/onboarding/company/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const APP_HOME_DEFAULT = "/app";

const STATES = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
] as const;

type CreateCompanyOk = {
  ok: true;
  workspace_id?: string;
  employer_id?: string;
};

type CreateCompanyErr = {
  ok: false;
  error: { code: string; message: string; details?: unknown };
};

function safeNextPath(v: string | null, fallback: string) {
  const s = (v ?? "").trim();
  if (!s) return fallback;
  if (!s.startsWith("/")) return fallback;
  if (s.startsWith("//")) return fallback;
  return s;
}

export default function CompanyOnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const next = useMemo(() => {
    const raw = searchParams.get("next");
    const safe = safeNextPath(raw, APP_HOME_DEFAULT);
    // Avoid looping back into onboarding as the "destination"
    if (safe.startsWith("/onboarding")) return APP_HOME_DEFAULT;
    return safe;
  }, [searchParams]);

  const [companyName, setCompanyName] = useState("");
  const [stateCode, setStateCode] = useState("");
  const [entityType, setEntityType] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => companyName.trim().length > 1 && !loading, [companyName, loading]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/onboarding/create-company", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company_name: companyName.trim(),
          workspace_name: companyName.trim(),
          state_code: stateCode ? stateCode.toUpperCase() : null,
          entity_type_raw: entityType || null,
        }),
      });

      const json = (await res.json()) as CreateCompanyOk | CreateCompanyErr;

      if (!res.ok || !("ok" in json) || json.ok === false) {
        setErr(
          (json as CreateCompanyErr)?.error?.message || "We couldn’t save that. Please try again."
        );
        setLoading(false);
        return;
      }

      router.replace(next);
    } catch {
      setErr("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Spryng setup</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Let’s set up your company</h1>
        <p className="mt-3 text-sm text-slate-600">
          This takes about a minute. We’ll use it to organize your outside-payroll records and your state steps.
        </p>

        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="text-sm font-medium text-slate-800">Company name</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              placeholder="Example: Brightside Cleaning"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              autoComplete="organization"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">State (optional for now)</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              disabled={loading}
            >
              <option value="">Select a state</option>
              {STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              If you skip this, you can add it later — Spryng will still save your setup.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-800">Business setup (optional)</label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              disabled={loading}
            >
              <option value="">Select one</option>
              <option value="sole_prop">Sole proprietor</option>
              <option value="smllc">Single-member LLC</option>
              <option value="mmllc">Multi-member LLC</option>
              <option value="s_corp">S-Corp</option>
              <option value="c_corp">C-Corp</option>
              <option value="nonprofit">Nonprofit</option>
              <option value="not_sure">Not sure</option>
            </select>
          </div>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "Saving…" : "Continue"}
          </button>

          <p className="text-xs text-slate-500">
            You can change these details anytime. We’re just creating a clean workspace foundation.
          </p>
        </form>
      </div>
    </main>
  );
}
