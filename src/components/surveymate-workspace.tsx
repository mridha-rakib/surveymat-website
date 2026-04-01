"use client";

import {
  useDeferredValue,
  useEffect,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BadgeCheck,
  BadgeDollarSign,
  CalendarClock,
  CheckCircle2,
  Clock3,
  FileImage,
  Headset,
  LayoutDashboard,
  ListTodo,
  MailCheck,
  MessageSquareText,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  LogOut,
  Sparkles,
  Star,
  TrendingUp,
  UserRoundPlus,
  WalletCards,
} from "lucide-react";
import {
  createDemoWorkspaceState,
  createEmptyDraft,
  createInitialWorkspaceState,
  defaultWorkerId,
  surveymateRules,
  type NavView,
  type Submission,
  type Task,
  type TaskStatus,
  type WorkspaceState,
} from "@/lib/surveymate-data";
import {
  clearWorkerSession,
  writeWorkerSession,
} from "@/lib/worker-session";

const STORAGE_KEY = "surveymate-user-workspace-v3";

const navItems: Array<{
  id: NavView;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "All Tasks", icon: ListTodo },
  { id: "detail", label: "Task Detail", icon: MailCheck },
  { id: "performance", label: "Warnings & Stars", icon: ShieldCheck },
  { id: "earnings", label: "Earnings", icon: WalletCards },
];

const statusFilters: Array<{ id: "all" | TaskStatus; label: string }> = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "in_progress", label: "In Progress" },
  { id: "awaiting_review", label: "Awaiting Review" },
  { id: "approved", label: "Approved" },
  { id: "locked", label: "Locked" },
];

type OnboardingForm = {
  fullName: string;
  email: string;
  region: string;
  payoutMethod: string;
  noAi: boolean;
  keepPurposePrivate: boolean;
  continueConversation: boolean;
  naturalTone: boolean;
};

const defaultOnboarding: OnboardingForm = {
  fullName: "",
  email: "",
  region: "Dhaka, Bangladesh",
  payoutMethod: "Payoneer",
  noAi: false,
  keepPurposePrivate: false,
  continueConversation: false,
  naturalTone: false,
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const getStatusTone = (status: TaskStatus) => {
  switch (status) {
    case "available":
      return "bg-[var(--brand-sky-100)] text-[var(--brand-sky-800)]";
    case "in_progress":
      return "bg-[var(--brand-sky-200)] text-[var(--brand-sky-900)]";
    case "awaiting_review":
      return "bg-white text-[var(--brand-sky-700)] border border-[var(--brand-sky-200)]";
    case "approved":
      return "bg-[var(--brand-sky-700)] text-white";
    case "locked":
      return "bg-[var(--brand-sky-50)] text-[var(--brand-sky-500)] border border-[var(--brand-sky-200)]";
    default:
      return "bg-[var(--brand-sky-100)] text-[var(--brand-sky-800)]";
  }
};

const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case "available":
      return "Available";
    case "in_progress":
      return "In Progress";
    case "awaiting_review":
      return "Awaiting Review";
    case "approved":
      return "Approved";
    case "locked":
      return "Locked";
    default:
      return status;
  }
};

