import Link from "next/link";

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h2 className="font-semibold tracking-tight" style={{ fontSize: "var(--h2)" }}>
          Start with the tools you need right now.
        </h2>

        <div className="mt-6 rounded-[16px] border border-[var(--line)] bg-white p-6 md:p-8 shadow-[var(--shadow-md)] max-w-[680px]">
          <div className="text-xs opacity-60 mb-2">PLAN</div>
          <h3 className="text-xl font-semibold">Employer-in-Progress</h3>
          <div className="mt-2 flex items-end gap-1">
            <div className="text-4xl font-semibold">$39</div>
            <div className="opacity-70">/mo</div>
          </div>

          <ul className="mt-6 space-y-2 text-[15px] leading-6 opacity-90">
            <li>• Payment analysis & wage classification guidance</li>
            <li>• Employer registration support</li>
            <li>• Transaction tracking & document organization</li>
            <li>• UI & 1099 prep support</li>
            <li>• First hire planning milestones</li>
            <li>• Growth progress dashboard</li>
          </ul>

          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-[7px] bg-[var(--primary)] px-5 py-3 text-[15px] font-semibold text-[var(--text)] hover:brightness-95"
            >
              Start My Employer Path
            </Link>
            <span className="text-sm opacity-70">Cancel anytime.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
