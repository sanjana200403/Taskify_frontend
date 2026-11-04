import { toLocalDateKey } from "./date.js";

const analyticsStatusKey = {
  Pending: "pending",
  "In Progress": "inProgress",
  Completed: "completed",
};

export function getCompletionToggleStatus(status) {
  return status === "Completed" ? "Pending" : "Completed";
}

export function updateTaskStatus(tasks, taskId, status) {
  return tasks.map((task) => (task._id === taskId ? { ...task, status } : task));
}

export function updateAnalyticsStatus(analytics, task, previousStatus, nextStatus) {
  if (!analytics?.status || previousStatus === nextStatus) return analytics;

  const scheduledDate = toLocalDateKey(task.scheduledAt);
  const rangeStart = analytics.rangeStart?.slice(0, 10);
  const rangeEnd = analytics.rangeEnd?.slice(0, 10);
  if ((rangeStart && scheduledDate < rangeStart) || (rangeEnd && scheduledDate > rangeEnd)) return analytics;

  const previousKey = analyticsStatusKey[previousStatus];
  const nextKey = analyticsStatusKey[nextStatus];
  if (!previousKey || !nextKey) return analytics;

  const status = {
    ...analytics.status,
    [previousKey]: Math.max(0, analytics.status[previousKey] - 1),
    [nextKey]: analytics.status[nextKey] + 1,
  };
  const total = analytics.total || status.pending + status.inProgress + status.completed;

  return {
    ...analytics,
    status,
    completionRate: total ? Math.round((status.completed / total) * 100) : 0,
  };
}

export function updateWeeklySummaryStatus(summaries, task, previousStatus, nextStatus) {
  const wasCompleted = previousStatus === "Completed";
  const isCompleted = nextStatus === "Completed";
  if (wasCompleted === isCompleted) return summaries;

  const scheduledDate = toLocalDateKey(task.scheduledAt);
  let changed = false;
  const nextSummaries = summaries.map((summary) => {
    if (scheduledDate < summary.weekStart || scheduledDate > summary.weekEnd) return summary;

    changed = true;
    return {
      ...summary,
      openTasks: Math.max(0, summary.openTasks + (isCompleted ? -1 : 1)),
      completedTasks: Math.max(0, summary.completedTasks + (isCompleted ? 1 : -1)),
    };
  });

  return changed ? nextSummaries : summaries;
}
