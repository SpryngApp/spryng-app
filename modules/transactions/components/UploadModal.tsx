"use client";
import * as React from "react";
import { uploadCsvApi } from "../api/upload";

export default function UploadModal({
  open, onClose, companyId, onDone
}: { open: boolean; onClose: ()=>void; companyId: string; onDone: ()=>void; }) {
  const [file, setFile] = React.useState<File | null>(null);
  if (!open) return null;

  async function submit() {
    if (!file || !companyId) return;
    const buf = await file.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    const res = await uploadCsvApi({ companyId, fileName: file.name, fileBase64: base64 });
    if (res.ok) { onDone(); onClose(); }
    else alert(res.error ?? "Upload failed");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl bg-[#151922] border border-[#252A36] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Upload CSV</h3>
          <button onClick={onClose} className="text-[#A7B0C0]">✕</button>
        </div>
        <input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0] ?? null)} className="mb-4" />
        <div className="flex justify-end gap-3">
          <button className="px-3 py-2 text-sm text-[#A7B0C0]" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 text-sm font-semibold rounded-xl bg-[#3AD0A1] text-black" onClick={submit} disabled={!file}>Upload</button>
        </div>
      </div>
    </div>
  );
}
