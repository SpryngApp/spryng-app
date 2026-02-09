"use client";

import * as React from "react";
import Link from "next/link";
import Tabs from "./Tabs";
import { supabaseBrowser } from "@/lib/supabase/client-browser";

/* ---------- Row types (align to your views) ---------- */
type CheckRegisterRow = {
  id: string;
  company_id: string;
  posted_at: string | null;
  description_raw: string | null;
  direction: "debit" | "credit";
  amount: number | null;
  currency: string | null;
  category?: string | null;
};

type Summary1099Row = {
  company_id: string;
  payee_id: string;
  display_name: string | null;
  total_outgoing: number;
};

type QuarterlyWageRow = {
  id?: string;
  company_id: string;
  transaction_id: string;
  state: string | null;
  quarter: string | null; // e.g., "2025Q4"
  reason: string | null;
  status: "pending" | "reviewed" | "ignored" | string;
  created_at?: string;
};

type TabKey = "Check Register" | "1099 Summary" | "Quarterly Wages";

export default function ReportsPage() {
  const sb = supabaseBrowser();

  const [companyId, setCompanyId] = React.useState<string>("");
  const [tab, setTab] = React.useState<TabKey>("Check Register");
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [checkRows, setCheckRows] = React.useState<CheckRegisterRow[]>([]);
  const [sum1099Rows, setSum1099Rows] = React.useState<Summary1099Row[]>([]);
  const [wageRows, setWageRows] = React.useState<QuarterlyWageRow[]>([]);

  React.useEffect(() => {
    const cid = localStorage.getItem("company_id") ?? "";
    setCompanyId(cid);
  }, []);

  React.useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        if (tab === "Check Register") {
          const { data, error } = await sb
            .from("v_check_register")
            .select("id, company_id, posted_at, description_raw, direction, amount, currency, category")
            .eq("company_id", companyId)
            .order("posted_at", { ascending: false })
            .limit(500);
          if (!cancelled) {
            if (error) setError(error.message);
            setCheckRows((data as CheckRegisterRow[]) ?? []);
          }
        } else if (tab === "1099 Summary") {
          const { data, error } = await sb
            .from("v_1099_summary")
            .select("company_id, payee_id, display_name, total_outgoing")
            .eq("company_id", companyId)
            .order("total_outgoing", { ascending: false })
            .limit(500);
          if (!cancelled) {
            if (error) setError(error.message);
            setSum1099Rows((data as Summary1099Row[]) ?? []);
          }
        } else {
          const { data, error } = await sb
            .from("v_quarterly_wages")
            .select("id, company_id, transaction_id, state, quarter, reason, status, created_at")
            .eq("company_id", companyId)
            .order("created_at", { ascending: false })
            .limit(500);
          if (!cancelled) {
            if (error) setError(error.message);
            setWageRows((data as QuarterlyWageRow[]) ?? []);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Unexpected error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [companyId, tab, sb]);

  const tabs: TabKey[] = ["Check Register", "1099 Summary", "Quarterly Wages"];

  function downloadCSV() {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (tab === "Check Register") {
      headers = ["Date", "Description", "Direction", "Amount", "Currency", "Category"];
      rows = checkRows
        .slice()
        .reverse()
        .map((r) => [
          r.posted_at ?? "",
          clean(r.description_raw),
          r.direction,
          formatMoney(Number(r.amount ?? 0)),
          r.currency ?? "USD",
          r.category ?? "",
        ]);
    } else if (tab === "1099 Summary") {
      headers = ["Payee", "Total Outgoing (YTD)"];
      rows = sum1099Rows.map((r) => [r.display_name ?? "(Unnamed payee)", formatMoney(r.total_outgoing || 0)]);
    } else {
      headers = ["Quarter", "State", "Status", "Reason", "Transaction Id", "Created"];
      rows = wageRows.map((r) => [
        r.quarter ?? "",
        r.state ?? "",
        r.status ?? "",
        r.reason ?? "",
        r.transaction_id,
        r.created_at ?? "",
      ]);
    }

    const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
    const bom = "\uFEFF";
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = now.toTimeString().slice(0, 5).replace(":", "");
    const base =
      tab === "Check Register"
        ? "check_register"
        : tab === "1099 Summary"
        ? "1099_summary"
        : "quarterly_wages";
    const filename = `elevyn_${base}_${date}_${time}.csv`;

    const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!companyId) {
    return (
      <main className="min-h-screen bg-bg text-text p-6">
        <div className="max-w-6xl mx-auto">
          <header className="mb-4">
            <h1 className="text-2xl font-semibold">Reports</h1>
            <p className="text-sm text-subtle">Create or select a workspace to view reports.</p>
          </header>
          <div className="rounded-2xl border border-line bg-surface p-6">
            <p className="text-sm text-subtle mb-4">You don’t have a selected workspace.</p>
            <div className="flex gap-3">
              <Link href="/quiz" className="rounded-xl bg-primary text-black px-4 py-2 text-sm font-semibold">
                Run readiness quiz
              </Link>
              <Link href="/(dashboard)" className="rounded-xl border border-line px-4 py-2 text-sm text-subtle hover:text-text">
                Back to Overview
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg text-text p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="mb-2">
          <h1 className="text-2xl font-semibold">Reports</h1>
          <p className="text-sm text-subtle">Exports and snapshots to make decisions with clarity.</p>
        </header>

        <Tabs tabs={tabs} active={tab} onChange={(k) => setTab(k as TabKey)} />

        <div className="flex items-center justify-between">
          <p className="text-xs text-subtle">
            {tab === "Check Register" && `${checkRows.length} transactions`}
            {tab === "1099 Summary" && `${sum1099Rows.length} payees`}
            {tab === "Quarterly Wages" && `${wageRows.length} candidates`}
          </p>
          <button
            onClick={downloadCSV}
            className="rounded-xl border border-line px-3 py-2 text-sm text-subtle hover:text-text"
          >
            Download CSV
          </button>
        </div>

        <section className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
          {loading ? (
            <TableSkeleton rows={6} />
          ) : error ? (
            <div className="text-sm text-red-300">Error: {error}</div>
          ) : tab === "Check Register" ? (
            <TableCheckRegister rows={checkRows} />
          ) : tab === "1099 Summary" ? (
            <Table1099 rows={sum1099Rows} />
          ) : (
            <TableQuarterlyWages rows={wageRows} />
          )}
        </section>
      </div>
    </main>
  );
}

/* ---------------- Tables ---------------- */

function TableCheckRegister({ rows }: { rows: CheckRegisterRow[] }) {
  if (!rows.length) return <Empty text="No transactions yet. Upload a CSV to generate your register." />;
  return (
    <div className="overflow-auto rounded-xl border border-line">
      <table className="min-w-full text-sm">
        <thead className="bg-[#0f131b] text-subtle">
          <tr className="text-left">
            <Th>Date</Th>
            <Th>Description</Th>
            <Th>Direction</Th>
            <Th className="text-right">Amount</Th>
            <Th>Currency</Th>
            <Th>Category</Th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 200).map((r) => (
            <tr key={r.id} className="border-t border-line">
              <Td>{r.posted_at ?? "—"}</Td>
              <Td>{clean(r.description_raw)}</Td>
              <Td className={r.direction === "debit" ? "text-red-300" : "text-[#3AD0A1]"}>{r.direction}</Td>
              <Td className="text-right">{formatMoney(Number(r.amount ?? 0))}</Td>
              <Td>{r.currency ?? "USD"}</Td>
              <Td>{r.category ?? "—"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 200 && (
        <div className="p-3 text-xs text-subtle border-t border-line">Showing 200. Use “Download CSV” for full data.</div>
      )}
    </div>
  );
}

function Table1099({ rows }: { rows: Summary1099Row[] }) {
  if (!rows.length) return <Empty text="No payee totals yet. Link payees to transactions or upload data with payees." />;
  return (
    <div className="overflow-auto rounded-xl border border-line">
      <table className="min-w-full text-sm">
        <thead className="bg-[#0f131b] text-subtle">
          <tr className="text-left">
            <Th>Payee</Th>
            <Th className="text-right">Total Outgoing (YTD)</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.payee_id} className="border-t border-line">
              <Td>{p.display_name ?? "(Unnamed payee)"}</Td>
              <Td className="text-right">{formatMoney(p.total_outgoing || 0)}</Td>
              <Td>
                {p.total_outgoing >= 600 ? (
                  <span className="rounded-md border border-yellow-300/40 text-yellow-300 px-2 py-0.5 text-xs">
                    1099 Candidate
                  </span>
                ) : (
                  <span className="text-xs text-subtle">—</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableQuarterlyWages({ rows }: { rows: QuarterlyWageRow[] }) {
  if (!rows.length) return <Empty text="No potential UI wages yet. Upload transactions to analyze." />;
  return (
    <div className="overflow-auto rounded-xl border border-line">
      <table className="min-w-full text-sm">
        <thead className="bg-[#0f131b] text-subtle">
          <tr className="text-left">
            <Th>Quarter</Th>
            <Th>State</Th>
            <Th>Status</Th>
            <Th>Reason</Th>
            <Th>Transaction Id</Th>
            <Th>Created</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.transaction_id}-${r.quarter}`} className="border-t border-line">
              <Td>{r.quarter ?? "—"}</Td>
              <Td>{r.state ?? "—"}</Td>
              <Td>{r.status}</Td>
              <Td>{r.reason ?? "—"}</Td>
              <Td className="text-xs">{r.transaction_id}</Td>
              <Td>{r.created_at ?? "—"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- UI bits ---------------- */

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-3 py-2 font-medium ${className}`}>{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
function Empty({ text }: { text: string }) {
  return <div className="text-sm text-subtle">{text}</div>;
}
function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 rounded-lg bg-[#10141c] border border-line animate-pulse" />
      ))}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function clean(v: string | null): string {
  return (v || "").replace(/\s+/g, " ").trim();
}
function formatMoney(n: number): string {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  return `${sign}$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}
