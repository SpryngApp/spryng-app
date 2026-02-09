export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      price: "$0",
      period: "Free",
      tagline: "Try Elevyn with sample data or import a CSV.",
      features: [
        "Manual CSV import",
        "Transaction categorization (basic)",
        "1099 threshold alerts (≥$600)",
        "Check Register export (CSV)",
        "1 company, 1 user"
      ],
      cta: { label: "Start free", href: "/(dashboard)" }
    },
    {
      name: "Build",
      price: "$29",
      period: "/mo",
      tagline: "Turn scattered payments into a clear path to hiring.",
      features: [
        "Everything in Starter",
        "Receipt storage + OCR matching",
        "UI wage candidates by quarter",
        "W-9 / COI document hub",
        "Goals: “Collect all W-9s”"
      ],
      highlight: true,
      cta: { label: "Choose Build", href: "/(dashboard)" }
    },
    {
      name: "Grow",
      price: "$79",
      period: "/mo",
      tagline: "Be employer-ready and integrate partners when you’re set.",
      features: [
        "Everything in Build",
        "Risk rule tuning (per industry)",
        "Quarterly wages report",
        "Partner handoffs (Payroll / COI)",
        "Priority support"
      ],
      cta: { label: "Choose Grow", href: "/(dashboard)" }
    }
  ];

  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary" />
            <span className="font-semibold tracking-tight">Elevyn</span>
          </div>
          <a href="/(dashboard)" className="rounded-xl bg-primary text-black px-4 py-2 text-sm font-semibold">
            Sign in
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="max-w-2xl mb-10">
          <h1 className="text-4xl font-semibold leading-tight">Simple pricing. Clear value.</h1>
          <p className="text-subtle mt-3 text-lg">
            Start free. Upgrade when you’re ready to organize receipts, manage documents, and move toward payroll with confidence.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-2xl border p-6 shadow-soft ${
                t.highlight ? "border-primary/40 bg-[#121821]" : "border-line bg-surface"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">{t.name}</h3>
                {t.highlight && (
                  <span className="text-xs rounded-md bg-primary/10 text-primary px-2 py-1">Most popular</span>
                )}
              </div>
              <div className="flex items-end gap-1">
                <div className="text-3xl font-semibold">{t.price}</div>
                <div className="text-subtle mb-1">{t.period}</div>
              </div>
              <p className="text-sm text-subtle mt-2">{t.tagline}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={t.cta.href}
                className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${
                  t.highlight
                    ? "bg-primary text-black"
                    : "border border-line text-subtle hover:text-text"
                }`}
              >
                {t.cta.label}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-line bg-surface p-6">
            <h4 className="font-semibold mb-2">What’s included in every plan?</h4>
            <p className="text-sm text-subtle">
              Secure workspace, exportable reports, and a guided path toward employer status—without jargon.
            </p>
          </div>
          <div className="rounded-xl border border-line bg-surface p-6">
            <h4 className="font-semibold mb-2">Do I need payroll now?</h4>
            <p className="text-sm text-subtle">
              No. Elevyn is the **step before** payroll. We help you understand obligations, collect documents, and
              prepare to hire the right way.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
