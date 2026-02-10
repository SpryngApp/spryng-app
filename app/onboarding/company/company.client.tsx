// app/onboarding/company/company.client.tsx
"use client";

import * as React from "react";
import { createBrowserClient } from "@supabase/ssr";

type Props = {
  nextPath: string;
};

function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anonKey) throw new Error("Missing Supabase browser env vars.");
  return createBrowserClient(url, anonKey);
}

const STATES: Array<{ code: string; name: string }> = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export default function CompanyOnboardingClient({ nextPath }: Props) {
  const [checkingAuth, setCheckingAuth] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [companyName, setCompanyName] = React.useState("");
  const [stateCode, setStateCode] = React.useState("IN");

  // If not logged in, send to login with a return path
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const sb = getBrowserSupabase();
        const { data } = await sb.auth.getUser();

        if (!cancelled && !data.user) {
          const returnTo = `/onboarding/company?next=${encodeURIComponent(
            nextPath || "/app"
          )}`;
          window.location.assign(`/login?next=${encodeURIComponent(returnTo)}`);
          return;
        }
      } catch {
        // If auth check fails, still let them try; API will enforce auth anyway.
      } finally {
        if (!cancelled) setCheckingAuth(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [nextPath]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const name = companyName.trim();
    if (!name) {
      setError("Enter your company name.");
      return;
    }
    if (!stateCode) {
      setError("Select your state.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/create-company", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          // send a few common keys so your API can accept whichever it expects
          companyName: name,
          displayName: name,
          display_name: name,
          stateCode,
          state_code: stateCode,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        const msg =
          json?.error?.message ||
          json?.error ||
          `Could not save company details (HTTP ${res.status}).`;
        setError(String(msg));
        setLoading(false);
        return;
      }

      window.location.assign(nextPath || "/app");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-0px)] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Spryng
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Add your company
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          This powers your employer setup checklist and keeps your records tied to the right state.
        </p>

        {checkingAuth ? (
          <div className="mt-8 space-y-3">
            <div className="h-11 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-11 w-full animate-pulse rounded bg-slate-100" />
            <div className="h-11 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label
                className="mb-1 block text-xs font-medium text-slate-700"
                htmlFor="companyName"
              >
                Company name
              </label>
              <input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                placeholder="e.g., Carter Consulting LLC"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-medium text-slate-700"
                htmlFor="stateCode"
              >
                State
              </label>
              <select
                id="stateCode"
                value={stateCode}
                onChange={(e) => setStateCode(e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
              >
                {STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Saving…" : "Continue"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
