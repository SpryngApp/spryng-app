// app/app/tracking/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type Entry = {
  id: string;
  payee_name: string;
  payee_type: string | null;
  purpose: string | null;
  payment_method: string | null;
  amount_cents: number;
  currency: string;
  paid_at: string; // YYYY-MM-DD
  proof_url: string | null;
  notes: string | null;
  created_at: string;
};

export default function TrackingPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [payeeName, setPayeeName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAt, setPaidAt] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [purpose, setPurpose] = useState("");
  const [method, setMethod] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => payeeName.trim().length > 1 && amount.trim().length > 0, [payeeName, amount]);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/tracking?limit=200");
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setErr(json?.error?.message || "Could not load tracking entries.");
        setLoading(false);
        return;
      }
      setEntries(json.entries || []);
      setLoading(false);
    } catch {
      setErr("Could not load tracking entries.");
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;

    setErr(null);
    setSaving(true);

    try {
      const res = await fetch("/api/tracking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          payee_name: payeeName.trim(),
          amount: amount.trim(),
          paid_at: paidAt,
          purpose: purpose.trim() || null,
          payment_method: method.trim() || null,
          proof_url: proofUrl.trim() || null,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json?.ok) {
        setErr(json?.error?.message || "Could not save entry.");
        setSaving(false);
        return;
      }

      const entry = json.entry as Entry;
      setEntries((prev) => [entry, ...prev]);
      setPayeeName("");
      setAmount("");
      setPurpose("");
      setMethod("");
      setProofUrl("");
      setSaving(false);
    } catch {
      setErr("Could not save entry.");
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Outside-payroll tracking</h1>
            <p className="mt-2 text-sm text-slate-600">
              Log who you paid, what it was for, and keep proof links in one place.
            </p>
          </div>

          <a
            href="/api/tracking?format=csv"
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            Export CSV
          </a>
        </div>

        <form onSubmit={onCreate} className="mt-8 grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-800">Payee</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              placeholder="Example: Jordan Smith"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-800">Amount</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="250.00"
              inputMode="decimal"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-800">Paid date</label>
            <input
              type="date"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-800">Method</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="Zelle"
            />
          </div>

          <div className="sm:col-span-1">
            <label className="text-sm font-medium text-slate-800">Proof link</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="sm:col-span-6">
            <label className="text-sm font-medium text-slate-800">Purpose (optional)</label>
            <input
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Example: Cleaning job support / Admin help / Design work"
            />
          </div>

          {err && (
            <div className="sm:col-span-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="sm:col-span-6 flex gap-3">
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add entry"}
            </button>
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              Refresh
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Recent entries</h2>

        {loading ? (
          <p className="mt-4 text-sm text-slate-600">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No entries yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-separate border-spacing-0 text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="border-b border-slate-200 py-2 pr-4">Date</th>
                  <th className="border-b border-slate-200 py-2 pr-4">Payee</th>
                  <th className="border-b border-slate-200 py-2 pr-4">Purpose</th>
                  <th className="border-b border-slate-200 py-2 pr-4">Method</th>
                  <th className="border-b border-slate-200 py-2 pr-4 text-right">Amount</th>
                  <th className="border-b border-slate-200 py-2 pr-0">Proof</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="text-slate-800">
                    <td className="border-b border-slate-100 py-2 pr-4">{e.paid_at}</td>
                    <td className="border-b border-slate-100 py-2 pr-4">{e.payee_name}</td>
                    <td className="border-b border-slate-100 py-2 pr-4">{e.purpose ?? "—"}</td>
                    <td className="border-b border-slate-100 py-2 pr-4">{e.payment_method ?? "—"}</td>
                    <td className="border-b border-slate-100 py-2 pr-4 text-right">
                      {(e.amount_cents / 100).toFixed(2)} {e.currency}
                    </td>
                    <td className="border-b border-slate-100 py-2 pr-0">
                      {e.proof_url ? (
                        <a className="text-slate-900 underline" href={e.proof_url} target="_blank" rel="noreferrer">
                          Link
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
