// app/privacy/page.tsx
import HeaderNav from "@/components/marketing/HeaderNav";
import SpryngFooter from "@/components/marketing/SpryngFooter";

export const metadata = {
  title: "Privacy — Spryng",
  description:
    "Spryng privacy policy: what we collect, how we use it, and how you can request changes.",
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

export default function PrivacyPage() {
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
            <span>Privacy</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Privacy policy
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            We keep this simple and human. Spryng collects the minimum data needed to guide you through
            employer setup and help you stay organized over time.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill>Minimal data</Pill>
            <Pill>Workspace-scoped access</Pill>
            <Pill>No selling data</Pill>
            <Pill>Not legal advice</Pill>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            Effective date: <span className="font-semibold text-slate-700">{effectiveDate}</span>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-10">
            <Section title="What we collect" id="collect">
              <p>
                We collect information you provide and limited technical data required to operate the service.
                This can include:
              </p>
              <ul className="list-disc pl-5">
                <li><span className="font-semibold">Account info</span> (email, authentication identifiers).</li>
                <li><span className="font-semibold">Company setup info</span> (state, employer details you enter).</li>
                <li><span className="font-semibold">Product usage</span> (checklist progress, saved due dates, logs you create).</li>
                <li><span className="font-semibold">Uploaded files</span> (proof documents you choose to store).</li>
              </ul>
              <p className="text-slate-600">
                We recommend uploading only what you need for “proof” (e.g., confirmation letters) and
                avoiding sensitive personal documents unless a workflow explicitly calls for it.
              </p>
            </Section>

            <Section title="How we use information" id="use">
              <p>We use your information to:</p>
              <ul className="list-disc pl-5">
                <li>Provide state-aware setup steps and progress tracking.</li>
                <li>Store the records you choose to keep (proof + logs).</li>
                <li>Support reminders and “what’s due next” guidance (where enabled).</li>
                <li>Maintain service security, reliability, and performance.</li>
              </ul>
              <p className="text-slate-600">
                We don’t use your data to make legal determinations. Spryng provides guidance and organization,
                not legal or tax advice.
              </p>
            </Section>

            <Section title="How we share information" id="share">
              <p>
                We do not sell your personal information. We share data only in limited cases, such as:
              </p>
              <ul className="list-disc pl-5">
                <li>With vendors that help us run the product (e.g., authentication, hosting), under appropriate safeguards.</li>
                <li>If required by law, lawful request, or to protect rights and safety.</li>
                <li>With your consent (for example, if you choose to export and share records).</li>
              </ul>
            </Section>

            <Section title="Cookies and authentication" id="cookies">
              <p>
                Spryng uses cookies to maintain your session and to support pre-signup quiz carryover into your account.
                Some cookies may be HTTP-only and not accessible from the browser for safety.
              </p>
            </Section>

            <Section title="Data retention" id="retention">
              <p>
                We retain your data for as long as your account is active or as needed to provide the service.
                You can request deletion, and we’ll follow applicable requirements and legitimate business needs
                (e.g., security logs, compliance obligations).
              </p>
            </Section>

            <Section title="Your choices" id="choices">
              <p>You can:</p>
              <ul className="list-disc pl-5">
                <li>Update certain company details in-app (where available).</li>
                <li>Export records you’ve created.</li>
                <li>Request access, correction, or deletion by contacting us.</li>
              </ul>
            </Section>

            <Section title="Contact" id="contact">
              <p>
                Questions about privacy? Email{" "}
                <a
                  className="underline decoration-slate-300 underline-offset-4 hover:text-slate-900"
                  href="mailto:privacy@spryng.com"
                >
                  privacy@spryng.com
                </a>
                .
              </p>
              <p className="text-xs text-slate-500">
                (If you don’t have this inbox set up yet, change the address now — but keep the pattern.)
              </p>
            </Section>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold text-slate-900">Plain-language note</div>
              <div className="mt-2 text-sm text-slate-700">
                Spryng is built to help you stay audit-ready before you start running payroll — and after.
                We keep privacy simple: minimal data, clear purpose, no selling.
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">On this page</div>
              <nav className="mt-3 grid gap-2 text-sm">
                <a className="text-slate-700 hover:text-slate-900" href="#collect">What we collect</a>
                <a className="text-slate-700 hover:text-slate-900" href="#use">How we use it</a>
                <a className="text-slate-700 hover:text-slate-900" href="#share">How we share it</a>
                <a className="text-slate-700 hover:text-slate-900" href="#cookies">Cookies</a>
                <a className="text-slate-700 hover:text-slate-900" href="#retention">Retention</a>
                <a className="text-slate-700 hover:text-slate-900" href="#choices">Your choices</a>
                <a className="text-slate-700 hover:text-slate-900" href="#contact">Contact</a>
              </nav>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">Quick summary</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>• We collect the minimum data needed to guide setup + keep records organized.</li>
                <li>• We don’t sell your personal information.</li>
                <li>• You can request access, correction, or deletion.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <SpryngFooter />
    </main>
  );
}
