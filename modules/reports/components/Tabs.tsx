"use client";
import * as React from "react";
export default function Tabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (k:string)=>void; }) {
  return (
    <div className="flex gap-2 border-b border-[#252A36] mb-4">
      {tabs.map(t => (
        <button key={t}
          className={`px-4 py-2 text-sm ${active===t ? "text-[#3AD0A1] border-b-2 border-[#3AD0A1]" : "text-[#A7B0C0]"}`}
          onClick={()=>onChange(t)}>{t}</button>
      ))}
    </div>
  );
}