function AppPanel({
  title,
  eyebrow,
  children,
  action,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-[var(--brand-sky-200)] bg-white/90 p-6 shadow-[0_24px_80px_rgba(29,78,216,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[var(--brand-sky-500)] uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-3xl">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function StatusPill({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

type SurveymateWorkspaceProps = {
  routeView?: NavView;
  routeTaskId?: string;
};

const getWorkerPath = (view: NavView, taskId?: string) => {
  switch (view) {
    case "dashboard":
      return "/dashboard";
    case "tasks":
      return "/tasks";
    case "detail":
      return `/tasks/${taskId ?? "task-106"}`;
    case "performance":
      return "/performance";
    case "earnings":
      return "/earnings";
    default:
      return "/dashboard";
  }
};

export function SurveymateWorkspace({
  routeView,
  routeTaskId,
}: SurveymateWorkspaceProps = {}) {
  const router = useRouter();
  const [workspace, setWorkspace] = useState<WorkspaceState>(() =>
    createInitialWorkspaceState()
  );
  const [hydrated, setHydrated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [onboarding, setOnboarding] = useState<OnboardingForm>(defaultOnboarding);
  const [withdrawAmount, setWithdrawAmount] = useState(
    String(surveymateRules.earlyPayoutThreshold)
  );
  const [withdrawMethod, setWithdrawMethod] = useState("Payoneer");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as WorkspaceState;
          setWorkspace(parsed);
          if (parsed.profile?.payoutMethod) {
            setWithdrawMethod(parsed.profile.payoutMethod);
          }
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      setHydrated(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    }
  }, [workspace, hydrated]);

  useEffect(() => {
    if (!routeView) {
      return;
    }

    setWorkspace((current) => {
      const nextTaskId =
        routeView === "detail" && routeTaskId
          ? routeTaskId
          : current.selectedTaskId;

      if (
        current.activeView === routeView &&
        current.selectedTaskId === nextTaskId
      ) {
        return current;
      }

      return {
        ...current,
        activeView: routeView,
        selectedTaskId: nextTaskId,
      };
    });
  }, [routeTaskId, routeView]);

  const createDraftForTask = (task?: Task) =>
    createEmptyDraft({
      emailSubject: task?.subject ?? "",
      emailBody: task?.messageTemplate ?? "",
    });

  const selectedTask =
    workspace.tasks.find((task) => task.id === workspace.selectedTaskId) ??
    workspace.tasks[0];
  const selectedDraft = selectedTask
    ? {
        ...createDraftForTask(selectedTask),
        ...(workspace.drafts[selectedTask.id] ?? {}),
        screenshotNames: workspace.drafts[selectedTask.id]?.screenshotNames ?? [],
      }
    : createDraftForTask();

  const filteredTasks = workspace.tasks.filter((task) => {
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const query = deferredQuery.trim().toLowerCase();
    const haystack =
      `${task.title} ${task.category} ${task.recipientName} ${task.recipientEmail}`.toLowerCase();
    return matchesStatus && (!query || haystack.includes(query));
  });

  const awaitingCount = workspace.pendingReviewCount;
  const activeCount = workspace.tasks.filter((task) => task.status === "in_progress").length;
  const availableCount = workspace.tasks.filter((task) => task.status === "available").length;
  const reviewedCount = workspace.approvedCount + workspace.pendingReviewCount;
  const completionRate = reviewedCount
    ? Math.round((workspace.approvedCount / reviewedCount) * 100)
    : 0;
  const streakProgress =
    workspace.qualityStreak % surveymateRules.starAwardStreak;
  const nextStarProgress = Math.min(
    100,
    Math.round(
      (streakProgress / surveymateRules.starAwardStreak) * 100
    )
  );
  const earliestPayoutDate = surveymateRules.nextPayoutDateLabel;
  const withdrawalReady =
    workspace.availableBalance >= surveymateRules.earlyPayoutThreshold;
  const flowStageLabel = !selectedDraft.emailSent
    ? "Ready to send"
    : !selectedDraft.replyReceivedAt
      ? "Waiting for response"
      : selectedTask?.requiresFollowUp && !selectedDraft.followUpComplete
        ? "Follow-up needed"
        : !selectedDraft.proofReady || selectedDraft.screenshotNames.length === 0
          ? "Collect proof"
          : !selectedDraft.responseText.trim()
            ? "Summarize reply"
            : "Ready to submit";

  const navigateToView = (view: NavView, taskId?: string) => {
    router.push(getWorkerPath(view, taskId ?? workspace.selectedTaskId));
  };

  const setActiveView = (view: NavView) => {
    setWorkspace((current) => ({ ...current, activeView: view }));
    navigateToView(view);
  };

  const selectTask = (taskId: string, nextView: NavView = "detail") => {
    setWorkspace((current) => ({
      ...current,
      selectedTaskId: taskId,
      activeView: nextView,
    }));
    setError(null);
    setMessage(null);
    navigateToView(nextView, taskId);
  };

  const updateDraft = (
    taskId: string,
    patch: Partial<ReturnType<typeof createEmptyDraft>>
  ) => {
    const task = workspace.tasks.find((entry) => entry.id === taskId);
    setWorkspace((current) => ({
      ...current,
      drafts: {
        ...current.drafts,
        [taskId]: {
          ...createDraftForTask(task),
          ...(current.drafts[taskId] ?? {}),
          ...patch,
        },
      },
    }));
  };

  const handleStartTask = (task: Task) => {
    if (workspace.workerStatus === "banned") {
      setError("Your account is banned and cannot start new tasks.");
      return;
    }

    if (task.status === "locked") {
      setError("This task is still locked until its release window opens.");
      return;
    }

    setWorkspace((current) => ({
      ...current,
      selectedTaskId: task.id,
      activeView: "detail",
      tasks: current.tasks.map((entry) =>
        entry.id === task.id && entry.status === "available"
          ? { ...entry, status: "in_progress", releaseLabel: "Started by you" }
          : entry
      ),
    }));
    setMessage("Task opened. Send the email, wait for a reply, then upload proof and submit.");
    setError(null);
    navigateToView("detail", task.id);
  };

  const handleSendTaskEmail = () => {
    if (!selectedTask) {
      return;
    }

    if (!selectedDraft.emailSubject.trim() || !selectedDraft.emailBody.trim()) {
      setError("Add both a subject and message before sending the email from the workspace.");
      return;
    }

    updateDraft(selectedTask.id, {
      emailSent: true,
      sentAt: new Date().toISOString(),
    });
    setMessage("Email recorded as sent from the frontend flow. Now wait for the recipient reply.");
    setError(null);
  };

  const handleCaptureReply = () => {
    if (!selectedTask) {
      return;
    }

    if (!selectedDraft.emailSent) {
      setError("Send the task email first before capturing a recipient reply.");
      return;
    }

    if (!selectedDraft.recipientReplyText.trim()) {
      setError("Paste or write the recipient reply before marking it as received.");
      return;
    }

    updateDraft(selectedTask.id, {
      replyReceivedAt: selectedDraft.replyReceivedAt ?? new Date().toISOString(),
    });
    setMessage("Recipient reply captured. Continue with screenshots, summary, and sentiment.");
    setError(null);
  };

  const handleFiles = (taskId: string, fileList: FileList | null) => {
    const names = fileList ? Array.from(fileList).map((file) => file.name) : [];
    updateDraft(taskId, { screenshotNames: names });
    setMessage(names.length ? "Screenshot names attached to your draft." : null);
  };

  const handleSubmitTask = () => {
    if (!selectedTask) {
      return;
    }

    const draft = {
      ...createDraftForTask(selectedTask),
      ...(workspace.drafts[selectedTask.id] ?? {}),
      screenshotNames: workspace.drafts[selectedTask.id]?.screenshotNames ?? [],
    };
    const followUpSatisfied =
      !selectedTask.requiresFollowUp || draft.followUpComplete;

    if (!draft.emailSent) {
      setError("Send the required email from the task workspace before submitting.");
      return;
    }

    if (!draft.replyReceivedAt || !draft.recipientReplyText.trim()) {
      setError("Capture the recipient reply before submitting this task.");
      return;
    }

    if (!draft.proofReady || !followUpSatisfied) {
      setError(
        "Complete the remaining checklist first: proof ready and follow-up if required."
      );
      return;
    }

    if (!draft.responseText.trim() || draft.screenshotNames.length === 0) {
      setError(
        "Add the recipient response summary and at least one screenshot before submitting."
      );
      return;
    }

    const submission: Submission = {
      id: `submission-${Date.now()}`,
      taskId: selectedTask.id,
      taskTitle: selectedTask.title,
      responseText: draft.responseText.trim(),
      sentiment: draft.sentiment,
      screenshotNames: draft.screenshotNames,
      submittedAt: new Date().toISOString(),
      status: "awaiting_review",
    };

    setWorkspace((current) => ({
      ...current,
      submissions: [submission, ...current.submissions],
      pendingBalance: Number((current.pendingBalance + selectedTask.payout).toFixed(2)),
      pendingReviewCount: current.pendingReviewCount + 1,
      tasks: current.tasks.map((task) =>
        task.id === selectedTask.id
          ? {
              ...task,
              status: "awaiting_review",
              releaseLabel: "Awaiting manual review",
            }
          : task
      ),
      drafts: {
        ...current.drafts,
        [selectedTask.id]: {
          ...createDraftForTask(selectedTask),
          sentiment: draft.sentiment,
        },
      },
    }));

    setMessage("Submission sent. It is now waiting for manual review.");
    setError(null);
  };

  const handleWithdrawal = () => {
    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid withdrawal amount.");
      return;
    }

    if (amount < surveymateRules.earlyPayoutThreshold) {
      setError(
        `Early withdrawals open only after the minimum $${surveymateRules.earlyPayoutThreshold} threshold.`
      );
      return;
    }

    if (amount > workspace.availableBalance) {
      setError("The requested amount is higher than your available balance.");
      return;
    }

    setWorkspace((current) => ({
      ...current,
      availableBalance: Number((current.availableBalance - amount).toFixed(2)),
      withdrawals: [
        {
          id: `withdrawal-${Date.now()}`,
          amount,
          method: withdrawMethod,
          requestedAt: new Date().toISOString(),
          status: "processing",
        },
        ...current.withdrawals,
      ],
    }));
    setWithdrawAmount(String(surveymateRules.earlyPayoutThreshold));
    setMessage("Withdrawal request submitted. It will appear in the next payout cycle.");
    setError(null);
  };

  const handleOnboarding = () => {
    const checks = [
      onboarding.noAi,
      onboarding.keepPurposePrivate,
      onboarding.continueConversation,
      onboarding.naturalTone,
    ];

    if (!onboarding.fullName.trim() || !onboarding.email.trim()) {
      setError("Fill in your name and email to continue.");
      return;
    }

    if (checks.includes(false)) {
      setError("Accept all worker rules before entering the workspace.");
      return;
    }

    const nextProfile = {
      workerId: workspace.profile?.workerId ?? defaultWorkerId,
      fullName: onboarding.fullName.trim(),
      email: onboarding.email.trim(),
      region: onboarding.region,
      payoutMethod: onboarding.payoutMethod,
      joinedAt: new Date().toISOString(),
      rulesAccepted: true,
      status: workspace.workerStatus,
    };

    setWorkspace((current) => ({
      ...current,
      profile: nextProfile,
      activeView: "dashboard",
    }));
    setWithdrawMethod(onboarding.payoutMethod);
    setMessage("Account setup complete. Your worker dashboard is ready.");
    setError(null);
    writeWorkerSession(nextProfile);
    router.push("/dashboard");
  };

  const loadDemoWorkspace = () => {
    const nextWorkspace = createDemoWorkspaceState();
    setWorkspace(nextWorkspace);
    setOnboarding(defaultOnboarding);
    setWithdrawMethod("Payoneer");
    setWithdrawAmount(String(surveymateRules.earlyPayoutThreshold));
    setMessage("Demo worker loaded. You can inspect every user feature immediately.");
    setError(null);
    if (nextWorkspace.profile) {
      writeWorkerSession(nextWorkspace.profile);
    }
    router.push("/dashboard");
  };

  const resetWorkspace = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    clearWorkerSession();
    setWorkspace(createInitialWorkspaceState());
    setOnboarding(defaultOnboarding);
    setWithdrawMethod("Payoneer");
    setWithdrawAmount(String(surveymateRules.earlyPayoutThreshold));
    setSearchQuery("");
    setStatusFilter("all");
    setMessage("Workspace reset. You can sign up again or load the demo worker.");
    setError(null);
    router.push("/sign-in");
  };

  const signOut = () => {
    clearWorkerSession();
    setMessage(null);
    setError(null);
    router.push("/sign-in");
  };

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fbff,#eef4ff)] px-6 py-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-[var(--brand-sky-200)] bg-white/90 p-8 text-center shadow-[0_32px_90px_rgba(29,78,216,0.1)]">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[var(--brand-sky-100)] text-[var(--brand-sky-700)]">
            <Sparkles className="size-7" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-foreground">
            Loading your Surveymate workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Preparing tasks, submissions, and payout state from this browser.
          </p>
        </div>
      </main>
    );
  }

  if (!workspace.profile) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff,#eef4ff)] px-6 py-10 sm:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2.25rem] border border-[var(--brand-sky-200)] bg-[linear-gradient(140deg,#ffffff,#eef4ff)] p-8 shadow-[0_28px_90px_rgba(29,78,216,0.08)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-sky-100)] px-4 py-2 text-sm font-medium text-[var(--brand-sky-700)]">
              <UserRoundPlus className="size-4" />
              Worker setup
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl">
              Complete the Surveymate user flow, not just the homepage.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              This workspace covers onboarding, task discovery, submission proof,
              warning visibility, stars, balances, and withdrawal requests in a
              blue and white product system.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Dashboard with earnings overview and user statistics",
                "Task list with release states, search, and claiming flow",
                "Task detail page with checklist, screenshots, and sentiment scoring",
                "Warnings, achievements, and withdrawal controls",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-white/90 px-5 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-[1.75rem] bg-[var(--brand-sky-900)] p-6 text-white">
              <p className="text-sm font-semibold tracking-[0.2em] text-white/70 uppercase">
                Worker rules
              </p>
              <div className="mt-5 grid gap-3">
                {[
                  "No AI-generated content in any message.",
                  "Do not disclose the platform purpose.",
                  "Continue the conversation until the response is usable.",
                  "Every submission needs screenshots and a sentiment score.",
                ].map((rule) => (
                  <div
                    key={rule}
                    className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm leading-6 text-white/84"
                  >
                    {rule}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[2.25rem] border border-[var(--brand-sky-200)] bg-white/92 p-8 shadow-[0_28px_90px_rgba(29,78,216,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[var(--brand-sky-500)] uppercase">
                  Sign up
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-foreground">
                  Enter the user workspace
                </h2>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
                onClick={loadDemoWorkspace}
              >
                Load Demo Worker
              </Button>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                  Full name
                </span>
                <input
                  value={onboarding.fullName}
                  onChange={(event) =>
                    setOnboarding((current) => ({
                      ...current,
                      fullName: event.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none placeholder:text-[var(--brand-sky-400)] focus:border-[var(--brand-sky-400)]"
                  placeholder="Maya Rahman"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                  Email
                </span>
                <input
                  type="email"
                  value={onboarding.email}
                  onChange={(event) =>
                    setOnboarding((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none placeholder:text-[var(--brand-sky-400)] focus:border-[var(--brand-sky-400)]"
                  placeholder="maya@example.com"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                    Region
                  </span>
                  <input
                    value={onboarding.region}
                    onChange={(event) =>
                      setOnboarding((current) => ({
                        ...current,
                        region: event.target.value,
                      }))
                    }
                    className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none placeholder:text-[var(--brand-sky-400)] focus:border-[var(--brand-sky-400)]"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                    Payout method
                  </span>
                  <select
                    value={onboarding.payoutMethod}
                    onChange={(event) =>
                      setOnboarding((current) => ({
                        ...current,
                        payoutMethod: event.target.value,
                      }))
                    }
                    className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 text-sm text-foreground outline-none focus:border-[var(--brand-sky-400)]"
                  >
                    <option>Payoneer</option>
                    <option>Wise</option>
                    <option>Bank transfer</option>
                  </select>
                </label>
              </div>

              <div className="rounded-[1.75rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                <p className="text-sm font-semibold text-[var(--brand-sky-800)]">
                  Accept all worker rules
                </p>
                <div className="mt-4 grid gap-3">
                  {[
                    {
                      key: "noAi",
                      label: "I will not use AI-generated content in any email.",
                    },
                    {
                      key: "keepPurposePrivate",
                      label: "I will not disclose the platform purpose to recipients.",
                    },
                    {
                      key: "continueConversation",
                      label:
                        "I will continue the conversation until the reply is complete enough to submit.",
                    },
                    {
                      key: "naturalTone",
                      label: "I will keep the message natural and organic.",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start gap-3 rounded-2xl border border-white bg-white/90 px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
                    >
                        <input
                          type="checkbox"
                          checked={Boolean(
                            onboarding[item.key as keyof OnboardingForm]
                          )}
                          onChange={(event) =>
                            setOnboarding((current) => {
                              const checked = event.target.checked;
                              if (item.key === "noAi") {
                                return { ...current, noAi: checked };
                              }

                              if (item.key === "keepPurposePrivate") {
                                return {
                                  ...current,
                                  keepPurposePrivate: checked,
                                };
                              }

                              if (item.key === "continueConversation") {
                                return {
                                  ...current,
                                  continueConversation: checked,
                                };
                              }

                              return { ...current, naturalTone: checked };
                            })
                          }
                          className="mt-1 size-4 rounded border-[var(--brand-sky-300)] text-[var(--brand-sky-500)]"
                        />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(message || error) && (
                <div
                  className={`rounded-2xl px-4 py-3 text-sm ${
                    error
                      ? "bg-[#fff5f5] text-[#b42318]"
                      : "bg-[var(--brand-sky-100)] text-[var(--brand-sky-800)]"
                  }`}
                >
                  {error ?? message}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="h-12 rounded-full px-6"
                  onClick={handleOnboarding}
                >
                  Enter Workspace
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
                  onClick={loadDemoWorkspace}
                >
                  Continue With Demo
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff,#eef4ff_45%,#f7faff)] px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:grid lg:grid-cols-[290px_1fr]">
        <aside className="rounded-[2rem] border border-[var(--brand-sky-200)] bg-white/90 p-5 shadow-[0_24px_80px_rgba(29,78,216,0.08)] backdrop-blur">
          <div className="rounded-[1.75rem] bg-[linear-gradient(160deg,#2563eb,#60a5fa)] p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold tracking-[0.18em] uppercase text-white/78">
                  Surveymate
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                  {workspace.profile.fullName}
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/12 text-lg font-semibold">
                SM
              </div>
            </div>
            <div className="mt-5 rounded-[1.4rem] border border-white/16 bg-white/10 px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.22em] text-white/72 uppercase">
                Worker status
              </p>
              <p className="mt-2 text-lg font-semibold">Stars: {workspace.stars}</p>
              <p className="mt-1 text-sm text-white/78">
                Joined {formatDate(workspace.profile.joinedAt)} | {workspace.profile.region}
              </p>
            </div>
          </div>

          <nav className="mt-5 grid gap-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveView(id)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                  workspace.activeView === id
                    ? "bg-[var(--brand-sky-100)] text-[var(--brand-sky-800)]"
                    : "text-[var(--brand-sky-600)] hover:bg-[var(--brand-sky-50)] hover:text-[var(--brand-sky-800)]"
                }`}
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-5 rounded-[1.6rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
            <p className="text-xs font-semibold tracking-[0.2em] text-[var(--brand-sky-500)] uppercase">
              Quick status
            </p>
            <div className="mt-4 grid gap-3">
              {[
                `Available tasks: ${availableCount}`,
                `In progress: ${activeCount}`,
                `Awaiting review: ${awaitingCount}`,
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white bg-white/90 px-4 py-3 text-sm text-[var(--brand-sky-800)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
              onClick={loadDemoWorkspace}
            >
              <RefreshCcw className="size-4" />
              Demo
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
              onClick={signOut}
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
              onClick={resetWorkspace}
            >
              Reset
            </Button>
          </div>
        </aside>

        <section className="flex flex-col gap-4">
          <header className="rounded-[2rem] border border-[var(--brand-sky-200)] bg-white/92 p-6 shadow-[0_24px_80px_rgba(29,78,216,0.08)] backdrop-blur">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.22em] text-[var(--brand-sky-500)] uppercase">
                  User workspace
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-foreground sm:text-5xl">
                  Real task flow, proof submission, and payout controls.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
                  The frontend now covers the full worker path from onboarding to
                  submission review and withdrawal requests, using a blue and
                  white product system throughout.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                    Available balance
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--brand-sky-900)]">
                    {formatMoney(workspace.availableBalance)}
                  </p>
                </div>
                <div className="rounded-[1.35rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4">
                  <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                    Next payout
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--brand-sky-900)]">
                    {earliestPayoutDate}
                  </p>
                </div>
              </div>
            </div>

            {(message || error) && (
              <div
                className={`mt-5 rounded-2xl px-4 py-3 text-sm ${
                  error
                    ? "bg-[#fff5f5] text-[#b42318]"
                    : "bg-[var(--brand-sky-100)] text-[var(--brand-sky-800)]"
                }`}
              >
                {error ?? message}
              </div>
            )}
          </header>

          {workspace.activeView === "dashboard" && (
            <>
              <div className="grid gap-4 xl:grid-cols-4">
                {[
                  {
                    label: "Available tasks",
                    value: String(availableCount),
                    detail: "ready right now in your queue",
                    icon: ListTodo,
                  },
                  {
                    label: "In progress",
                    value: String(activeCount),
                    detail: "claimed and still waiting on your proof",
                    icon: MailCheck,
                  },
                  {
                    label: "Approval rate",
                    value: `${completionRate}%`,
                    detail: "based on reviewed submissions so far",
                    icon: BadgeCheck,
                  },
                  {
                    label: "Stars earned",
                    value: String(workspace.stars),
                    detail: "higher stars support better payout rates",
                    icon: Star,
                  },
                ].map(({ label, value, detail, icon: Icon }) => (
                  <article
                    key={label}
                    className="rounded-[1.8rem] border border-[var(--brand-sky-200)] bg-white/92 p-5 shadow-[0_20px_60px_rgba(29,78,216,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--brand-sky-500)]">{label}</p>
                        <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--brand-sky-900)]">
                          {value}
                        </p>
                      </div>
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--brand-sky-100)] text-[var(--brand-sky-700)]">
                        <Icon className="size-5" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {detail}
                    </p>
                  </article>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <AppPanel
                  eyebrow="Current priorities"
                  title="Your worker dashboard keeps payout, quality, and task speed in one place."
                  action={
                    <Button
                      className="rounded-full"
                      onClick={() => setActiveView("tasks")}
                    >
                      Open Tasks
                      <ArrowRight className="size-4" />
                    </Button>
                  }
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.6rem] bg-[linear-gradient(145deg,#2563eb,#60a5fa)] p-5 text-white">
                      <p className="text-sm text-white/78">Next step</p>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                        Finish your active task proof
                      </p>
                      <p className="mt-3 text-sm leading-6 text-white/80">
                        The fastest path to more earnings is submitting your claimed
                        task with screenshots and a clean response summary.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-5 rounded-full border-white/25 bg-white/14 text-white hover:bg-white/20"
                        onClick={() => setActiveView("detail")}
                      >
                        Review Task Detail
                      </Button>
                    </div>

                    <div className="rounded-[1.6rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                      <p className="text-sm text-[var(--brand-sky-500)]">
                        Early withdrawal readiness
                      </p>
                      <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-sky-900)]">
                        {withdrawalReady ? "Unlocked" : "Below threshold"}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        You need at least $
                        {surveymateRules.earlyPayoutThreshold} approved to request
                        an early payout.
                        Your current approved balance is{" "}
                        {formatMoney(workspace.availableBalance)}.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                      "Tasks are released gradually, not all at once.",
                      `The first ${surveymateRules.manualReviewTaskLimit} tasks are reviewed manually.`,
                      "Every submission needs screenshots and a sentiment score.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.4rem] border border-[var(--brand-sky-200)] bg-white px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </AppPanel>

                <AppPanel
                  eyebrow="Recent activity"
                  title="Submission and approval history"
                >
                  <div className="space-y-3">
                    {workspace.submissions.slice(0, 4).map((submission) => (
                      <div
                        key={submission.id}
                        className="rounded-[1.4rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--brand-sky-900)]">
                              {submission.taskTitle}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatDate(submission.submittedAt)} | sentiment{" "}
                              {submission.sentiment}/10
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              submission.status === "approved"
                                ? "bg-[var(--brand-sky-700)] text-white"
                                : submission.status === "flagged"
                                  ? "bg-[rgba(239,68,68,0.12)] text-[#dc2626]"
                                  : "bg-white text-[var(--brand-sky-700)]"
                            }`}
                          >
                            {submission.status === "approved"
                              ? "Approved"
                              : submission.status === "flagged"
                                ? "Flagged"
                                : "Awaiting review"}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-[var(--brand-sky-800)]">
                          {submission.responseText}
                        </p>
                      </div>
                    ))}
                  </div>
                </AppPanel>
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <AppPanel
                  eyebrow="Warnings and stars"
                  title="Your quality standing stays visible."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-white px-5 py-5">
                      <p className="text-sm text-[var(--brand-sky-500)]">
                        Warnings
                      </p>
                      <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--brand-sky-900)]">
                        {workspace.warnings} / {surveymateRules.maxWarningsBeforeBan}
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-[var(--brand-sky-100)]">
                        <div
                          className="h-2 rounded-full bg-[var(--brand-sky-500)]"
                          style={{
                            width: `${Math.min(
                              100,
                              (workspace.warnings /
                                surveymateRules.maxWarningsBeforeBan) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-white px-5 py-5">
                      <p className="text-sm text-[var(--brand-sky-500)]">
                        Next star progress
                      </p>
                      <p className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[var(--brand-sky-900)]">
                        {nextStarProgress}%
                      </p>
                      <div className="mt-4 h-2 rounded-full bg-[var(--brand-sky-100)]">
                        <div
                          className="h-2 rounded-full bg-[var(--brand-sky-700)]"
                          style={{ width: `${nextStarProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </AppPanel>

                <AppPanel eyebrow="Support" title="Always-on help keeps workers moving.">
                  <div className="grid gap-3 md:grid-cols-3">
                    {[
                      {
                        icon: Headset,
                        title: "24/7 support",
                        detail:
                          "Reach the support team any time task instructions feel unclear.",
                      },
                      {
                        icon: MessageSquareText,
                        title: "Proof guidance",
                        detail:
                          "If a screenshot is incomplete, use the notes field before submitting.",
                      },
                      {
                        icon: CalendarClock,
                        title: "Payout cadence",
                        detail:
                          "Weekly payouts continue even when early withdrawals are unavailable.",
                      },
                    ].map(({ icon: Icon, title, detail }) => (
                      <div
                        key={title}
                        className="rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4"
                      >
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-[var(--brand-sky-700)]">
                          <Icon className="size-5" />
                        </div>
                        <p className="mt-4 font-semibold text-[var(--brand-sky-900)]">
                          {title}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          {detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </AppPanel>
              </div>
            </>
          )}

          {workspace.activeView === "tasks" && (
            <>
              <AppPanel eyebrow="Task board" title="Browse all released and locked tasks.">
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--brand-sky-400)]" />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-12 w-full rounded-2xl border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] pl-11 pr-4 text-sm text-foreground outline-none placeholder:text-[var(--brand-sky-400)] focus:border-[var(--brand-sky-400)]"
                      placeholder="Search by task, category, or recipient"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {statusFilters.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setStatusFilter(filter.id)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                          statusFilter === filter.id
                            ? "bg-[var(--brand-sky-700)] text-white"
                            : "bg-[var(--brand-sky-50)] text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-100)]"
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  {filteredTasks.map((task) => (
                    <article
                      key={task.id}
                      className="rounded-[1.75rem] border border-[var(--brand-sky-200)] bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-[var(--brand-sky-500)]">
                            {task.category}
                          </p>
                          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[var(--brand-sky-900)]">
                            {task.title}
                          </h3>
                        </div>
                        <StatusPill status={task.status} />
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-[var(--brand-sky-50)] px-4 py-3">
                          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                            Reward
                          </p>
                          <p className="mt-2 text-lg font-semibold text-[var(--brand-sky-900)]">
                            {formatMoney(task.payout)}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-[var(--brand-sky-50)] px-4 py-3">
                          <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                            ETA
                          </p>
                          <p className="mt-2 text-lg font-semibold text-[var(--brand-sky-900)]">
                            {task.eta}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                        <p>Recipient: {task.recipientName}</p>
                        <p>{task.releaseLabel}</p>
                        <p>{task.dueLabel}</p>
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          className="rounded-full"
                          onClick={() => handleStartTask(task)}
                          disabled={
                            task.status === "awaiting_review" ||
                            task.status === "approved"
                          }
                        >
                          {task.status === "locked"
                            ? "Locked"
                            : task.status === "available"
                              ? "Start Task"
                              : "Open Task"}
                        </Button>
                        <Button
                          variant="outline"
                          className="rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
                          onClick={() => selectTask(task.id)}
                        >
                          View Detail
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </AppPanel>

              <AppPanel eyebrow="Release logic" title="Tasks are staged across the campaign window.">
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    "You only see tasks when your release slot opens.",
                    "Locked cards remain visible so future work is predictable.",
                    "Once claimed, the task moves into your detail workspace automatically.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </AppPanel>
            </>
          )}

          {workspace.activeView === "detail" && selectedTask && (
            <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
              <AppPanel
                eyebrow="Task detail"
                title={selectedTask.title}
                action={<StatusPill status={selectedTask.status} />}
              >
                <div className="grid gap-4">
                  <div className="rounded-[1.7rem] bg-[linear-gradient(145deg,#2563eb,#60a5fa)] p-5 text-white">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/78">Recipient</p>
                        <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
                          {selectedTask.recipientName}
                        </p>
                        <p className="mt-1 text-sm text-white/80">
                          {selectedTask.recipientEmail}
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/16 bg-white/10 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
                          Reward
                        </p>
                        <p className="mt-2 text-xl font-semibold">
                          {formatMoney(selectedTask.payout)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.6rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                        Subject
                      </p>
                      <p className="mt-3 text-lg font-semibold text-[var(--brand-sky-900)]">
                        {selectedTask.subject}
                      </p>
                    </div>
                    <div className="rounded-[1.6rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                        Tone and ETA
                      </p>
                      <p className="mt-3 text-lg font-semibold text-[var(--brand-sky-900)]">
                        {selectedTask.tone}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {selectedTask.eta}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--brand-sky-200)] bg-white p-5">
                    <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                      Message template
                    </p>
                    <p className="mt-4 rounded-[1.4rem] bg-[var(--brand-sky-50)] px-4 py-4 text-sm leading-7 text-[var(--brand-sky-900)]">
                      {selectedTask.messageTemplate}
                    </p>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--brand-sky-200)] bg-white p-5">
                    <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                      Task instructions
                    </p>
                    <div className="mt-4 grid gap-3">
                      {selectedTask.instructions.map((instruction) => (
                        <div
                          key={instruction}
                          className="rounded-[1.4rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
                        >
                          {instruction}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--brand-sky-200)] bg-white p-5">
                    <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                      Tips
                    </p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {selectedTask.tips.map((tip) => (
                        <div
                          key={tip}
                          className="rounded-[1.4rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
                        >
                          {tip}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </AppPanel>

              <AppPanel
                eyebrow="Submission"
                title="Send, wait for reply, then complete submission"
                action={
                  <div className="rounded-full bg-[var(--brand-sky-50)] px-4 py-2 text-sm font-medium text-[var(--brand-sky-700)]">
                    {flowStageLabel}
                  </div>
                }
              >
                <div className="grid gap-4">
                  <div className="rounded-[1.75rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                    <p className="text-sm font-semibold text-[var(--brand-sky-900)]">
                      Step 1 - Send the task email
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Prepare the outreach email inside the task workspace and
                      confirm the send step before moving forward.
                    </p>

                    <div className="mt-4 grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                          To
                        </span>
                        <div className="rounded-[1.4rem] border border-[var(--brand-sky-200)] bg-white px-4 py-4">
                          <p className="font-medium text-[var(--brand-sky-900)]">
                            {selectedTask.recipientName}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedTask.recipientEmail}
                          </p>
                        </div>
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                          Email subject
                        </span>
                        <input
                          value={selectedDraft.emailSubject}
                          onChange={(event) =>
                            updateDraft(selectedTask.id, {
                              emailSubject: event.target.value,
                            })
                          }
                          className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-white px-4 text-sm text-foreground outline-none transition focus:border-[var(--brand-sky-500)]"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                          Email body
                        </span>
                        <textarea
                          value={selectedDraft.emailBody}
                          onChange={(event) =>
                            updateDraft(selectedTask.id, {
                              emailBody: event.target.value,
                            })
                          }
                          className="min-h-36 rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-white px-4 py-4 text-sm leading-7 text-foreground outline-none transition focus:border-[var(--brand-sky-500)]"
                        />
                      </label>

                      <div className="flex flex-wrap items-center gap-3">
                        <Button className="rounded-full" onClick={handleSendTaskEmail}>
                          <Send className="size-4" />
                          {selectedDraft.emailSent ? "Update Send Step" : "Send Email"}
                        </Button>
                        {selectedDraft.sentAt ? (
                          <div className="rounded-full border border-[var(--brand-sky-200)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-sky-700)]">
                            Sent {formatDateTime(selectedDraft.sentAt)}
                          </div>
                        ) : (
                          <div className="rounded-full border border-dashed border-[var(--brand-sky-200)] bg-white px-4 py-2 text-sm font-medium text-[var(--brand-sky-600)]">
                            Not sent yet
                          </div>
                        )}
                      </div>

                      <p className="text-sm leading-6 text-muted-foreground">
                        This task email is addressed to the assigned recipient shown
                        above.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                    <p className="text-sm font-semibold text-[var(--brand-sky-900)]">
                      Step 2 - Wait for and capture the reply
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      After sending, the task moves into a waiting state. Once
                      the recipient replies, capture that message here before
                      preparing proof and submission.
                    </p>

                    <div className="mt-4 rounded-[1.35rem] border border-white bg-white px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]">
                      {!selectedDraft.emailSent ? (
                        "Send the task email first. The reply step unlocks after the send action is completed."
                      ) : selectedDraft.replyReceivedAt ? (
                        <>Reply captured on {formatDateTime(selectedDraft.replyReceivedAt)}.</>
                      ) : (
                        "The task is currently waiting for a recipient response."
                      )}
                    </div>

                    <label className="mt-4 grid gap-2">
                      <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                        Recipient reply
                      </span>
                      <textarea
                        value={selectedDraft.recipientReplyText}
                        onChange={(event) =>
                          updateDraft(selectedTask.id, {
                            recipientReplyText: event.target.value,
                          })
                        }
                        className="min-h-32 rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-white px-4 py-4 text-sm leading-7 text-foreground outline-none transition focus:border-[var(--brand-sky-500)]"
                        placeholder="Paste or write the recipient's latest response here."
                      />
                    </label>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <Button
                        variant="outline"
                        className="rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
                        onClick={handleCaptureReply}
                      >
                        <MailCheck className="size-4" />
                        Capture Reply
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                    <p className="text-sm font-semibold text-[var(--brand-sky-900)]">
                      Step 3 - Completion checklist
                    </p>
                    <div className="mt-4 grid gap-3">
                      {[
                        {
                          key: "followUpComplete",
                          label: selectedTask.requiresFollowUp
                            ? "I asked the follow-up question when it was needed."
                            : "This task does not require a follow-up message.",
                        },
                        {
                          key: "proofReady",
                          label: "My screenshots clearly show the conversation thread.",
                        },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-start gap-3 rounded-[1.35rem] border border-white bg-white px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
                        >
                          <input
                            type="checkbox"
                            checked={
                              item.key === "followUpComplete" &&
                              !selectedTask.requiresFollowUp
                                ? true
                                : Boolean(
                                    selectedDraft[
                                      item.key as keyof typeof selectedDraft
                                    ]
                                  )
                            }
                            disabled={
                              item.key === "followUpComplete" &&
                              !selectedTask.requiresFollowUp
                            }
                            onChange={(event) => {
                              const checked = event.target.checked;

                              if (item.key === "followUpComplete") {
                                updateDraft(selectedTask.id, {
                                  followUpComplete: checked,
                                });
                                return;
                              }

                              updateDraft(selectedTask.id, {
                                proofReady: checked,
                              });
                            }}
                            className="mt-1 size-4 rounded border-[var(--brand-sky-300)] text-[var(--brand-sky-500)]"
                          />
                          <span>{item.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                      Response summary
                    </span>
                    <textarea
                      value={selectedDraft.responseText}
                      onChange={(event) =>
                        updateDraft(selectedTask.id, {
                          responseText: event.target.value,
                        })
                      }
                      className="min-h-36 rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4 text-sm leading-6 text-foreground outline-none placeholder:text-[var(--brand-sky-400)] focus:border-[var(--brand-sky-400)]"
                      placeholder="Summarize the recipient's response in your own words."
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                        Sentiment score: {selectedDraft.sentiment}/10
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={10}
                        value={selectedDraft.sentiment}
                        onChange={(event) =>
                          updateDraft(selectedTask.id, {
                            sentiment: Number(event.target.value),
                          })
                        }
                        className="w-full accent-[var(--brand-sky-500)]"
                      />
                    </label>
                    <div className="rounded-[1.3rem] border border-[var(--brand-sky-200)] bg-white px-4 py-3 text-center">
                      <p className="text-xs font-semibold tracking-[0.18em] text-[var(--brand-sky-500)] uppercase">
                        Due
                      </p>
                      <p className="mt-2 text-sm font-medium text-[var(--brand-sky-800)]">
                        {selectedTask.dueLabel}
                      </p>
                    </div>
                  </div>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                      Screenshot proof
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={(event) =>
                        handleFiles(selectedTask.id, event.target.files)
                      }
                      className="rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4 text-sm text-[var(--brand-sky-800)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--brand-sky-500)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                    />
                  </label>

                  {selectedDraft.screenshotNames.length > 0 && (
                    <div className="rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-white p-4">
                      <p className="text-sm font-semibold text-[var(--brand-sky-900)]">
                        Attached proof
                      </p>
                      <div className="mt-3 grid gap-2">
                        {selectedDraft.screenshotNames.map((name) => (
                          <div
                            key={name}
                            className="flex items-center gap-3 rounded-2xl bg-[var(--brand-sky-50)] px-4 py-3 text-sm text-[var(--brand-sky-800)]"
                          >
                            <FileImage className="size-4 text-[var(--brand-sky-500)]" />
                            <span>{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                      Notes for reviewer
                    </span>
                    <textarea
                      value={selectedDraft.notes}
                      onChange={(event) =>
                        updateDraft(selectedTask.id, { notes: event.target.value })
                      }
                      className="min-h-24 rounded-[1.5rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4 text-sm leading-6 text-foreground outline-none placeholder:text-[var(--brand-sky-400)] focus:border-[var(--brand-sky-400)]"
                      placeholder="Explain anything unusual about the thread."
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="rounded-full"
                      onClick={handleSubmitTask}
                      disabled={
                        selectedTask.status === "approved" ||
                        selectedTask.status === "awaiting_review"
                      }
                    >
                      <Send className="size-4" />
                      Submit for Review
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
                      onClick={() => setActiveView("tasks")}
                    >
                      Back to Tasks
                    </Button>
                  </div>

                  {selectedTask.status === "awaiting_review" && (
                    <div className="rounded-[1.6rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                      <p className="text-sm font-semibold text-[var(--brand-sky-900)]">
                        Waiting for approval
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Your submission is in the manual review queue. Pending
                        earnings for this task remain in your pending balance
                        until approval.
                      </p>
                    </div>
                  )}
                </div>
              </AppPanel>
            </div>
          )}

          {workspace.activeView === "performance" && (
            <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <AppPanel eyebrow="Warnings" title="Quality controls are transparent to the worker.">
                <div className="rounded-[1.7rem] bg-[linear-gradient(145deg,#2563eb,#60a5fa)] p-5 text-white">
                  <p className="text-sm text-white/78">Warning ladder</p>
                  <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">
                    {workspace.warnings}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/80">
                    {surveymateRules.maxWarningsBeforeBan} warnings are allowed.
                    The {surveymateRules.banWarningCount}th warning
                    would remove access to future tasks.
                  </p>
                </div>

                <div className="mt-5 grid gap-3">
                  {[
                    `The first ${surveymateRules.manualReviewTaskLimit} tasks are reviewed manually.`,
                    "After that, periodic reviews continue based on quality.",
                    "Poor proof quality or unnatural tone can trigger a warning.",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.4rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </AppPanel>

              <AppPanel eyebrow="Achievements" title="Stars and performance indicators reward consistency.">
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    {
                      icon: Star,
                      title: "Current stars",
                      value: `${workspace.stars}`,
                      detail:
                        "Stars increase payout confidence and reflect quality consistency.",
                    },
                    {
                      icon: TrendingUp,
                      title: "Approval streak",
                      value: `${workspace.qualityStreak} clean`,
                      detail:
                        "Consecutive successful tasks move you toward the next star.",
                    },
                    {
                      icon: CheckCircle2,
                      title: "Tasks reviewed",
                      value: `${reviewedCount}`,
                      detail:
                        "Approved and pending submissions stay aligned with admin review counts.",
                    },
                    {
                      icon: ShieldCheck,
                      title: "Next star",
                      value: `${nextStarProgress}%`,
                      detail:
                        `A new star unlocks every ${surveymateRules.starAwardStreak} clean approvals in a row.`,
                    },
                  ].map(({ icon: Icon, title, value, detail }) => (
                    <div
                      key={title}
                      className="rounded-[1.6rem] border border-[var(--brand-sky-200)] bg-white p-5"
                    >
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--brand-sky-100)] text-[var(--brand-sky-700)]">
                        <Icon className="size-5" />
                      </div>
                      <p className="mt-4 text-sm text-[var(--brand-sky-500)]">
                        {title}
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--brand-sky-900)]">
                        {value}
                      </p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-[1.7rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                  <p className="text-sm font-semibold text-[var(--brand-sky-900)]">
                    Performance checklist
                  </p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      "Keep replies natural and concise.",
                      "Never disclose the platform purpose.",
                      "Capture complete screenshots before submitting.",
                      "Rate sentiment accurately from 1 to 10.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.3rem] border border-white bg-white px-4 py-4 text-sm leading-6 text-[var(--brand-sky-800)]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </AppPanel>
            </div>
          )}

          {workspace.activeView === "earnings" && (
            <>
              <div className="grid gap-4 xl:grid-cols-4">
                {[
                  {
                    label: "Approved balance",
                    value: formatMoney(workspace.availableBalance),
                    icon: WalletCards,
                  },
                  {
                    label: "Pending review balance",
                    value: formatMoney(workspace.pendingBalance),
                    icon: Clock3,
                  },
                  {
                    label: "Lifetime earnings",
                    value: formatMoney(workspace.lifetimeEarnings),
                    icon: BadgeDollarSign,
                  },
                  {
                    label: "Payout method",
                    value: workspace.profile.payoutMethod,
                    icon: CalendarClock,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <article
                    key={label}
                    className="rounded-[1.8rem] border border-[var(--brand-sky-200)] bg-white/92 p-5 shadow-[0_20px_60px_rgba(29,78,216,0.06)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-[var(--brand-sky-500)]">{label}</p>
                        <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[var(--brand-sky-900)]">
                          {value}
                        </p>
                      </div>
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--brand-sky-100)] text-[var(--brand-sky-700)]">
                        <Icon className="size-5" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                <AppPanel
                  eyebrow="Withdrawals"
                  title={`Request an early payout once you pass $${surveymateRules.earlyPayoutThreshold}.`}
                >
                  <div className="rounded-[1.6rem] border border-[var(--brand-sky-200)] bg-[var(--brand-sky-50)] p-5">
                    <p className="text-sm leading-6 text-[var(--brand-sky-800)]">
                      {surveymateRules.payoutCadenceLabel} payouts continue
                      automatically. Early withdrawals are available after you
                      reach the minimum threshold of $
                      {surveymateRules.earlyPayoutThreshold} in approved
                      balance.
                    </p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                          Amount
                        </span>
                        <input
                          type="number"
                          min={surveymateRules.earlyPayoutThreshold}
                          step="0.01"
                          value={withdrawAmount}
                          onChange={(event) => setWithdrawAmount(event.target.value)}
                          className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-white px-4 text-sm text-foreground outline-none focus:border-[var(--brand-sky-400)]"
                        />
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--brand-sky-800)]">
                          Method
                        </span>
                        <select
                          value={withdrawMethod}
                          onChange={(event) => setWithdrawMethod(event.target.value)}
                          className="h-12 rounded-2xl border border-[var(--brand-sky-200)] bg-white px-4 text-sm text-foreground outline-none focus:border-[var(--brand-sky-400)]"
                        >
                          <option>Payoneer</option>
                          <option>Wise</option>
                          <option>Bank transfer</option>
                        </select>
                      </label>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        className="rounded-full"
                        onClick={handleWithdrawal}
                        disabled={!withdrawalReady}
                      >
                        Request Withdrawal
                      </Button>
                      <Button
                        variant="outline"
                        className="rounded-full border-[var(--brand-sky-200)] bg-white text-[var(--brand-sky-700)] hover:bg-[var(--brand-sky-50)]"
                        onClick={() =>
                          setWithdrawAmount(String(workspace.availableBalance))
                        }
                      >
                        Use Full Balance
                      </Button>
                    </div>
                  </div>
                </AppPanel>

                <AppPanel eyebrow="History" title="Withdrawal and payout activity">
                  <div className="space-y-3">
                    {workspace.withdrawals.map((withdrawal) => (
                      <div
                        key={withdrawal.id}
                        className="rounded-[1.4rem] border border-[var(--brand-sky-200)] bg-white px-4 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--brand-sky-900)]">
                              {formatMoney(withdrawal.amount)}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {withdrawal.method} |{" "}
                              {formatDate(withdrawal.requestedAt)}
                            </p>
                          </div>
                          <span className="rounded-full bg-[var(--brand-sky-100)] px-3 py-1 text-xs font-semibold text-[var(--brand-sky-700)]">
                            {withdrawal.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </AppPanel>
              </div>
            </>
          )}

          <footer className="rounded-[2rem] border border-[var(--brand-sky-200)] bg-white/90 px-6 py-5 text-sm leading-6 text-muted-foreground shadow-[0_24px_80px_rgba(29,78,216,0.06)]">
            This user workspace now includes onboarding, dashboard metrics, task
            discovery, task detail with proof submission, warnings and stars, and
            withdrawal controls.
          </footer>
        </section>
      </div>
    </main>
  );
}
