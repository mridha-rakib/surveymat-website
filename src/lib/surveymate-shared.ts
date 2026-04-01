export type CampaignStatus = "draft" | "live" | "paused" | "completed";
export type ReviewStatus = "pending" | "approved" | "flagged";
export type WorkerStatus = "active" | "watch" | "banned";
export type PayoutStatus = "hold" | "ready" | "scheduled" | "paid";
export type UserTaskStatus =
  | "available"
  | "in_progress"
  | "awaiting_review"
  | "approved"
  | "locked";
export type SubmissionStatus = "awaiting_review" | "approved" | "flagged";
export type WithdrawalStatus = "processing" | "scheduled" | "paid" | "hold";

export const surveymateRules = {
  manualReviewTaskLimit: 10,
  maxWarningsBeforeBan: 3,
  banWarningCount: 4,
  starAwardStreak: 5,
  earlyPayoutThreshold: 10,
  payoutCadenceLabel: "Weekly",
  nextPayoutDateLabel: "April 5, 2026",
} as const;

export type SharedCampaign = {
  id: string;
  name: string;
  category: string;
  reward: number;
  quantity: number;
  assignedWorkers: number;
  approvedSubmissions: number;
  recipients: string[];
  messageTemplate: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  releasePercent: number;
};

export type SharedWorker = {
  id: string;
  name: string;
  email: string;
  region: string;
  payoutMethod: string;
  joinedAt: string;
  rulesAccepted: boolean;
  warnings: number;
  stars: number;
  qualityStreak: number;
  approvedCount: number;
  pendingReviews: number;
  status: WorkerStatus;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
};

export type SharedSubmissionSeed = {
  id: string;
  responseText: string;
  sentiment: number;
  screenshotNames: string[];
  submittedAt: string;
  status: SubmissionStatus;
};

