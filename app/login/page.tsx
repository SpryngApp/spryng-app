// app/login/page.tsx
import { Suspense } from "react";
import LoginClient from "./login.client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[calc(100vh-0px)] max-w-md flex-col justify-center px-6 py-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Spryng</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Log in</h1>
            <p className="mt-3 text-sm text-slate-600">Loading…</p>
          </div>
        </main>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
