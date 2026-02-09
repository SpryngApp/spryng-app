"use client";
import * as React from "react";

export default function Table({
  rows, money, onLinkPayee
}: { rows: any[]; money: (n:number)=>string; onLinkPayee: (r:any)=>void }) {
  return (
    <div className="rounded-xl border border-[#252A36] bg-[#151922] shadow-soft overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#0c1018] text-[#A7B0C0]">
          <tr>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Payee</th>
            <th className="px-4 py-3 text-left">Description</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-[#252A36] hover:bg-[#121723]">
              <td className="px-4 py-3">{r.posted_at}</td>
              <td className="px-4 py-3">{r.raw_name ?? "—"}</td>
              <td className="px-4 py-3 text-[#A7B0C0]">{r.description_raw}</td>
              <td className={`px-4 py-3 text-right ${r.direction === "outflow" ? "text-red-300" : "text-[#3AD0A1]"}`}>
                {money(r.amount)}
              </td>
              <td className="px-4 py-3 text-right">
                <button className="rounded-xl border border-[#252A36] px-3 py-2 text-xs hover:border-[#3AD0A1]"
                        onClick={() => onLinkPayee(r)}>Link Payee</button>
              </td>
            </tr>
          ))}
          {!rows.length && (
            <tr><td colSpan={5} className="px-4 py-8 text-center text-[#A7B0C0]">No transactions yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
