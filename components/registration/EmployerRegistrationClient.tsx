"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { SpryngToasts } from "@/lib/ui/spryng-toasts";
import { CopyField } from "./CopyField";

type Employer = {
  id: string;
  legal_name?: string | null;
  ein?: string | null;
  entity_type?: string | null;
  state_code: string;
};

type Artifact = {
  id: string;
  step_key: string | null;
  file_name: string | null;
  created_at: string;
};

type Step = {
  step_key: string;
  title: string;
  body: string;
  cta_label?: string;
  cta_url?: string;
  proof_required?: boolean;
};

type Props = {
  employer: Employer;
  portal: { registration_url?: string | null; login_url?: string | null; help_url?: string | null };
  steps: Step[];
  caseStatus: "not_started" | "in_progress" | "submitted" | "completed" | "blocked";
  artifacts: Artifact[];
};

export default function EmployerRegistrationClient(props: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<Props["caseStatus"]>(props.caseStatus);
  const [uploadingStep, setUploadingStep] = useState<string | null>(null);

  const portalUrl = props.portal.registration_url || props.portal.login_url || null;

  async function updateStatus(next: Props["caseStatus"], current_step_key?: string | null) {
    const res = await fetch("/api/employer-registration/status", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next, current_step_key: current_step_key ?? null }),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error?.message ?? "Could not update status.");
    setStatus(next);

    if (next === "submitted") SpryngToasts.registrationSubmitted();
    if (next === "completed") SpryngToasts.registrationCompleted();

    router.refresh();
  }

  async function openPortal(stepKey?: string) {
    if (status === "not_started") {
      await updateStatus("in_progress", stepKey ?? null);
    }
    if (portalUrl) window.open(portalUrl, "_blank", "noopener,noreferrer");
  }

  async function uploadProof(stepKey: string, file: File) {
    setUploadingStep(stepKey);
    try {
      // 1) Request signed upload URL
      const metaRes = await fetch("/api/artifacts/upload-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          step_key: stepKey,
          file_name: file.name,
          mime_type: file.type || "application/octet-stream",
          size_bytes: file.size,
          category: "registration_proof",
        }),
      });

      const metaJson = await metaRes.json();
      if (!metaJson.ok) throw new Error(metaJson.error?.message ?? "Could not prepare upload.");

      const { bucket, path, token, file_name, mime_type, size_bytes } = metaJson.data as {
        bucket: string;
        path: string;
        token: string;
        file_name: string;
        mime_type: string;
        size_bytes: number;
      };

      // 2) Upload to signed URL
      const up = await supabase.storage.from(bucket).uploadToSignedUrl(path, token, file, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

      if (up.error) throw new Error(up.error.message);

      // 3) Confirm metadata in DB
      const confirmRes = await fetch("/api/artifacts/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          storage_bucket: bucket,
          storage_path: path,
          step_key: stepKey,
          category: "registration_proof",
          file_name,
          mime_type,
          size_bytes,
        }),
      });

      const confirmJson = await confirmRes.json();
      if (!confirmJson.ok) throw new Error(confirmJson.error?.message ?? "Could not save proof metadata.");

      // Celebration toast (warm premium)
      SpryngToasts.proofSaved?.(file_name); // if you add this helper later
      // fallback:
      // toast.success("Nice work — proof saved", { description: "Your confirmation is stored in your Proof Vault." });

      router.refresh();
    } finally {
      setUploadingStep(null);
    }
  }

  function hasProofFor(stepKey: string) {
    return props.artifacts.some((a) => a.step_key === stepKey);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left: Plan */}
        <div className="flex-1">
          <div className="mb-4">
            <h1 className="text-2xl font-semibold text-slate-900">Employer registration</h1>
            <p className="mt-2 text-sm text-slate-600">
              Calm, step-by-step guidance — plus audit-ready proof saved in Spryng.
            </p>
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Your status</p>
                <p className="mt-1 text-sm text-slate-600">
                  Be honest here — we’ll guide the next step based on your status.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                  onClick={() => updateStatus("submitted")}
                >
                  Mark submitted
                </button>
                <button
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  onClick={() => updateStatus("completed")}
                >
                  Mark complete
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {(["not_started", "in_progress", "submitted", "completed", "blocked"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-semibold",
                    status === s
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  ].join(" ")}
                >
                  {s.replaceAll("_", " ")}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Go to the state portal</p>
                <p className="mt-1 text-sm text-slate-600">
                  Keep Spryng open. Copy answers from the packet below, then come back to upload proof.
                </p>
              </div>
              <button
                onClick={() => openPortal(props.steps?.[0]?.step_key)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                disabled={!portalUrl}
              >
                Open portal
              </button>
            </div>
          </div>

          {/* Portal-ready packet */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Portal-ready packet</h2>
            <p className="mt-1 text-sm text-slate-600">
              These are the values you’ll reuse in the portal. Copy + paste to avoid re-entry.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <CopyField label="Legal business name" value={props.employer.legal_name} />
              <CopyField label="EIN" value={props.employer.ein} helper="If you don’t have one yet, you can add it later." />
              <CopyField label="Entity type" value={props.employer.entity_type} />
              <CopyField label="State" value={props.employer.state_code} />
            </div>
          </div>

          {/* Steps */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Your step-by-step plan</h2>
            <div className="mt-4 space-y-4">
              {props.steps.map((step) => {
                const hasProof = hasProofFor(step.step_key);
                return (
                  <div key={step.step_key} className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{step.body}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {step.cta_url ? (
                          <button
                            onClick={() => openPortal(step.step_key)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            {step.cta_label ?? "Open"}
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-xs font-semibold">
                        {step.proof_required ? (
                          <span className={hasProof ? "text-emerald-700" : "text-slate-700"}>
                            {hasProof ? "Proof saved" : "Upload proof to finish this step"}
                          </span>
                        ) : (
                          <span className="text-slate-600">Optional proof</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                          {uploadingStep === step.step_key ? "Uploading…" : "Upload confirmation"}
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.png,.jpg,.jpeg"
                            disabled={uploadingStep !== null}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              uploadProof(step.step_key, f).catch((err) => alert(err?.message ?? "Upload failed."));
                              e.currentTarget.value = "";
                            }}
                          />
                        </label>

                        <button
                          onClick={() => updateStatus("in_progress", step.step_key)}
                          className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                        >
                          Mark in progress
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Proof vault */}
        <aside className="w-full lg:w-[360px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Proof Vault</h2>
            <p className="mt-1 text-sm text-slate-600">
              This is what brings users back: your audit-ready confirmation trail.
            </p>

            <div className="mt-4 space-y-3">
              {props.artifacts.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-900">Nothing uploaded yet</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Upload your confirmation letter or screenshot when you finish a portal step.
                  </p>
                </div>
              ) : (
                props.artifacts.map((a) => (
                  <div key={a.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-900">{a.file_name ?? "Proof file"}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      Step: {a.step_key ?? "—"} · {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
