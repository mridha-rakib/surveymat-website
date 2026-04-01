"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, MailCheck, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerAuthShell } from "@/components/worker-auth-shell";
import {
  getWorkerAuthState,
  seedDemoWorkerWorkspace,
  writeWorkerSession,
} from "@/lib/worker-session";

export function WorkerSignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [knownWorkerEmail, setKnownWorkerEmail] = useState<string | null>(null);
  const [knownWorkerName, setKnownWorkerName] = useState<string | null>(null);

  useEffect(() => {
    const authState = getWorkerAuthState();

    if (authState.isAuthenticated) {
      router.replace("/dashboard");
      return;
    }

    if (authState.profile) {
      setKnownWorkerEmail(authState.profile.email);
      setKnownWorkerName(authState.profile.fullName);
      setEmail(authState.profile.email);
    }
  }, [router]);

  const handleSignIn = () => {
    const authState = getWorkerAuthState();

    if (!authState.profile) {
      setError(
        "No worker account is stored in this browser yet. Create one or load the demo worker."
      );
      return;
    }

    if (authState.profile.email.toLowerCase() !== email.trim().toLowerCase()) {
      setError("That email does not match the worker account saved in this browser.");
      return;
    }

    if (!password.trim()) {
      setError("Enter any password to continue in this frontend-only demo.");
      return;
    }

    writeWorkerSession(authState.profile);
    router.push("/dashboard");
  };

  const handleDemoAccess = () => {
    seedDemoWorkerWorkspace();
    router.push("/dashboard");
  };

  return (
    <WorkerAuthShell
      eyebrow="Worker Sign In"
      title="Return to your task dashboard."
      description="This frontend-only access flow restores the worker profile and task state saved in the current browser, then routes you into the organized Surveymate workspace."
      highlightTitle="What Happens After Login"
      highlights={[
        "Sign in returns you to the worker dashboard instead of a single all-in-one page.",
        "Tasks, task detail, performance, and earnings each have their own route.",
        "Proof submission, review status, and payouts remain local-demo only for now.",
      ]}
    >
      <div className="space-y-5">
        {knownWorkerEmail ? (
          <div className="rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-5 py-4">
            <p className="text-sm font-semibold text-[var(--brand-sky-900)]">
              Saved worker found
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Continue as {knownWorkerName} with {knownWorkerEmail}.
            </p>
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-5 py-4 text-sm leading-6 text-muted-foreground">
            No saved worker is available in this browser yet. Create one from the sign-up flow or load the seeded demo worker.
          </div>
        )}

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--brand-sky-900)]">
            Email address
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="maya.rahman@example.com"
            className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none transition focus:border-[var(--brand-sky-500)] focus:bg-white"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-[var(--brand-sky-900)]">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter any password for demo access"
            className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none transition focus:border-[var(--brand-sky-500)] focus:bg-white"
          />
        </label>

        <div className="flex items-center justify-between gap-4 text-sm">
          <p className="text-muted-foreground">
            Frontend-only authentication. No backend validation is connected.
          </p>
          <Link
            href="/forgot-password"
            className="font-medium text-[var(--brand-sky-700)] transition hover:text-[var(--brand-sky-900)]"
          >
            Forgot password
          </Link>
        </div>

        {error ? (
          <div className="rounded-[1.4rem] border border-[rgba(239,68,68,0.16)] bg-[rgba(239,68,68,0.08)] px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="h-12 rounded-full" onClick={handleSignIn}>
            Sign In
            <ArrowRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            className="h-12 rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
            onClick={handleDemoAccess}
          >
            <MailCheck className="size-4" />
            Load Demo Worker
          </Button>
        </div>

        <Link
          href="/sign-up"
          className="flex items-center justify-center gap-2 rounded-full border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-3 text-sm font-semibold text-[var(--brand-sky-700)] transition hover:bg-white"
        >
          <UserRoundPlus className="size-4" />
          Create worker account
        </Link>
      </div>
    </WorkerAuthShell>
  );
}
