"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerAuthShell } from "@/components/worker-auth-shell";

export function WorkerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <WorkerAuthShell
      eyebrow="Password Recovery"
      title="Keep the auth flow complete, even before backend integration."
      description="This page is intentionally frontend-only. It completes the worker access journey and gives the final wired-up backend a place to plug into later."
      highlightTitle="Reset Flow"
      highlights={[
        "Reset requests are not delivered yet; this is a designed placeholder route.",
        "The page still mirrors the final navigation structure the real product will need.",
        "Users can always return to sign in or create a local demo account.",
      ]}
      backHref="/sign-in"
      backLabel="Back to sign in"
    >
      {sent ? (
        <div className="rounded-[1.8rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--brand-sky-100)] text-[var(--brand-sky-700)]">
            <MailCheck className="size-5" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Reset link staged for the final backend
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            In the production flow, a reset link would be sent to {email}. For now, this route exists so the auth flow is fully designed and navigable.
          </p>
          <Link
            href="/sign-in"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-sky-600)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-sky-700)]"
          >
            <ArrowLeft className="size-4" />
            Return to sign in
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-[var(--brand-sky-900)]">
              Account email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="maya.rahman@example.com"
              className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none transition focus:border-[var(--brand-sky-500)] focus:bg-white"
            />
          </label>

          <p className="text-sm leading-6 text-muted-foreground">
            This screen is intentionally present now so the auth architecture is complete before backend delivery.
          </p>

          <Button
            className="h-12 rounded-full"
            onClick={() => setSent(true)}
            disabled={!email.trim()}
          >
            Continue
          </Button>
        </div>
      )}
    </WorkerAuthShell>
  );
}
