// app/app/layout.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/app");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/app" className="text-sm font-semibold text-slate-900">
            Spryng
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/app/checklist" className="hover:text-slate-900">Checklist</Link>
            <Link href="/app/tracking" className="hover:text-slate-900">Tracking</Link>
            <Link href="/app/settings/company" className="hover:text-slate-900">Company</Link>
            <a
              href="/auth/signout"
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:text-slate-900"
            >
              Sign out
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
