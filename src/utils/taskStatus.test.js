import { describe, expect, it } from "vitest";
import {
  getCompletionToggleStatus,
  updateAnalyticsStatus,
  updateTaskStatus,
  updateWeeklySummaryStatus,
} from "./taskStatus.js";

describe("task status utilities", () => {
  it("uses checkbox semantics instead of cycling through statuses", () => {
    expect(getCompletionToggleStatus("Pending")).toBe("Completed");
    expect(getCompletionToggleStatus("In Progress")).toBe("Completed");
    expect(getCompletionToggleStatus("Completed")).toBe("Pending");
  });

  it("optimistically updates the matching task", () => {
    const tasks = [
      { _id: "1", status: "In Progress" },
      { _id: "2", status: "Pending" },
    ];
    expect(updateTaskStatus(tasks, "1", "Completed")).toEqual([
      { _id: "1", status: "Completed" },
      { _id: "2", status: "Pending" },
    ]);
    expect(tasks[0].status).toBe("In Progress");
  });

  it("updates summary counts immediately for a task in the active period", () => {
    const analytics = {
      total: 3,
      status: { pending: 1, inProgress: 1, completed: 1 },
      completionRate: 33,
      rangeStart: "2026-11-02",
      rangeEnd: "2026-11-08",
    };
    const task = { scheduledAt: "2026-11-04T08:00:00.000Z" };
    expect(updateAnalyticsStatus(analytics, task, "In Progress", "Completed")).toMatchObject({
      status: { pending: 1, inProgress: 0, completed: 2 },
      completionRate: 67,
    });
  });

  it("updates the matching weekly card without refetching the screen", () => {
    const summaries = [
      { weekStart: "2026-11-02", weekEnd: "2026-11-08", totalTasks: 3, openTasks: 2, completedTasks: 1 },
      { weekStart: "2026-11-09", weekEnd: "2026-11-15", totalTasks: 1, openTasks: 1, completedTasks: 0 },
    ];
    const task = { scheduledAt: "2026-11-04T08:00:00.000Z" };

    expect(updateWeeklySummaryStatus(summaries, task, "In Progress", "Completed")).toEqual([
      { weekStart: "2026-11-02", weekEnd: "2026-11-08", totalTasks: 3, openTasks: 1, completedTasks: 2 },
      summaries[1],
    ]);
    expect(summaries[0]).toMatchObject({ openTasks: 2, completedTasks: 1 });
  });

  it("keeps weekly counts unchanged when moving between open statuses", () => {
    const summaries = [
      { weekStart: "2026-11-02", weekEnd: "2026-11-08", totalTasks: 2, openTasks: 2, completedTasks: 0 },
    ];
    const task = { scheduledAt: "2026-11-04T08:00:00.000Z" };

    expect(updateWeeklySummaryStatus(summaries, task, "Pending", "In Progress")).toBe(summaries);
  });
});
