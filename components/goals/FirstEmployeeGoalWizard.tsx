"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SpryngToasts } from "@/lib/ui/spryng-toasts";

const INDUSTRIES = [
  "Services (general)",
  "Cleaning / Janitorial",
  "Construction / Trades",
  "Beauty / Personal care",
  "Food / Catering",
  "Retail / E-commerce",
  "Trucking / Logistics",
  "Professional services",
  "Nonprofit",
  "Other",
] as const;

const REVENUE_RANGES = [
  "Under $5k/mo",
  "$5k–$10k/mo",
  "$10k–$25k/mo",
  "$25k–$50k/mo",
  "$50k–$100k/mo",
  "$100k+/mo",
] as const;

const HOURS_RANGES = [
  "Under 20 hrs/wk",
  "20–35 hrs/wk",
  "35–50 hrs/wk",
  "50+ hrs/wk",
] as const;

const HELP_FOCUS = ["Admin", "Operations", "Sales", "Delivery/Fulfillment", "Other"] as const;

function monthToISOFirstDay(value: string) {
  // input: YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(value)) return null;
  return `${value}-01`;
}

export default function FirstEmployeeGoalWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [targetMonth, setTargetMonth] = useState<string>("");
  const [targetRole, setTargetRole] = useState<string>("");

  // Step 2
  const [industry, setIndustry] = useState<string>("");
  const [monthlyRevenueRange, setMonthlyRevenueRange] = useState<string>("");
  const [ownerHoursRange, setOwnerHoursRange] = useState<string>("");
  const [helpFocus, setHelpFocus] = useState<string>("");

  const targetMonthISO = useMemo(() => monthToISOFirstDay(targetMonth), [targetMonth]);

  const canNext1 = Boolean(targetMonthISO);
  const canNext2 = Boolean(industry && monthlyRevenueRange && ownerHoursRange && helpFocus);

  async function save() {
    if (!targetMonthISO) return;

    const res = await fetch("/api/goals/first-employee", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        target_month: targetMonthISO,
        target_role: targetRole || null,
        industry: industry || null,
        monthly_revenue_range: monthlyRevenueRange || null,
        owner_hours_range: ownerHoursRange || null,
        help_focus: helpFocus || null,
        inputs: null,
      }),
    });

    const json = await res.json();
    if (!json.ok) {
      // Keep this calm; you can add a dedicated error toast if you want
      alert(json.error?.message ?? "Could not save your goal.");
      return;
    }

    SpryngToasts.goalSet();
    router.push("/goals/first-employee");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Hire your first employee</h1>
        <p className="mt-2 text-sm text-slate-600">
          A calm plan from employer setup → first report → first hire.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">Step {step} of 3</p>
          <div className="h-2 w-40 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-slate-900"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-900">Target hire month</label>
              <p className="mt-1 text-xs text-slate-600">Pick a month. You can change it anytime.</p>
              <input
                type="month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">Role (optional)</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Admin assistant, Ops support, Sales"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-medium text-slate-900">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {INDUSTRIES.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">Monthly revenue range</label>
              <select
                value={monthlyRevenueRange}
                onChange={(e) => setMonthlyRevenueRange(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {REVENUE_RANGES.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">Hours you work per week</label>
              <select
                value={ownerHoursRange}
                onChange={(e) => setOwnerHoursRange(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {HOURS_RANGES.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">What should the hire help with most?</label>
              <select
                value={helpFocus}
                onChange={(e) => setHelpFocus(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="">Select…</option>
                {HELP_FOCUS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Your plan preview</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                <li>Employer accounts ready (registration + proof saved)</li>
                <li>First report plan saved (due date + reminders)</li>
                <li>Tracking routine set (audit-ready records)</li>
                <li>Payroll decision (only when you’re close to hiring)</li>
              </ul>
            </div>

            <p className="text-sm text-slate-600">
              We’ll keep this calm and step-by-step. You’ll always know what to do next.
            </p>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
            disabled={step === 1}
          >
            Back
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={save}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Save goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
