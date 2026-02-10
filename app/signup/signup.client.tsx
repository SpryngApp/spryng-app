// app/signup/signup.client.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

type Props = {
  nextPath: string;
};

function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !anonKey) throw new Error("Missing Supabase browser env vars.");
  return createBrowserClient(url, anonKey);
}

function isValidEmail(v: string) {
  const s = v.trim();
  if (!s) return false;
  if (s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default function SignupClient({ nextPath }: Props) {
  const next = nextPath || "/onboarding";

  const loginHref = useMemo(
    () => `/login?next=${encodeURIComponent(next)}`,
    [next]
  );
  const quizHref = "/quiz";

  const [loading, setLoading] = useState<null | "google" | "email">(null);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // If already logged in, go straight to next
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getBrowserSupabase();
        const { data } = await supabase.auth.getUser();
        if (!cancelled && data.user) window.location.assign(next);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [next]);

  async function signUpWithGoogle() {
    setErr(null);
    setNotice(null);
    setLoading("google");

    try {
      const supabase = getBrowserSupabase();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        next
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        setErr(error.message);
        setLoading(null);
      }
      // success redirects away
    } catch {
      setErr("Could not start Google sign-up. Please try again.");
      setLoading(null);
    }
  }

  async function signUpWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setNotice(null);

    const eClean = email.trim();

    if (!isValidEmail(eClean)) {
      setErr("Enter a valid email (e.g., name@company.com).");
      return;
    }
    if (password.length < 8) {
      setErr("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading("email");

    try {
      const supabase = getBrowserSupabase();
      const origin = window.location.origin;

      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        next
      )}`;

      const { data, error } = await supabase.auth.signUp({
        email: eClean,
        password,
        options: { emailRedirectTo },
      });

      if (error) {
        setErr(error.message);
        setLoading(null);
        return;
      }

      // If email confirmations are ON, session is typically null.
      if (!data.session) {
        setNotice(
          "Check your email to confirm your account, then you’ll be brought back to Spryng."
        );
        setLoading(null);
        return;
      }

      window.location.assign(next);
    } catch {
      setErr("Could not create your account. Please try again.");
      setLoading(null);
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-0px)] max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Spryng
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Create your account
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Save your employer setup steps, upload confirmations, and stay on top
          of deadlines.
        </p>

        <div className="mt-8 space-y-3">
          {/* Google */}
          <button
            onClick={signUpWithGoogle}
            disabled={loading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading === "google" ? "Connecting…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div className="relative py-2">
            <div className="h-px w-full bg-slate-200" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-slate-500">
              or
            </span>
          </div>

          {/* Email + Password */}
          <form onSubmit={signUpWithEmail} className="space-y-3" noValidate>
            <div>
              <label
                className="mb-1 block text-xs font-medium text-slate-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                placeholder="name@company.com"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-medium text-slate-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label
                className="mb-1 block text-xs font-medium text-slate-700"
                htmlFor="confirm"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(ev) => setConfirm(ev.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-300 focus:ring-4 focus:ring-slate-100"
                placeholder="Re-enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading !== null}
              className="flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 disabled:opacity-50"
            >
              {loading === "email" ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Messaging */}
          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}
          {notice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {notice}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 text-sm text-slate-600">
          <div>
            Already have an account?{" "}
            <Link
              href={loginHref}
              className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-black"
            >
              Log in
            </Link>
            .
          </div>
          <div>
            Prefer to take the quiz first?{" "}
            <Link
              href={quizHref}
              className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-black"
            >
              Take the 2-minute quiz
            </Link>
            .
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          By continuing, you agree to the Spryng terms and privacy policy.
        </p>
      </div>
    </main>
  );
}
