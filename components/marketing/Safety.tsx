export default function Safety() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <h2 className="text-2xl sm:text-3xl font-semibold">Stay audit-safe while you grow.</h2>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          "Know exactly when a payment counts as wages",
          "Track records for quarterly UI and 1099 filings",
          "Avoid back-tax issues and surprise penalties"
        ].map((text) => (
          <div
            key={text}
            className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-sm"
          >
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}
