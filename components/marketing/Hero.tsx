import Link from "next/link";

export default function Hero() {
  return (
    <section className="e-container py-16 md:py-24">
      <div className="e-badge">Employer Readiness Software™</div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        {/* Copy */}
        <div>
          <h1 className="text-[40px] leading-[1.1] md:text-[48px]">
            You’re already paying people. <br /> Now let’s make it official.
          </h1>

          <p className="mt-5 text-[16px] max-w-[42ch]" style={{color:"var(--muted)"}}>
            Pay helpers the right way, stay audit-safe, and prepare to hire your first employee — so
            your business can grow without the stress.
          </p>

          <div className="mt-8 flex gap-10">
            <Link href="/quiz" className="e-btn e-btn-primary">Start My Employer Path</Link>
            <a href="#how" className="e-btn e-btn-ghost">See How It Works</a>
          </div>

          <p className="mt-4 text-[12px]" style={{color:"var(--muted)"}}>
            No overwhelm. No judgment. Just your next clear step.
          </p>

          {/* Trust strip (subtle placeholders you can replace with real logos later) */}
          <div className="mt-10 flex items-center gap-10">
            <span className="text-sm" style={{color:"var(--muted)"}}>Works with</span>
            <div className="h-6 w-24 e-card" />
            <div className="h-6 w-24 e-card" />
            <div className="h-6 w-24 e-card" />
          </div>
        </div>

        {/* Product preview card */}
        <div className="e-card e-shadow p-6">
          <div className="h-4 w-40 rounded-md" style={{background:"#EDEDED"}} />
          <div className="mt-4 h-10 rounded-md" style={{background:"#F2F2F2"}} />
          <div className="mt-3 h-10 rounded-md" style={{background:"#F2F2F2"}} />
          <div className="mt-3 h-10 rounded-md" style={{background:"#F2F2F2"}} />
          <div className="mt-6 h-9 w-40 rounded-md" style={{background:"var(--accent)"}} />
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="h-20 rounded-md" style={{background:"#F2F2F2"}} />
            <div className="h-20 rounded-md" style={{background:"#F2F2F2"}} />
            <div className="h-20 rounded-md" style={{background:"#F2F2F2"}} />
          </div>
        </div>
      </div>
    </section>
  );
}
