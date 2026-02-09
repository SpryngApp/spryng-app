// app/onboarding/claim/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ClaimOk = {
  ok: true;
  claimed: true;
  session_id: string;
  workspace_id: string | null;
  employer_id: string | null;
  warnings?: string[];
};

type ClaimErr = {
  ok: false;
  error: { code: string; message: string };
};

export default function ClaimOnboardingPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState<string>("Claiming your quiz results…");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/quiz/claim", { method: "POST" });
        const json = (await res.json()) as ClaimOk | ClaimErr;

        if (cancelled) return;

        if (!res.ok || !("ok" in json) || json.ok === false) {
          setStatus("error");
          setMessage(
            (json as ClaimErr)?.error?.message ||
              "We couldn’t link your quiz to your account. Please try again."
          );
          return;
        }

        if (!json.workspace_id || !json.employer_id) {
          router.replace("/onboarding/company");
          return;
        }

        router.replace("/app");
      } catch {
        if (cancelled) return;
        setStatus("error");
        setMessage("Something went wrong while claiming your quiz. Please refresh and try again.");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Spryng</p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Linking your quiz to your account</h1>
        <p className="mt-3 text-sm text-slate-600">{message}</p>

        {status === "error" && (
          <div className="mt-6 flex gap-3">
            <button
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
            <button
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
              onClick={() => router.replace("/onboarding/company")}
            >
              Continue without quiz
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-slate-500">
        We’ll keep your original quiz answers — you won’t need to re-enter them.
      </p>
    </main>
  );
}
