import { WorkerWorkspaceRoute } from "@/components/worker-workspace-route";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;

  return <WorkerWorkspaceRoute routeView="detail" routeTaskId={taskId} />;
}
