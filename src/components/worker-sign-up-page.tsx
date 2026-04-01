"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerAuthShell } from "@/components/worker-auth-shell";
import {
  createInitialWorkspaceState,
  defaultWorkerId,
} from "@/lib/surveymate-data";
import {
  readWorkerWorkspace,
  writeWorkerSession,
  writeWorkerWorkspace,
} from "@/lib/worker-session";

type SignUpForm = {
  fullName: string;
  email: string;
  region: string;
  payoutMethod: string;
  noAi: boolean;
  keepPurposePrivate: boolean;
  continueConversation: boolean;
  naturalTone: boolean;
};

const defaultForm: SignUpForm = {
  fullName: "",
  email: "",
  region: "Dhaka, Bangladesh",
  payoutMethod: "Payoneer",
  noAi: false,
  keepPurposePrivate: false,
  continueConversation: false,
  naturalTone: false,
};

export function WorkerSignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState<SignUpForm>(defaultForm);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      setError("Enter your name and email before continuing.");
      return;
    }

    if (
      !form.noAi ||
      !form.keepPurposePrivate ||
      !form.continueConversation ||
      !form.naturalTone
    ) {
      setError("Accept every worker rule before creating the local account.");
      return;
    }

    const workspace = readWorkerWorkspace() ?? createInitialWorkspaceState();
    const nextWorkspace = {
      ...workspace,
      profile: {
        workerId: workspace.profile?.workerId ?? defaultWorkerId,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        region: form.region,
        payoutMethod: form.payoutMethod,
        joinedAt: new Date().toISOString(),
        rulesAccepted: true,
        status: workspace.workerStatus,
      },
      activeView: "dashboard" as const,
    };

    writeWorkerWorkspace(nextWorkspace);
    writeWorkerSession(nextWorkspace.profile);
    router.push("/dashboard");
  };

  return (
    <WorkerAuthShell
      eyebrow="Worker Sign Up"
      title="Create the worker-side flow before wiring the backend."
      description="This page turns the old inline onboarding block into a proper sign-up route. It still saves everything locally, but the flow now behaves like a real product funnel."
      highlightTitle="Account Setup"
      highlights={[
        "Profile data stays in browser storage until backend auth is added.",
        "Task availability, proof requirements, and payout rules stay visible from the first session.",
        "After sign-up, the worker lands directly on the dashboard route.",
      ]}
      backHref="/sign-in"
      backLabel="Already have access?"
    >
      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--brand-sky-900)]">
            Full name
          </span>
          <input
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({ ...current, fullName: event.target.value }))
            }
            placeholder="Maya Rahman"
            className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none transition focus:border-[var(--brand-sky-500)] focus:bg-white"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--brand-sky-900)]">
            Email
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="maya.rahman@example.com"
            className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none transition focus:border-[var(--brand-sky-500)] focus:bg-white"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--brand-sky-900)]">
              Region
            </span>
            <input
              value={form.region}
              onChange={(event) =>
                setForm((current) => ({ ...current, region: event.target.value }))
              }
              className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none transition focus:border-[var(--brand-sky-500)] focus:bg-white"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--brand-sky-900)]">
              Payout method
            </span>
            <select
              value={form.payoutMethod}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  payoutMethod: event.target.value,
                }))
              }
              className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none transition focus:border-[var(--brand-sky-500)] focus:bg-white"
            >
              <option>Payoneer</option>
              <option>Wise</option>
              <option>Bank transfer</option>
            </select>
          </label>
        </div>

        <div className="rounded-[1.7rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
          <p className="text-sm font-semibold text-[var(--brand-sky-900)]">
            Worker rules
          </p>
          <div className="mt-4 grid gap-3">
            {[
              {
                key: "noAi",
                label: "I will not use AI-generated content in any recipient email.",
              },
              {
                key: "keepPurposePrivate",
                label: "I will not disclose the platform purpose to recipients.",
              },
              {
                key: "continueConversation",
                label: "I will continue the conversation until the task is complete.",
              },
              {
                key: "naturalTone",
                label: "I will keep my wording natural and organic.",
              },
            ].map((rule) => (
              <label
                key={rule.key}
                className="flex items-start gap-3 rounded-[1.35rem] border border-white bg-white px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
              >
                <input
                  type="checkbox"
                  checked={form[rule.key as keyof SignUpForm] as boolean}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [rule.key]: event.target.checked,
                    }))
                  }
                  className="mt-1 size-4 rounded border-[var(--brand-sky-300)] text-[var(--brand-sky-500)]"
                />
                <span>{rule.label}</span>
              </label>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-[1.4rem] border border-[rgba(239,68,68,0.16)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <Button className="h-12 rounded-full" onClick={handleSubmit}>
          Create Worker Account
          <ArrowRight className="size-4" />
        </Button>

        <Link
          href="/sign-in"
          className="flex items-center justify-center gap-2 rounded-full border border-[var(--brand-sky-200)] bg-white px-4 py-3 text-sm font-semibold text-[var(--brand-sky-700)] transition hover:bg-[var(--brand-sky-50)]"
        >
          <CheckCircle2 className="size-4" />
          Back to sign in
        </Link>
      </div>
    </WorkerAuthShell>
  );
}
