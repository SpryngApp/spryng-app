"use client";
import * as React from "react";

export default function PayeeModal({
  open, onClose, companyId, txn, onLinked
}: { open: boolean; onClose: ()=>void; companyId: string; txn: any; onLinked: ()=>void; }) {
  const [name, setName] = React.useState("");
  const [kind, setKind] = React.useState<"individual"|"business"|"unknown">("unknown");
  const [service, setService] = React.useState("");

  React.useEffect(() => { if (txn) setName(txn.raw_name ?? ""); }, [txn]);
  if (!open || !txn) return null;

  async function save() {
    const res = await fetch("/api/payees/createOrLink", {
      method: "POST",
      body: JSON.stringify({
        companyId, transactionId: txn.id, name, kind, serviceProvided: service
      })
    });
    const json = await res.json();
    if (json.ok) { onLinked(); onClose(); } else alert(json.error);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl bg-[#151922] border border-[#252A36] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Link Payee / Worker</h3>
          <button onClick={onClose} className="text-[#A7B0C0]">✕</button>
        </div>
        <label className="block text-sm mb-2">Payee Name</label>
        <input className="w-full rounded-xl bg-[#11151d] border border-[#252A36] px-3 py-2 text-sm mb-3"
               value={name} onChange={e=>setName(e.target.value)} placeholder="Jordan Smith" />
        <div className="flex gap-3 mb-3">
          {(["individual","business","unknown"] as const).map(k => (
            <button key={k}
              className={`px-3 py-2 rounded-xl border text-sm ${kind===k ? "border-[#3AD0A1] text-[#3AD0A1]" : "border-[#252A36] text-[#A7B0C0]"}`}
              onClick={()=>setKind(k)}>{k}</button>
          ))}
        </div>
        <label className="block text-sm mb-2">Service Provided</label>
        <input className="w-full rounded-xl bg-[#11151d] border border-[#252A36] px-3 py-2 text-sm"
               value={service} onChange={e=>setService(e.target.value)} placeholder="Cleaning, Install, Marketing…" />
        <div className="flex justify-end gap-3 pt-4">
          <button className="px-3 py-2 text-sm text-[#A7B0C0]" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#3AD0A1] text-black" onClick={save}>Save & Link</button>
        </div>
      </div>
    </div>
  );
}
