// app/security/page.tsx
import HeaderNav from "@/components/marketing/HeaderNav";
import SpryngFooter from "@/components/marketing/SpryngFooter";

export const metadata = {
  title: "Security — Spryng",
  description:
    "Spryng security practices: how we protect your account, data handling, and operational safeguards.",
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

function Card({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</div>
    </div>
  );
}

export default function SecurityPage() {
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
            <span>Security</span>
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            How Spryng protects your data
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Spryng is built to help you stay audit-ready — and we treat your data with the
            same level of seriousness. Below is a clear overview of how security works in
            the product today, and what we’re building toward.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill>Supabase Auth</Pill>
            <Pill>Row-level security (RLS)</Pill>
            <Pill>Least-privilege access</Pill>
            <Pill>Audit-ready exports</Pill>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="container py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <div className="space-y-10">
            <Section title="Access control" id="access">
              <p>
                Spryng uses <span className="font-semibold">Supabase Auth</span> for authentication.
                Your account session is managed using secure cookies and server-side checks.
              </p>
              <p>
                Your business data is protected by <span className="font-semibold">row-level security (RLS)</span>,
                so that users can only access records they’re permitted to see (e.g., within their workspace).
              </p>
              <ul className="list-disc pl-5">
                <li>Authentication handled via Supabase (OAuth and/or email/password).</li>
                <li>Authorization enforced in Postgres via RLS, not only in UI code.</li>
                <li>Workspace boundaries are respected across all reads/writes.</li>
              </ul>
            </Section>

            <Section title="Data handling" id="data-handling">
              <p>
                We aim to collect the minimum necessary data to deliver clear, state-aware steps and
                maintain defensible records. When you upload proof documents, they are stored in a
                secure storage system (where enabled) with access governed by your account.
              </p>
              <ul className="list-disc pl-5">
                <li>We avoid storing sensitive info unless needed for the workflow.</li>
                <li>Files and records are intended to be scoped to your workspace.</li>
                <li>We encourage uploading only what’s required as “proof”.</li>
              </ul>
            </Section>

            <Section title="Application security practices" id="appsec">
              <p>
                Spryng is built using modern server-first patterns in Next.js. We prefer server-side
                route handlers for writes to reduce fragile client-side access and prevent bypasses.
              </p>
              <ul className="list-disc pl-5">
                <li>Server Components for read-only access and routing decisions.</li>
                <li>Route handlers for validated mutations and secure inserts.</li>
                <li>Input validation and consistent error handling.</li>
              </ul>
            </Section>

            <Section title="Operational safeguards" id="ops">
              <p>
                We monitor for abnormal errors and aim to keep dependencies current. When we make changes
                that affect data permissions or storage, we prioritize safety and backwards compatibility.
              </p>
              <ul className="list-disc pl-5">
                <li>Principle of least privilege for internal access.</li>
                <li>Careful, reviewable database migrations (avoid schema drift).</li>
                <li>Defense-in-depth: RLS + server validation + UI constraints.</li>
              </ul>
            </Section>

            <Section title="Disclosures" id="disclosures">
              <p>
                Spryng provides guidance and organization — it is not a legal or tax service.
                You control what information you enter and upload.
              </p>
              <p className="text-slate-600">
                If you believe there’s a security issue, please contact us and we’ll take it seriously.
              </p>
            </Section>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-semibold text-slate-900">Contact</div>
              <div className="mt-2 text-sm text-slate-700">
                For security questions or reports, email{" "}
                <a className="underline decoration-slate-300 underline-offset-4 hover:text-slate-900" href="mailto:security@spryng.com">
                  security@spryng.com
                </a>
                .
              </div>
              <div className="mt-2 text-xs text-slate-500">
                (If you don’t have this inbox set up yet, change the address now — but keep the pattern.)
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">On this page</div>
              <nav className="mt-3 grid gap-2 text-sm">
                <a className="text-slate-700 hover:text-slate-900" href="#access">Access control</a>
                <a className="text-slate-700 hover:text-slate-900" href="#data-handling">Data handling</a>
                <a className="text-slate-700 hover:text-slate-900" href="#appsec">Application security</a>
                <a className="text-slate-700 hover:text-slate-900" href="#ops">Operational safeguards</a>
                <a className="text-slate-700 hover:text-slate-900" href="#disclosures">Disclosures</a>
              </nav>
            </div>

            <Card
              title="Built for small businesses"
              desc="Security should feel calm and professional. We keep the product simple — and the protections strong."
            />
            <Card
              title="RLS-first by default"
              desc="We rely on database-enforced rules so access control doesn’t depend on fragile UI logic."
            />
          </aside>
        </div>
      </section>

      <SpryngFooter />
    </main>
  );
}
