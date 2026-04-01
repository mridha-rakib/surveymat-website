"use client";

import {
  createDemoWorkspaceState,
  createInitialWorkspaceState,
  type UserProfile,
  type WorkspaceState,
} from "@/lib/surveymate-data";

export const WORKER_WORKSPACE_STORAGE_KEY = "surveymate-user-workspace-v3";
export const WORKER_SESSION_STORAGE_KEY = "surveymate-user-session-v1";

export type WorkerSession = {
  workerId: string;
  email: string;
  fullName: string;
  signedInAt: string;
};

const canUseWindow = () => typeof window !== "undefined";

export const readWorkerWorkspace = (): WorkspaceState | null => {
  if (!canUseWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(WORKER_WORKSPACE_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WorkspaceState;
  } catch {
    window.localStorage.removeItem(WORKER_WORKSPACE_STORAGE_KEY);
    return null;
  }
};

export const writeWorkerWorkspace = (workspace: WorkspaceState) => {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.setItem(
    WORKER_WORKSPACE_STORAGE_KEY,
    JSON.stringify(workspace)
  );
};

export const resetWorkerWorkspace = () => {
  const workspace = createInitialWorkspaceState();
  writeWorkerWorkspace(workspace);
  return workspace;
};

export const seedDemoWorkerWorkspace = () => {
  const workspace = createDemoWorkspaceState();
  writeWorkerWorkspace(workspace);
  if (workspace.profile) {
    writeWorkerSession(workspace.profile);
  }
  return workspace;
};

export const readWorkerSession = (): WorkerSession | null => {
  if (!canUseWindow()) {
    return null;
  }

  const raw = window.localStorage.getItem(WORKER_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as WorkerSession;
  } catch {
    window.localStorage.removeItem(WORKER_SESSION_STORAGE_KEY);
    return null;
  }
};

export const writeWorkerSession = (profile: UserProfile) => {
  if (!canUseWindow()) {
    return;
  }

  const session: WorkerSession = {
    workerId: profile.workerId,
    email: profile.email,
    fullName: profile.fullName,
    signedInAt: new Date().toISOString(),
  };

  window.localStorage.setItem(WORKER_SESSION_STORAGE_KEY, JSON.stringify(session));
};

export const clearWorkerSession = () => {
  if (!canUseWindow()) {
    return;
  }

  window.localStorage.removeItem(WORKER_SESSION_STORAGE_KEY);
};

export const getWorkerAuthState = () => {
  const workspace = readWorkerWorkspace();
  const session = readWorkerSession();
  const profile = workspace?.profile ?? null;

  return {
    workspace,
    session,
    profile,
    isAuthenticated:
      Boolean(profile) &&
      Boolean(session) &&
      session?.workerId === profile?.workerId,
  };
};
