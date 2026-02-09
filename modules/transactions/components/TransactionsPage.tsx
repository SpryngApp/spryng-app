"use client";

import * as React from "react";
import { supabaseBrowser } from "@/lib/supabase/client-browser"; // fixed alias
import { fmtMoney } from "../lib/formatters";
import Table from "./Table";
import UploadModal from "./UploadModal";
import PayeeModal from "./PayeeModal";

type TxnRow = {
  id: string;
  posted_at: string | null;
  raw_name: string | null;
  description_raw: string | null;
  amount: number | null;
  direction: "debit" | "credit";
};

export default function TransactionsPage() {
  const sb = supabaseBrowser();

  const [companyId, setCompanyId] = React.useState<string>("");
  const [rows, setRows] = React.useState<TxnRow[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [showUpload, setShowUpload] = React.useState(false);
  const [activeTxn, setActiveTxn] = React.useState<TxnRow | null>(null);
  const [showPayee, setShowPayee] = React.useState(false);

  React.useEffect(() => {
    // TODO: hydrate from a real session/profile; temporary localStorage helper:
    setCompanyId(localStorage.getItem("company_id") ?? "");
  }, []);

  const load = React.useCallback(async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await sb
        .from("transactions")
        .select("id, posted_at, raw_name, description_raw, amount, direction")
        .eq("company_id", companyId)
        .order("posted_at", { ascending: false })
        .limit(200);

      if (error) {
        setError(error.message);
        setRows([]);
      } else {
        setRows((data as TxnRow[]) ?? []);
      }
    } catch (e: any) {
      setError(e?.message ?? "Unexpected error loading transactions.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, sb]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  function handleLinkPayee(txn: TxnRow) {
    setActiveTxn(txn);
    setShowPayee(true);
  }

  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <p className="text-sm text-subtle">
              Imported transactions, ready to review and tag.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="rounded-xl border border-line px-4 py-2 text-sm text-subtle hover:text-text"
              onClick={load}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
            <button
              className="rounded-xl bg-primary text-black px-4 py-2 text-sm font-semibold"
              onClick={() => setShowUpload(true)}
            >
              Upload CSV
            </button>
          </div>
        </header>

        {!companyId ? (
          <div className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-base font-semibold mb-1">No workspace selected</h2>
            <p className="text-sm text-subtle">
              Create or select a workspace to manage transactions.
            </p>
          </div>
        ) : loading ? (
          <SkeletonList rows={8} />
        ) : error ? (
          <div className="rounded-2xl border border-red-400/30 bg-[#1a1010] p-4 text-red-300">
            <div className="text-sm font-semibold mb-1">Failed to load</div>
            <div className="text-sm">{error}</div>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-line bg-surface p-6">
            <p className="text-sm text-subtle">No transactions yet. Upload a CSV to get started.</p>
            <div className="mt-4">
              <button
                className="rounded-xl bg-primary text-black px-4 py-2 text-sm font-semibold"
                onClick={() => setShowUpload(true)}
              >
                Upload CSV
              </button>
            </div>
          </div>
        ) : (
          <Table
            rows={rows}
            money={(n: number) => fmtMoney(n, "USD")}
            onLinkPayee={handleLinkPayee}
          />
        )}
      </div>

      {/* Modals */}
      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        companyId={companyId}
        onDone={load}
      />
      <PayeeModal
        open={showPayee}
        onClose={() => setShowPayee(false)}
        companyId={companyId}
        txn={activeTxn}
        onLinked={load}
      />
    </main>
  );
}

/* ---------- Lightweight skeleton ---------- */
function SkeletonList({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 rounded-xl bg-[#10141c] border border-line animate-pulse"
        />
      ))}
    </div>
  );
}
