export default function Milestone() {
  return (
    <section className="py-16 md:py-24 bg-[var(--bg)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h2 className="font-semibold tracking-tight mb-6" style={{ fontSize: "var(--h2)" }}>
          When you officially register as an employer — we celebrate it.
        </h2>

        <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-sm)] flex items-center justify-between">
          <div>
            <div className="text-xs opacity-60 mb-1">BADGE UNLOCK</div>
            <div className="font-semibold">Employer — Level 1</div>
          </div>
          <button
            type="button"
            aria-label="Confetti moment"
            className="rounded-[7px] bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:brightness-95"
          >
            Confetti moment 🎉
          </button>
        </div>
      </div>
    </section>
  );
}
