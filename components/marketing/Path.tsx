export default function Path() {
  const Card = ({
    step,
    title,
    children,
  }: { step: string; title: string; children: React.ReactNode }) => (
    <div className="rounded-[var(--radius)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-sm)] hover:-translate-y-[2px] hover:shadow-[var(--shadow-md)] transition-transform">
      <div className="mb-3 inline-flex items-center gap-2 text-[12px] font-semibold">
        <span className="h-5 w-5 inline-flex items-center justify-center rounded-[6px] bg-[var(--primary)] text-[var(--text)]">
          {step}
        </span>
        STEP {step}
      </div>
      <h3 className="text-[var(--h3)] font-semibold leading-tight mb-1">{title}</h3>
      <p className="text-[15px] leading-6 opacity-80">{children}</p>
    </div>
  );

  return (
    <section id="how" className="py-16 md:py-24 bg-[var(--bg)]">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <h2 className="font-semibold tracking-tight" style={{ fontSize: "var(--h2)" }}>
          The Employer Readiness Path
        </h2>
        <p className="mt-2 max-w-[70ch] opacity-80">
          A clear, guided path to paying people the right way and stepping confidently into employer status — at your pace.
        </p>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <Card step="1" title="Clarify Your Situation">
            Tell us who helps you, how often, and how you currently pay them — even if it’s informal or occasional.
          </Card>
          <Card step="2" title="Analyze Payments">
            We review your payments and identify which ones your state may consider wages — so you know exactly what matters and why.
          </Card>
          <Card step="3" title="Register & Track Confidently">
            When the timing is right, we guide you through registering as an employer and tracking payments correctly — even before payroll.
          </Card>
          <Card step="4" title="Prepare to Hire Your First Employee">
            Set hiring goals, understand costs, and get a realistic timeline for your first official hire — with confidence.
          </Card>
        </div>

        <p className="text-center mt-8 text-sm opacity-70">No guesswork. No pressure. Just direction.</p>
      </div>
    </section>
  );
}
