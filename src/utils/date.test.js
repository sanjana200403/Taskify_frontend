import { describe, expect, it } from "vitest";
import { formatWeekRange, getWeekDays, taskToForm, toLocalDateKey, toLocalTimeValue, toTaskPayload } from "./date.js";

describe("date utilities", () => {
  it("builds a Monday-to-Sunday strip across a month boundary", () => {
    const days = getWeekDays("2026-10-26");
    expect(days).toHaveLength(7);
    expect(days[0].iso).toBe("2026-10-26");
    expect(days[6].iso).toBe("2026-11-01");
    expect(formatWeekRange("2026-10-26", "2026-11-01")).toContain(" - ");
  });

  it("round-trips a task through local form values", () => {
    const form = taskToForm({
      title: "Plan",
      description: "Details",
      scheduledAt: "2026-11-03T09:30:00.000Z",
      priority: "High",
      status: "Completed",
    });
    const payload = toTaskPayload(form);
    expect(payload.title).toBe("Plan");
    expect(payload.priority).toBe("High");
    expect(payload.status).toBe("Completed");
    expect(new Date(payload.scheduledAt).toString()).not.toBe("Invalid Date");
  });

  it("builds new-task defaults from local values and accepts a selected date", () => {
    const now = new Date(2026, 10, 4, 12, 6);
    expect(toLocalDateKey(now)).toBe("2026-11-04");
    expect(toLocalTimeValue(now)).toBe("12:06");
    expect(taskToForm(null, { now, date: "2026-11-06" })).toMatchObject({ date: "2026-11-06", time: "12:06" });
  });
});
