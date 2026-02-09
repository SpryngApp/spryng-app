import Link from "next/link";

export default function FinalCta() {
  return (
    <section className="py-16 md:py-24 bg-[var(--bg)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h2 className="font-semibold tracking-tight" style={{ fontSize: "var(--h2)" }}>
          You&apos;re already doing the work. Let’s structure your business to support your growth.
        </h2>
        <div className="mt-6">
          <Link
            href="/quiz"
            className="inline-flex items-center rounded-[7px] bg-[var(--primary)] px-5 py-3 text-[15px] font-semibold text-[var(--text)] hover:brightness-95"
          >
            Begin Your Path →
          </Link>
        </div>
      </div>
    </section>
  );
}
