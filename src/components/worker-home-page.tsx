"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  MailCheck,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWorkerAuthState } from "@/lib/worker-session";

export function WorkerHomePage() {
  const [hasSession, setHasSession] = useState(false);
  const [workerName, setWorkerName] = useState<string | null>(null);

  useEffect(() => {
    const authState = getWorkerAuthState();
    setHasSession(authState.isAuthenticated);
    setWorkerName(authState.profile?.fullName ?? null);
  }, []);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff,#eef4ff_52%,#f7faff)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[2.4rem] border border-[var(--brand-sky-200)] bg-white/92 shadow-[0_32px_110px_rgba(29,78,216,0.08)]">
          <div className="grid gap-8 px-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-sky-100)] px-4 py-2 text-sm font-semibold text-[var(--brand-sky-700)]">
                <MailCheck className="size-4" />
                Worker Frontend
              </div>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl">
                Structured worker flow, proper routes, and auth pages before backend wiring.
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                Surveymate now treats the worker experience as a real application flow: public landing, authentication, dashboard, tasks, task detail, performance, and earnings routes.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {hasSession ? (
                  <Link href="/dashboard">
                    <Button className="h-12 rounded-full px-6">
                      Continue as {workerName ?? "worker"}
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/sign-in">
                      <Button className="h-12 rounded-full px-6">
                        Sign In
                        <ArrowRight className="size-4" />
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button
                        variant="outline"
                        className="h-12 rounded-full border-[var(--brand-sky-200)] bg-white px-6 text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
                      >
                        Create Account
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              {[
                {
                  title: "Worker authentication",
                  detail: "Sign-in, sign-up, and password recovery now live as dedicated pages.",
                  icon: ShieldCheck,
                },
                {
                  title: "Task journey",
                  detail: "Workers move from dashboard to task list to task detail with route-based navigation.",
                  icon: CheckCircle2,
                },
                {
                  title: "Proof and payouts",
                  detail: "Screenshots, response summaries, review state, balances, and withdrawals remain visible in separate views.",
                  icon: WalletCards,
                },
              ].map(({ title, detail, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-[1.7rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5"
                >
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-[var(--brand-sky-700)]">
                    <Icon className="size-5" />
                  </div>
                  <p className="mt-4 text-lg font-semibold text-[var(--brand-sky-900)]">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            "Admin releases tasks gradually over the campaign window.",
            "Workers send human-written emails, collect replies, and upload proof.",
            "Review, warnings, stars, and payout pages are organized for the next backend phase.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[1.8rem] border border-[var(--brand-sky-200)] bg-white/90 px-5 py-5 text-sm leading-7 text-[var(--brand-sky-800)] shadow-[0_18px_50px_rgba(29,78,216,0.05)]"
            >
              {item}
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
