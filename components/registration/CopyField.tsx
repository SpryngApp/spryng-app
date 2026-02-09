"use client";

import { useState } from "react";
import { toast } from "sonner";

export function CopyField({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | null | undefined;
  helper?: string;
}) {
  const [copied, setCopied] = useState(false);
  const display = value ?? "";

  async function onCopy() {
    if (!display) return;
    await navigator.clipboard.writeText(display);
    setCopied(true);
    toast.success("Copied", { description: label });
    setTimeout(() => setCopied(false), 900);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 truncate text-sm font-medium text-slate-900">{display || "—"}</p>
          {helper ? <p className="mt-1 text-xs text-slate-600">{helper}</p> : null}
        </div>
        <button
          type="button"
          onClick={onCopy}
          disabled={!display}
          className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