export type SharedTaskDraftSeed = {
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

export type SharedTaskAssignment = {
  id: string;
  workerId: string;
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
  status: UserTaskStatus;
  tone: string;
  requiresFollowUp: boolean;
  draftSeed?: SharedTaskDraftSeed;
  submission?: SharedSubmissionSeed;
};

export type SharedReviewItem = {
  id: string;
  taskId?: string;
  workerId: string;
  workerName: string;
  campaignId: string;
  campaignName: string;
  responseText: string;
  proofCount: number;
  sentiment: number;
  submittedAt: string;
  reward: number;
  status: ReviewStatus;
};

export type SharedPayoutRow = {
  id: string;
  workerId: string;
  workerName: string;
  method: string;
  amount: number;
  readyAmount: number;
  pendingAmount: number;
  status: PayoutStatus;
  note: string;
  updatedAt: string;
};

export type SharedWithdrawalRequest = {
  id: string;
  workerId: string;
  amount: number;
  method: string;
  requestedAt: string;
  status: WithdrawalStatus;
};

export const defaultWorkerId = "worker-1";

export const sharedCampaigns: SharedCampaign[] = [
  {
    id: "camp-101",
    name: "Consumer appliance sentiment",
    category: "Consumer research",
    reward: 4.8,
    quantity: 180,
    assignedWorkers: 128,
    approvedSubmissions: 94,
    recipients: [
      "lena.ortiz@examplemail.com",
      "harper.lin@examplemail.com",
      "amir.patel@examplemail.com",
    ],
    messageTemplate:
      "Hi there, I wanted to ask about your recent appliance service experience. What stood out most to you, and did it change how you feel about the brand?",
    startDate: "2026-03-31",
    endDate: "2026-04-21",
    status: "live",
    releasePercent: 72,
  },
  {
    id: "camp-102",
    name: "Restaurant service pulse",
    category: "Service perception",
    reward: 4.1,
    quantity: 150,
    assignedWorkers: 68,
    approvedSubmissions: 51,
    recipients: [
      "noah.rivera@examplemail.com",
      "jamila.price@examplemail.com",
    ],
    messageTemplate:
      "Hi, I wanted to ask about your latest dining experience. What made the service feel either memorable or disappointing?",
    startDate: "2026-03-30",
    endDate: "2026-04-18",
    status: "live",
    releasePercent: 46,
  },
  {
    id: "camp-103",
    name: "Travel booking objections",
    category: "Product objections",
    reward: 5.2,
    quantity: 240,
    assignedWorkers: 203,
    approvedSubmissions: 165,
    recipients: [
      "sara.ahmed@examplemail.com",
      "chloe.bennett@examplemail.com",
      "maya.green@examplemail.com",
    ],
    messageTemplate:
      "Hi, I noticed you recently considered a travel booking. What made you hesitate before confirming it?",
    startDate: "2026-03-28",
    endDate: "2026-04-09",
    status: "paused",
    releasePercent: 83,
  },
  {
    id: "camp-104",
    name: "Mobile banking trust signals",
    category: "Financial product sentiment",
    reward: 5.6,
    quantity: 120,
    assignedWorkers: 0,
    approvedSubmissions: 0,
    recipients: [
      "iman.hossain@examplemail.com",
      "rafael.morris@examplemail.com",
      "sadia.rahim@examplemail.com",
    ],
    messageTemplate:
      "Hi, I am curious what usually makes a banking app feel trustworthy to you. Is it security, support, clarity, or something else?",
    startDate: "2026-04-02",
    endDate: "2026-04-20",
    status: "draft",
    releasePercent: 0,
  },
];

export const sharedWorkers: SharedWorker[] = [
  {
    id: "worker-1",
    name: "Maya Rahman",
    email: "maya.rahman@example.com",
    region: "Dhaka, Bangladesh",
    payoutMethod: "Payoneer",
    joinedAt: "2026-03-12T09:00:00.000Z",
    rulesAccepted: true,
    warnings: 1,
    stars: 2,
    qualityStreak: 2,
    approvedCount: 11,
    pendingReviews: 1,
    status: "active",
    availableBalance: 32,
    pendingBalance: 4.8,
    lifetimeEarnings: 68.8,
  },
  {
    id: "worker-2",
    name: "Jamal Khan",
    email: "jamal.khan@example.com",
    region: "Lahore, Pakistan",
    payoutMethod: "Wise",
    joinedAt: "2026-03-10T08:15:00.000Z",
    rulesAccepted: true,
    warnings: 2,
    stars: 1,
    qualityStreak: 0,
    approvedCount: 6,
    pendingReviews: 1,
    status: "watch",
    availableBalance: 11,
    pendingBalance: 8,
    lifetimeEarnings: 34.2,
  },
  {
    id: "worker-3",
    name: "Nadia Sultana",
    email: "nadia.sultana@example.com",
    region: "Chittagong, Bangladesh",
    payoutMethod: "Bank transfer",
    joinedAt: "2026-03-05T10:00:00.000Z",
    rulesAccepted: true,
    warnings: 0,
    stars: 3,
    qualityStreak: 4,
    approvedCount: 18,
    pendingReviews: 1,
    status: "active",
    availableBalance: 64,
    pendingBalance: 0,
    lifetimeEarnings: 92.6,
  },
  {
    id: "worker-4",
    name: "Harun Molla",
    email: "harun.molla@example.com",
    region: "Khulna, Bangladesh",
    payoutMethod: "Payoneer",
    joinedAt: "2026-03-02T07:45:00.000Z",
    rulesAccepted: true,
    warnings: 4,
    stars: 0,
    qualityStreak: 0,
    approvedCount: 3,
    pendingReviews: 0,
    status: "banned",
    availableBalance: 0,
    pendingBalance: 0,
    lifetimeEarnings: 12,
  },
];

export const sharedTaskAssignments: SharedTaskAssignment[] = [
  {
    id: "task-101",
    workerId: "worker-1",
    campaignId: "camp-101",
    title: "Appliance repair follow-up",
    category: "Consumer research",
    recipientName: "Lena Ortiz",
    recipientEmail: "lena.ortiz@examplemail.com",
    subject: "Quick follow-up on your repair experience",
    messageTemplate:
      "Hi Lena, I wanted to follow up on your recent appliance repair experience. What stood out most about the service, and did it change how you feel about the brand?",
    instructions: [
      "Use the task subject and keep the email under 120 words.",
      "Do not mention Surveymate or any research platform.",
      "If the recipient responds, continue naturally until they explain their experience in enough detail.",
      "Capture the full exchange with screenshots before submitting.",
    ],
    tips: [
      "Sound curious, not scripted.",
      "Ask one follow-up question if the first reply is too short.",
    ],
    payout: 4.8,
    eta: "12-18 min",
    dueLabel: "Submitted March 29, 2026",
    releaseLabel: "Awaiting manual review",
    status: "awaiting_review",
    tone: "Warm and conversational",
    requiresFollowUp: true,
    submission: {
      id: "submission-401",
      responseText:
        "Recipient described fast technician arrival and clear communication as the main trust signal.",
      sentiment: 8,
      screenshotNames: ["lena-thread-1.png", "lena-thread-2.png"],
      submittedAt: "2026-03-29T10:30:00.000Z",
      status: "awaiting_review",
    },
  },
  {
    id: "task-102",
    workerId: "worker-1",
    campaignId: "camp-101",
    title: "Appliance trust check-in",
    category: "Consumer research",
    recipientName: "Harper Lin",
    recipientEmail: "harper.lin@examplemail.com",
    subject: "Following up on your last appliance service",
    messageTemplate:
      "Hi Harper, I wanted to ask about your last appliance service experience. What made the service feel reliable or disappointing to you?",
    instructions: [
      "Keep the opener natural and concise.",
      "Let the recipient describe the service in their own words.",
      "Upload screenshots and summarize the strongest detail after the reply arrives.",
    ],
    tips: [
      "Use one clear question rather than stacking multiple prompts.",
      "Pull a direct product insight into your summary field.",
    ],
    payout: 4.8,
    eta: "10-14 min",
    dueLabel: "Approved on March 27, 2026",
    releaseLabel: "Approved and paid",
    status: "approved",
    tone: "Friendly and direct",
    requiresFollowUp: false,
    submission: {
      id: "submission-398",
      responseText:
        "Recipient said the technician's clarity and punctuality made the brand feel dependable.",
      sentiment: 9,
      screenshotNames: ["harper-thread-1.png"],
      submittedAt: "2026-03-27T12:10:00.000Z",
      status: "approved",
    },
  },
  {
    id: "task-103",
    workerId: "worker-1",
    campaignId: "camp-101",
    title: "Appliance service sentiment",
    category: "Consumer research",
    recipientName: "Amir Patel",
    recipientEmail: "amir.patel@examplemail.com",
    subject: "A quick question about your appliance service",
    messageTemplate:
      "Hi Amir, I wanted to ask about your recent appliance service experience. What made it feel smooth or frustrating from your point of view?",
    instructions: [
      "Start with the provided subject line and stay direct.",
      "Keep the first email natural and concise.",
      "If the reply is vague, ask one clarifying follow-up.",
      "Upload screenshots and rate the response sentiment from 1 to 10.",
    ],
    tips: [
      "A single, well-placed follow-up usually improves approval odds.",
      "Screenshot both the sent email and the recipient reply.",
    ],
    payout: 4.8,
    eta: "12-16 min",
    dueLabel: "Submit by April 2, 2026",
    releaseLabel: "Available now",
    status: "available",
    tone: "Professional and calm",
    requiresFollowUp: true,
  },
  {
    id: "task-104",
    workerId: "worker-1",
    campaignId: "camp-102",
    title: "Restaurant service memory",
    category: "Service perception",
    recipientName: "Noah Rivera",
    recipientEmail: "noah.rivera@examplemail.com",
    subject: "One question about your dining experience",
    messageTemplate:
      "Hi Noah, I wanted to ask about your most recent dining experience. What made the service feel either memorable or disappointing?",
    instructions: [
      "Use a natural opener and let the recipient answer in their own words.",
      "Capture all relevant screenshots.",
      "Rate the conversation sentiment after submission.",
    ],
    tips: ["Natural tone is more important than overexplaining the question."],
    payout: 4.1,
    eta: "10-14 min",
    dueLabel: "Submit by April 2, 2026",
    releaseLabel: "Available now",
    status: "available",
    tone: "Casual and polite",
    requiresFollowUp: false,
  },
  {
    id: "task-105",
    workerId: "worker-1",
    campaignId: "camp-104",
    title: "Mobile banking trust signals",
    category: "Financial product sentiment",
    recipientName: "Iman Hossain",
    recipientEmail: "iman.hossain@examplemail.com",
    subject: "What builds trust in a banking app?",
    messageTemplate:
      "Hi Iman, I am curious what usually makes a banking app feel trustworthy to you. Is it security, support, clarity, or something else?",
    instructions: [
      "Wait for release before claiming the task.",
      "Once released, follow the task checklist in order.",
      "Submit screenshots and a sentiment score with your response summary.",
    ],
    tips: ["Trust-related topics often benefit from one clarifying follow-up."],
    payout: 5.6,
    eta: "15-18 min",
    dueLabel: "Releases April 2, 2026 at 09:00",
    releaseLabel: "Locked until release window",
    status: "locked",
    tone: "Respectful and thoughtful",
    requiresFollowUp: true,
  },
  {
    id: "task-106",
    workerId: "worker-1",
    campaignId: "camp-103",
    title: "Travel booking hesitation",
    category: "Product objections",
    recipientName: "Sara Ahmed",
    recipientEmail: "sara.ahmed@examplemail.com",
    subject: "Question about your recent booking decision",
    messageTemplate:
      "Hi Sara, I noticed you recently considered a travel booking. What made you pause or hesitate before confirming it?",
    instructions: [
      "Keep the opening email personal and human.",
      "If the reply is short, ask one follow-up question.",
      "Upload screenshots and summarize the final response clearly.",
    ],
    tips: [
      "Specific examples from the recipient strengthen approval.",
      "Use the notes field to explain any unusual thread details.",
    ],
    payout: 5.2,
    eta: "12-16 min",
    dueLabel: "Submit by April 4, 2026",
    releaseLabel: "Assigned before campaign pause",
    status: "in_progress",
    tone: "Supportive and natural",
    requiresFollowUp: true,
    draftSeed: {
      emailSent: true,
      emailSubject: "Question about your recent booking decision",
      emailBody:
        "Hi Sara, I noticed you recently considered a travel booking. What made you pause or hesitate before confirming it?",
      sentAt: "2026-03-31T08:20:00.000Z",
      recipientReplyText: "",
      replyReceivedAt: null,
      followUpComplete: false,
      proofReady: false,
      responseText: "",
      sentiment: 7,
      screenshotNames: [],
      notes: "Campaign is paused for new releases, but assigned work can still be completed.",
    },
  },
  {
    id: "task-107",
    workerId: "worker-1",
    campaignId: "camp-103",
    title: "Travel refund confidence",
    category: "Product objections",
    recipientName: "Chloe Bennett",
    recipientEmail: "chloe.bennett@examplemail.com",
    subject: "Following up on your booking hesitation",
    messageTemplate:
      "Hi Chloe, I wanted to ask what made your recent travel booking feel risky or difficult to trust before you committed.",
    instructions: [
      "Keep the exchange natural and do not reveal the research purpose.",
      "Capture screenshots once the reply is complete.",
      "Summarize the strongest objection in your response field.",
    ],
    tips: [
      "Refund confusion and hidden fees are strong signals if the recipient mentions them.",
    ],
    payout: 5.2,
    eta: "12-15 min",
    dueLabel: "Approved on March 26, 2026",
    releaseLabel: "Approved and paid",
    status: "approved",
    tone: "Curious and calm",
    requiresFollowUp: false,
    submission: {
      id: "submission-392",
      responseText:
        "Recipient said refund uncertainty and unclear baggage fees created most of the hesitation.",
      sentiment: 9,
      screenshotNames: ["chloe-travel-1.png", "chloe-travel-2.png"],
      submittedAt: "2026-03-26T11:05:00.000Z",
      status: "approved",
    },
  },
];

export const sharedReviews: SharedReviewItem[] = [
  {
    id: "review-401",
    taskId: "task-101",
    workerId: "worker-1",
    workerName: "Maya Rahman",
    campaignId: "camp-101",
    campaignName: "Consumer appliance sentiment",
    responseText:
      "Recipient described fast technician arrival and clear communication as the main trust signal.",
    proofCount: 2,
    sentiment: 8,
    submittedAt: "2026-03-29T10:30:00.000Z",
    reward: 4.8,
    status: "pending",
  },
  {
    id: "review-402",
    workerId: "worker-2",
    workerName: "Jamal Khan",
    campaignId: "camp-102",
    campaignName: "Restaurant service pulse",
    responseText:
      "Reply was short and needs another follow-up to confirm what made the service feel weak.",
    proofCount: 1,
    sentiment: 5,
    submittedAt: "2026-03-29T08:45:00.000Z",
    reward: 4.1,
    status: "pending",
  },
  {
    id: "review-403",
    workerId: "worker-3",
    workerName: "Nadia Sultana",
    campaignId: "camp-103",
    campaignName: "Travel booking objections",
    responseText:
      "Recipient said unclear baggage fees and poor refund confidence created the hesitation.",
    proofCount: 3,
    sentiment: 9,
    submittedAt: "2026-03-28T15:20:00.000Z",
    reward: 5.2,
    status: "pending",
  },
];

export const sharedPayoutRows: SharedPayoutRow[] = [
  {
    id: "payout-301",
    workerId: "worker-1",
    workerName: "Maya Rahman",
    method: "Payoneer",
    amount: 36.8,
    readyAmount: 32,
    pendingAmount: 4.8,
    status: "ready",
    note: "Approved work is ready for this week and one submission is still under review.",
    updatedAt: "2026-03-29T09:10:00.000Z",
  },
  {
    id: "payout-302",
    workerId: "worker-2",
    workerName: "Jamal Khan",
    method: "Wise",
    amount: 19,
    readyAmount: 11,
    pendingAmount: 8,
    status: "hold",
    note: "One review is still flagged for follow-up before release.",
    updatedAt: "2026-03-29T08:50:00.000Z",
  },
  {
    id: "payout-303",
    workerId: "worker-3",
    workerName: "Nadia Sultana",
    method: "Bank transfer",
    amount: 64,
    readyAmount: 64,
    pendingAmount: 0,
    status: "scheduled",
    note: "Scheduled for the next weekly batch.",
    updatedAt: "2026-03-28T12:00:00.000Z",
  },
];

export const sharedWithdrawalRequests: SharedWithdrawalRequest[] = [
  {
    id: "withdrawal-48",
    workerId: "worker-1",
    amount: 20,
    method: "Payoneer",
    requestedAt: "2026-03-22T07:30:00.000Z",
    status: "scheduled",
  },
  {
    id: "withdrawal-44",
    workerId: "worker-1",
    amount: 12,
    method: "Payoneer",
    requestedAt: "2026-03-15T07:30:00.000Z",
    status: "paid",
  },
  {
    id: "withdrawal-52",
    workerId: "worker-2",
    amount: 11,
    method: "Wise",
    requestedAt: "2026-03-29T08:30:00.000Z",
    status: "processing",
  },
];

export const getSharedCampaigns = () =>
  sharedCampaigns.map((campaign) => ({
    ...campaign,
    recipients: [...campaign.recipients],
  }));

export const getSharedWorkers = () => sharedWorkers.map((worker) => ({ ...worker }));

export const getSharedWorkerById = (workerId: string) =>
  sharedWorkers.find((worker) => worker.id === workerId);

export const getSharedTaskAssignments = (workerId: string) =>
  sharedTaskAssignments
    .filter((task) => task.workerId === workerId)
    .map((task) => ({
      ...task,
      instructions: [...task.instructions],
      tips: [...task.tips],
      draftSeed: task.draftSeed
        ? {
            ...task.draftSeed,
            screenshotNames: [...task.draftSeed.screenshotNames],
          }
        : undefined,
      submission: task.submission
        ? {
            ...task.submission,
            screenshotNames: [...task.submission.screenshotNames],
          }
        : undefined,
    }));

export const getSharedReviews = () => sharedReviews.map((review) => ({ ...review }));

export const getSharedPayoutRows = () => sharedPayoutRows.map((row) => ({ ...row }));

export const getSharedPayoutRowByWorker = (workerId: string) =>
  sharedPayoutRows.find((row) => row.workerId === workerId);

export const getSharedWithdrawalRequests = (workerId?: string) =>
  sharedWithdrawalRequests
    .filter((request) => !workerId || request.workerId === workerId)
    .map((request) => ({ ...request }));
