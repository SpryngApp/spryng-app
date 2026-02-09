"use client";
import { INDUSTRIES } from "@/lib/industries";

export default function IndustryCallouts() {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="text-xl font-semibold">Built for real businesses</h2>
      <p className="text-slate-600 text-sm mt-1">
        Elevyn speaks your language—from costs and refunds to compliance—without the jargon.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {INDUSTRIES.map((ind) => (
          <div key={ind.key} className="rounded-xl border p-4 hover:shadow-sm transition">
            <div className="text-2xl">{ind.heroEmoji || "✨"}</div>
            <div className="mt-2 font-medium">{ind.name}</div>
            <div className="text-sm text-slate-600 mt-1">{ind.headline}</div>
            <div className="mt-3">
              <div className="text-xs text-slate-500">We recognize:</div>
              <ul className="text-xs text-slate-700 mt-1 list-disc ml-4 space-y-0.5">
                {ind.examples.slice(0,4).map((ex)=> <li key={ex}>{ex}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 text-sm">
        Don’t see your industry? <span className="underline cursor-pointer">Tell us</span> and we’ll tune Elevyn to your workflow.
      </div>
    </section>
  );
}
