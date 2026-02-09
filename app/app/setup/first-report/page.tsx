"use client";

import { useState } from "react";
import { SpryngToasts } from "@/lib/ui/spryng-toasts";

export default function Page() {
  const [date, setDate] = useState("");
  const [source, setSource] = useState<"portal" | "agency_page" | "accountant" | "other">("portal");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!date) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reporting/first-due-date", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ first_report_due_date: date, source }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message ?? "Failed to save due date.");
      SpryngToasts.dueDateSaved(date);
    } catch (e: any) {
      alert(e?.message ?? "Could not save due date.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Your first report due date</h1>
      <p className="mt-2 text-sm text-slate-600">
        Enter the first due date you see in the state portal. We’ll keep you on track.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="text-sm font-medium text-slate-900">First due date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />

        <label className="mt-4 block text-sm font-medium text-slate-900">Where did you find it?</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as any)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="portal">In the state portal</option>
          <option value="agency_page">On an agency page</option>
          <option value="accountant">From my accountant</option>
          <option value="other">Other</option>
        </select>

        <button
          onClick={save}
          disabled={!date || saving}
          className="mt-6 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save due date"}
        </button>
      </div>
    </div>
  );
}
