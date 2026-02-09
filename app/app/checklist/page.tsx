// app/app/checklist/page.tsx

import Link from "next/link";

export default function ChecklistPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Your checklist</h1>
        <p className="mt-2 text-sm text-slate-600">
          This will become your state-specific employer setup checklist + proof routine.
        </p>

        <ul className="mt-6 space-y-3 text-sm text-slate-700">
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            1) Confirm business setup + state
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            2) Create outside-payroll proof routine (log + folder)
          </li>
          <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            3) Follow state registration steps (when triggered)
          </li>
        </ul>

        <div className="mt-6 flex gap-3">
          <Link href="/app/tracking" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Go to tracking
          </Link>
          <Link href="/app/settings/company" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
            Company settings
          </Link>
        </div>
      </div>
    </div>
  );
}
