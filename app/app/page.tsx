// app/app/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarClock,
  ClipboardList,
  FileUp,
  Flag,
  BriefcaseBusiness,
  Sparkles,
} from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

function initials(name?: string | null) {
  const s = (name ?? "").trim();
  if (!s) return "S";
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "S";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  return (first + last).toUpperCase();
}

type StatusTone = "neutral" | "info" | "success" | "warning";

function StatusChip({ tone, label }: { tone: StatusTone; label: string }) {
  const map: Record<StatusTone, string> = {
    neutral: "border-slate-200 bg-white text-slate-700",
    info: "border-indigo-200 bg-indigo-50 text-indigo-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        map[tone]
      )}
    >
      {label}
    </span>
  );
}

function BigTile({
  title,
  subtitle,
  status,
  statusTone,
  icon,
  bullets,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  disabled,
}: {
  title: string;
  subtitle: string;
  status: string;
  statusTone: StatusTone;
  icon: ReactNode;
  bullets: string[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={cx(
        "relative h-full overflow-hidden rounded-3xl border p-6 shadow-sm transition",
        disabled
          ? "border-slate-200 bg-slate-50"
          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-base font-semibold text-slate-900">{title}</div>
            <StatusChip tone={statusTone} label={status} />
          </div>
          <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
        </div>

        <div
          className={cx(
            "inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-white",
            disabled ? "border-slate-200 text-slate-400" : "border-slate-200 text-slate-900"
          )}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-xs font-semibold text-slate-900">What you’ll do</div>
        <ul className="mt-2 space-y-2 text-sm text-slate-700">
          {bullets.slice(0, 2).map((b) => (
            <li key={b} className="flex items-start gap-2">
              <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        {disabled ? (
          <span className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400">
            {primaryLabel}
          </span>
        ) : (
          <Link
            href={primaryHref}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-950"
          >
            {primaryLabel} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        )}

        {secondaryHref && secondaryLabel ? (
          disabled ? (
            <span className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-400">
              {secondaryLabel}
            </span>
          ) : (
            <Link
              href={secondaryHref}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50"
            >
              {secondaryLabel}
            </Link>
          )
        ) : null}
      </div>

      {/* subtle sheen */}
      <div
        aria-hidden
        className={cx(
          "pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full blur-3xl",
          disabled ? "bg-slate-200/40" : "bg-slate-200/30"
        )}
      />
    </div>
  );
}

function SmallTile({
  title,
  desc,
  href,
  icon,
  chip,
}: {
  title: string;
  desc: string;
  href: string;
  icon: ReactNode;
  chip?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-slate-900">{title}</div>
            {chip}
          </div>
          <div className="mt-1 text-sm text-slate-600">{desc}</div>
          <div className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
            Open <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function AppHomePage() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/app");

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_workspace_id")
    .eq("id", user.id)
    .maybeSingle();

  const workspaceId = profile?.active_workspace_id ?? null;
  if (!workspaceId) redirect("/onboarding");

  const { data: employer } = await supabase
    .from("employers")
    .select("id, display_name, state_code")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const companyName = employer?.display_name ?? "Your company";
  const stateCode = employer?.state_code ?? null;

  const nextAction = !stateCode
    ? {
        label: "Set your company state",
        hint: "We need your state to generate the right registration steps.",
        href: "/app/settings/company",
        cta: "Update company",
      }
    : {
        label: `Start employer registration (${stateCode})`,
        hint: "We’ll guide you through the exact steps and what to save as proof.",
        href: "/app/checklist",
        cta: "Open registration steps",
      };

  const registrationStatus: { tone: StatusTone; label: string } = !stateCode
    ? { tone: "warning", label: "Needs state" }
    : { tone: "info", label: "Ready" };

  const PROOF_HREF = "/app/checklist?focus=proof";
  const GOAL_HREF = "/goals/first-employee";

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* TOP: company + state + one next action */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 via-white to-white p-6 shadow-sm sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_55%,transparent_80%)]"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:44px_44px]" />
        </div>

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-slate-900" />
              <span>Stay audit-ready before you start running payroll — and after.</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                  {initials(companyName)}
                </span>
                <span className="font-semibold text-slate-900">{companyName}</span>
                {stateCode ? (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    {stateCode}
                  </span>
                ) : (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                    state needed
                  </span>
                )}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {nextAction.label}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{nextAction.hint}</p>

            <div className="mt-4 inline-flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 shadow-sm">
              <span className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-900">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900">Quick prep</div>
                <div className="mt-1 text-sm text-slate-600">
                  Have your EIN, legal business name, and business address handy. Spryng will tell you what to save as proof.
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <Link
              href={nextAction.href}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-950"
            >
              {nextAction.cta} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <div className="text-xs text-slate-500">Calm guidance. Clear steps. Not legal advice.</div>
          </div>
        </div>
      </section>

      {/* MIDDLE: 3 big tiles */}
      <section className="grid gap-4 lg:grid-cols-3">
        <BigTile
          title="Register as an employer"
          subtitle="State-aware steps, plain language, and a clean “save this” list."
          status={registrationStatus.label}
          statusTone={registrationStatus.tone}
          icon={<ClipboardList className="h-5 w-5" />}
          bullets={[
            "Follow the exact steps your state portal expects.",
            "See what to save (confirmation, account IDs, notices).",
          ]}
          primaryHref={stateCode ? "/app/checklist" : "/app/settings/company"}
          primaryLabel={stateCode ? "Start registration steps" : "Add your state"}
          secondaryHref="/app/checklist"
          secondaryLabel="View checklist"
        />

        <BigTile
          title="Proof Vault"
          subtitle="Store confirmations and screenshots so you can pull them fast later."
          status="Coming next"
          statusTone="warning"
          icon={<FileUp className="h-5 w-5" />}
          bullets={[
            "Upload your employer registration confirmation letter or screenshot.",
            "Keep your proof organized and easy to find.",
          ]}
          primaryHref={PROOF_HREF}
          primaryLabel="Upload confirmation"
          secondaryHref={PROOF_HREF}
          secondaryLabel="What to save"
        />

        <BigTile
          title="First hire goal"
          subtitle="Set a calm target and track progress toward your first official employee."
          status="Coming next"
          statusTone="warning"
          icon={<Flag className="h-5 w-5" />}
          bullets={[
            "Pick a target date and a realistic plan to get there.",
            "Stay focused on the milestone that changes everything.",
          ]}
          primaryHref={GOAL_HREF}
          primaryLabel="Set your goal"
          secondaryHref={GOAL_HREF}
          secondaryLabel="See the plan"
        />
      </section>

      {/* BOTTOM: 3 small tiles */}
      <section className="grid gap-4 md:grid-cols-3">
        <SmallTile
          title="Deadlines"
          desc="Track UI report due dates and get reminders (soon)."
          href="/app/checklist?focus=deadlines"
          icon={<CalendarClock className="h-5 w-5" />}
          chip={<StatusChip tone="warning" label="Coming next" />}
        />

        <SmallTile
          title="Outside-payroll tracking"
          desc="Log helper payments and keep defensible records."
          href="/app/tracking"
          icon={<BriefcaseBusiness className="h-5 w-5" />}
        />

        <SmallTile
          title="Company settings"
          desc="Update state, company details, and employer context."
          href="/app/settings/company"
          icon={<Building2 className="h-5 w-5" />}
        />
      </section>

      <div className="pt-2 text-xs text-slate-500">
        Spryng provides step-by-step guidance based on state rules. It’s not legal or tax advice.
      </div>
    </div>
  );
}
