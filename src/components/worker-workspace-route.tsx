"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { SurveymateWorkspace } from "@/components/surveymate-workspace";
import { getWorkerAuthState } from "@/lib/worker-session";
import type { NavView } from "@/lib/surveymate-data";

export function WorkerWorkspaceRoute({
  routeView,
  routeTaskId,
}: {
  routeView: NavView;
  routeTaskId?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed" | "blocked">(
    "loading"
  );

  useEffect(() => {
    const authState = getWorkerAuthState();

    if (!authState.isAuthenticated) {
      setStatus("blocked");
      router.replace("/sign-in");
      return;
    }

    setStatus("allowed");
  }, [router]);

  if (status !== "allowed") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fbff,#eef4ff)] px-6 py-10">
        <div className="w-full max-w-lg rounded-[2rem] border border-[var(--brand-sky-200)] bg-white/92 p-8 text-center shadow-[0_24px_80px_rgba(29,78,216,0.08)]">
          <div className="mx-auto flex size-14 items-center justify-center rounded-3xl bg-[var(--brand-sky-100)] text-[var(--brand-sky-700)]">
            <Sparkles className="size-6" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-foreground">
            Preparing your workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Checking local access and restoring the latest worker state from this browser.
          </p>
        </div>
      </main>
    );
  }

  return <SurveymateWorkspace routeView={routeView} routeTaskId={routeTaskId} />;
}
