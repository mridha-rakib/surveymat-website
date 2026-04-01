import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, MailCheck, ShieldCheck } from "lucide-react";

const defaultHighlights = [
  "Structured email tasks with guided recipient prompts",
  "Proof-first submission flow with screenshots and sentiment scoring",
  "Weekly payouts, early withdrawal thresholds, and visible review state",
];

export function WorkerAuthShell({
  eyebrow,
  title,
  description,
  children,
  highlightTitle = "Worker Flow",
  highlights = defaultHighlights,
  backHref = "/",
  backLabel = "Back to overview",
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  highlightTitle?: string;
  highlights?: string[];
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff,#eef4ff)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2.25rem] border border-[var(--brand-sky-200)] bg-[linear-gradient(145deg,#ffffff,#eef4ff)] p-8 shadow-[0_28px_90px_rgba(29,78,216,0.08)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-sky-100)] px-4 py-2 text-sm font-semibold text-[var(--brand-sky-700)]">
            <MailCheck className="size-4" />
            {eyebrow}
          </div>
          <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            {description}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                label: "Rules first",
                detail: "No AI text, no disclosure, natural tone throughout the thread.",
                icon: ShieldCheck,
              },
              {
                label: "Task proof",
                detail: "Every completed email thread requires screenshots and a written summary.",
                icon: CheckCircle2,
              },
              {
                label: "Payout visibility",
                detail: "Workers can track pending review, approved balance, and withdrawals.",
                icon: ArrowRight,
              },
            ].map(({ label, detail, icon: Icon }) => (
              <div
                key={label}
                className="rounded-[1.6rem] border border-[var(--brand-sky-200)] bg-white/92 p-5"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--brand-sky-100)] text-[var(--brand-sky-700)]">
                  <Icon className="size-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-[var(--brand-sky-900)]">
                  {label}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {detail}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-[1.8rem] bg-[linear-gradient(145deg,#1d4ed8,#60a5fa)] p-6 text-white">
            <p className="text-sm font-semibold tracking-[0.2em] text-white/72 uppercase">
              {highlightTitle}
            </p>
            <div className="mt-5 grid gap-3">
              {highlights.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm leading-6 text-white/84"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2.25rem] border border-[var(--brand-sky-200)] bg-white/94 p-8 shadow-[0_28px_90px_rgba(29,78,216,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-[var(--brand-sky-500)] uppercase">
                Secure Access
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground">
                Frontend-only demo flow
              </p>
            </div>
            <Link
              href={backHref}
              className="text-sm font-medium text-[var(--brand-sky-700)] transition hover:text-[var(--brand-sky-900)]"
            >
              {backLabel}
            </Link>
          </div>
          <div className="mt-8">{children}</div>
        </section>
      </div>
    </main>
  );
}
