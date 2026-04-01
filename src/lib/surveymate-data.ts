import {
  defaultWorkerId,
  getSharedPayoutRowByWorker,
  getSharedTaskAssignments,
  getSharedWithdrawalRequests,
  getSharedWorkerById,
  surveymateRules,
  type SubmissionStatus,
  type UserTaskStatus,
  type WithdrawalStatus,
  type WorkerStatus,
} from "./surveymate-shared";

export type NavView =
  | "dashboard"
  | "tasks"
  | "detail"
  | "performance"
  | "earnings";

export type TaskStatus = UserTaskStatus;

export type Task = {
  id: string;
  campaignId: string;
  title: string;
  category: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  messageTemplate: string;
  instructions: string[];
  tips: string[];
  payout: number;
  eta: string;
  dueLabel: string;
  releaseLabel: string;
  status: TaskStatus;
  tone: string;
  requiresFollowUp: boolean;
};

export type TaskDraft = {
  emailSent: boolean;
  emailSubject: string;
  emailBody: string;
  sentAt: string | null;
  recipientReplyText: string;
  replyReceivedAt: string | null;
  followUpComplete: boolean;
  proofReady: boolean;
  responseText: string;
  sentiment: number;
  screenshotNames: string[];
  notes: string;
};

export type Submission = {
  id: string;
  taskId: string;
  taskTitle: string;
  responseText: string;
  sentiment: number;
  screenshotNames: string[];
  submittedAt: string;
  status: SubmissionStatus;
};

export type Withdrawal = {
  id: string;
  amount: number;
  method: string;
  requestedAt: string;
  status: WithdrawalStatus;
};

export type UserProfile = {
  workerId: string;
  fullName: string;
  email: string;
  region: string;
  payoutMethod: string;
  joinedAt: string;
  rulesAccepted: boolean;
  status: WorkerStatus;
};

export type WorkspaceState = {
  profile: UserProfile | null;
  activeView: NavView;
  selectedTaskId: string;
  tasks: Task[];
  drafts: Record<string, TaskDraft>;
  submissions: Submission[];
  warnings: number;
  stars: number;
  qualityStreak: number;
  workerStatus: WorkerStatus;
  approvedCount: number;
  pendingReviewCount: number;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  withdrawals: Withdrawal[];
};

export { surveymateRules };
export { defaultWorkerId };

const worker = getSharedWorkerById(defaultWorkerId);
const payoutRow = getSharedPayoutRowByWorker(defaultWorkerId);
const sharedTasks = getSharedTaskAssignments(defaultWorkerId);

if (!worker || !payoutRow || sharedTasks.length === 0) {
  throw new Error("Shared Surveymate worker scenario is incomplete.");
}

export const taskCatalog: Task[] = sharedTasks.map((task) => ({
  id: task.id,
  campaignId: task.campaignId,
  title: task.title,
  category: task.category,
  recipientName: task.recipientName,
  recipientEmail: task.recipientEmail,
  subject: task.subject,
  messageTemplate: task.messageTemplate,
  instructions: [...task.instructions],
  tips: [...task.tips],
  payout: task.payout,
  eta: task.eta,
  dueLabel: task.dueLabel,
  releaseLabel: task.releaseLabel,
  status: task.status,
  tone: task.tone,
  requiresFollowUp: task.requiresFollowUp,
}));

export const createEmptyDraft = (
  seed?: Partial<
    Pick<TaskDraft, "emailSubject" | "emailBody" | "sentAt" | "recipientReplyText" | "replyReceivedAt">
  >
): TaskDraft => ({
  emailSent: false,
  emailSubject: seed?.emailSubject ?? "",
  emailBody: seed?.emailBody ?? "",
  sentAt: seed?.sentAt ?? null,
  recipientReplyText: seed?.recipientReplyText ?? "",
  replyReceivedAt: seed?.replyReceivedAt ?? null,
  followUpComplete: false,
  proofReady: false,
  responseText: "",
  sentiment: 7,
  screenshotNames: [],
  notes: "",
});

export const createInitialDrafts = () =>
  sharedTasks.reduce<Record<string, TaskDraft>>((drafts, task) => {
    drafts[task.id] = task.draftSeed
      ? {
          ...task.draftSeed,
          screenshotNames: [...task.draftSeed.screenshotNames],
        }
      : createEmptyDraft({
          emailSubject: task.subject,
          emailBody: task.messageTemplate,
        });
    return drafts;
  }, {});

const createSubmissions = (): Submission[] =>
  sharedTasks
    .filter((task) => task.submission)
    .map((task) => ({
      id: task.submission!.id,
      taskId: task.id,
      taskTitle: task.title,
      responseText: task.submission!.responseText,
      sentiment: task.submission!.sentiment,
      screenshotNames: [...task.submission!.screenshotNames],
      submittedAt: task.submission!.submittedAt,
      status: task.submission!.status,
    }))
    .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt));

const createWithdrawals = (): Withdrawal[] =>
  getSharedWithdrawalRequests(defaultWorkerId)
    .map((withdrawal) => ({
      id: withdrawal.id,
      amount: withdrawal.amount,
      method: withdrawal.method,
      requestedAt: withdrawal.requestedAt,
      status: withdrawal.status,
    }))
    .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt));

export const createInitialWorkspaceState = (): WorkspaceState => ({
  profile: null,
  activeView: "dashboard",
  selectedTaskId: "task-106",
  tasks: taskCatalog.map((task) => ({ ...task })),
  drafts: createInitialDrafts(),
  submissions: createSubmissions(),
  warnings: worker.warnings,
  stars: worker.stars,
  qualityStreak: worker.qualityStreak,
  workerStatus: worker.status,
  approvedCount: worker.approvedCount,
  pendingReviewCount: worker.pendingReviews,
  availableBalance: payoutRow.readyAmount,
  pendingBalance: payoutRow.pendingAmount,
  lifetimeEarnings: worker.lifetimeEarnings,
  withdrawals: createWithdrawals(),
});

export const createDemoWorkspaceState = (): WorkspaceState => ({
  ...createInitialWorkspaceState(),
  profile: {
    workerId: worker.id,
    fullName: worker.name,
    email: worker.email,
    region: worker.region,
    payoutMethod: worker.payoutMethod,
    joinedAt: worker.joinedAt,
    rulesAccepted: worker.rulesAccepted,
    status: worker.status,
  },
});
