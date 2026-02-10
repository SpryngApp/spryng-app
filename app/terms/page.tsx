// app/terms/page.tsx
import HeaderNav from "@/components/marketing/HeaderNav";
import SpryngFooter from "@/components/marketing/SpryngFooter";

export const metadata = {
  title: "Terms — Spryng",
  description:
    "Spryng terms of service: product scope, acceptable use, disclaimers, and limitations.",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Section({
  title,
  children,
  id,
}: {
  title: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  const effectiveDate = "February 9, 2026";

  return (
    <main className="bg-white text-slate-900">
      <HeaderNav
        items={[
          { label: "Pricing", href: "/pricing" },
          { label: "Blog", href: "/blog" },
          { label: "Resources", href: "/resources" },
          { label: "Quiz", href: "/quiz" },
        ]}
      />

      {/* Hero */}
      <section className="border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="container py-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
            <span className="inline-flex h-2 w-2 rounded-full bg-slate-900" />
            <span>Terms</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Terms of service
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            These terms explain how Spryng works, what we provide, and what we expect from users.
            We’ve written this in plain language, but it’s still a legal agreement.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill>Plain language</Pill>
            <Pill>Not legal advice</Pill>
            <Pill>Product scope</Pill>
            <Pill>Acceptable use</Pill>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Effective date:{" "}
            <span className="font-semibold text-slate-700">{effectiveDate}</span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <div className="space-y-10">
            <Section title="Agreement to these terms" id="agreement">
              <p>
                By accessing or using Spryng, you agree to these Terms of Service and our{" "}
                <a
                  className="underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                  href="/privacy"
                >
                  Privacy Policy
                </a>
                . If you do not agree, do not use the service.
              </p>
            </Section>

            <Section title="What Spryng provides" id="service">
              <p>
                Spryng is a B2B SaaS platform that helps small businesses:
              </p>
              <ul className="list-disc pl-5">
                <li>Understand when they may need to register as an employer (state-aware guidance).</li>
                <li>Follow step-by-step checklists and save proof documents.</li>
                <li>Track non-payroll payments and maintain audit-ready records.</li>
                <li>Stay aware of reporting and filing deadlines (where enabled).</li>
              </ul>
              <p className="text-slate-600">
                Spryng provides guidance and organization tools — not professional advice.
              </p>
            </Section>

            <Section title="Not legal, tax, or accounting advice" id="disclaimer">
              <p>
                Spryng is not a law firm, accounting firm, or tax advisor. Nothing in Spryng (including
                checklists, explanations, due date suggestions, or “what to save” prompts) is legal, tax,
                or accounting advice.
              </p>
              <p>
                You are responsible for confirming requirements for your specific situation and, where
                appropriate, consulting qualified professionals.
              </p>
            </Section>

            <Section title="Eligibility and accounts" id="accounts">
              <p>
                You must provide accurate information when creating an account and keep your login credentials
                secure. You are responsible for any activity conducted under your account.
              </p>
              <p className="text-slate-600">
                If you believe your account has been compromised, contact us promptly.
              </p>
            </Section>

            <Section title="Acceptable use" id="acceptable-use">
              <p>You agree not to:</p>
              <ul className="list-disc pl-5">
                <li>Use Spryng to violate laws or regulations.</li>
                <li>Attempt to access data not belonging to you or your workspace.</li>
                <li>Reverse engineer, disrupt, or overload the service.</li>
                <li>Upload malware or content intended to compromise security.</li>
                <li>Use Spryng in a way that interferes with other users.</li>
              </ul>
            </Section>

            <Section title="Your content and uploads" id="content">
              <p>
                You retain ownership of the information and documents you upload. You grant Spryng a limited
                license to host, process, and display that content solely to provide the service.
              </p>
              <p className="text-slate-600">
                You are responsible for ensuring you have the right to upload and store any content you submit.
              </p>
            </Section>

            <Section title="Third-party services" id="third-party">
              <p>
                Spryng may link to third-party sites (such as state registration portals) and may rely on third-party
                providers for infrastructure (such as authentication). We are not responsible for third-party sites,
                products, or services, and your use of them is subject to their terms.
              </p>
            </Section>

            <Section title="Availability and changes" id="changes">
              <p>
                We may modify, suspend, or discontinue parts of Spryng to improve the product, comply with law,
                or address security and operational needs. We may also update these Terms from time to time.
              </p>
              <p className="text-slate-600">
                If changes are material, we’ll make reasonable efforts to notify you (for example, in-app or via email).
              </p>
            </Section>

            <Section title="Fees and billing" id="billing">
              <p>
                Spryng may offer free and paid plans. If you subscribe to a paid plan, you agree to pay the fees
                presented at checkout and any applicable taxes.
              </p>
              <p className="text-slate-600">
                Subscription terms, renewal, and cancellation details are presented during purchase and may vary
                by plan.
              </p>
            </Section>

            <Section title="Limitation of liability" id="liability">
              <p>
                To the fullest extent permitted by law, Spryng and its affiliates will not be liable for indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenue, arising
                from your use of the service.
              </p>
              <p className="text-slate-600">
                Spryng is provided “as is” and “as available.” We do not guarantee specific outcomes or that the service
                will meet every regulatory requirement for every business scenario.
              </p>
            </Section>

            <Section title="Indemnification" id="indemnification">
              <p>
                You agree to defend and indemnify Spryng from claims arising out of your use of the service, your
                content, or your violation of these terms or applicable laws.
              </p>
            </Section>

            <Section title="Termination" id="termination">
              <p>
                You may stop using Spryng at any time. We may suspend or terminate access if we reasonably believe
                you have violated these Terms, created risk for the service, or engaged in abusive behavior.
              </p>
            </Section>

            <Section title="Contact" id="contact">
              <p>
                For questions about these Terms, email{" "}
                <a
                  className="underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                  href="mailto:support@spryng.com"
                >
                  support@spryng.com
                </a>
                .
              </p>
              <p className="text-xs text-slate-500">
                (If you don’t have this inbox set up yet, change the address now — but keep the pattern.)
              </p>
            </Section>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold text-slate-900">Plain-language reminder</div>
              <div className="mt-2 text-sm text-slate-700">
                Spryng helps you follow state-aware steps and keep records organized.
                You’re still the decision-maker — and for legal/tax questions, you should consult a professional.
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">On this page</div>
              <nav className="mt-3 grid gap-2 text-sm">
                <a className="text-slate-700 hover:text-slate-900" href="#agreement">Agreement</a>
                <a className="text-slate-700 hover:text-slate-900" href="#service">What Spryng provides</a>
                <a className="text-slate-700 hover:text-slate-900" href="#disclaimer">Not legal advice</a>
                <a className="text-slate-700 hover:text-slate-900" href="#accounts">Accounts</a>
                <a className="text-slate-700 hover:text-slate-900" href="#acceptable-use">Acceptable use</a>
                <a className="text-slate-700 hover:text-slate-900" href="#content">Your content</a>
                <a className="text-slate-700 hover:text-slate-900" href="#third-party">Third parties</a>
                <a className="text-slate-700 hover:text-slate-900" href="#changes">Changes</a>
                <a className="text-slate-700 hover:text-slate-900" href="#billing">Billing</a>
                <a className="text-slate-700 hover:text-slate-900" href="#liability">Liability</a>
                <a className="text-slate-700 hover:text-slate-900" href="#termination">Termination</a>
                <a className="text-slate-700 hover:text-slate-900" href="#contact">Contact</a>
              </nav>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Related</div>
              <div className="mt-3 grid gap-2 text-sm">
                <a className="text-slate-700 hover:text-slate-900" href="/privacy">
                  Privacy policy
                </a>
                <a className="text-slate-700 hover:text-slate-900" href="/security">
                  Security
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SpryngFooter />
    </main>
  );
}
