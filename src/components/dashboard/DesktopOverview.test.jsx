import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DesktopOverview from "./DesktopOverview.jsx";

const analytics = {
  total: 2,
  status: { pending: 1, inProgress: 0, completed: 1 },
  priority: { low: 0, medium: 1, high: 1 },
  completionRate: 50,
  overdue: 0,
  dueSoon: 1,
  rangeStart: "2026-11-02",
  rangeEnd: "2026-11-08",
  activity: [{ key: "2026-11-04", label: "Wed", total: 2, completed: 1 }],
  upcoming: [
    {
      _id: "task-1",
      title: "Review the plan",
      scheduledAt: "2026-11-04T09:30:00.000Z",
      priority: "High",
      status: "Pending",
    },
  ],
};

const baseProps = {
  analytics,
  loading: false,
  error: "",
  range: "week",
  todayLabel: "Wednesday, November 4",
  greeting: "Good morning",
  firstName: "Sanjana",
  onRangeChange: vi.fn(),
  onRetry: vi.fn(),
  onOpenTask: vi.fn(),
  onCreateTask: vi.fn(),
  onViewAll: vi.fn(),
};

describe("DesktopOverview", () => {
  it("renders analytics and exposes task navigation actions", () => {
    const onViewAll = vi.fn();
    const onOpenTask = vi.fn();
    render(<DesktopOverview {...baseProps} onViewAll={onViewAll} onOpenTask={onOpenTask} />);

    expect(screen.getByRole("heading", { name: "Good morning, Sanjana." })).toBeInTheDocument();
    expect(screen.getByText("50% completion")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Review the plan/ }));
    expect(onOpenTask).toHaveBeenCalledWith(analytics.upcoming[0]);
    fireEvent.click(screen.getByRole("button", { name: /View all/ }));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it("shows an actionable error state", () => {
    const onRetry = vi.fn();
    render(<DesktopOverview {...baseProps} error="Network unavailable" onRetry={onRetry} />);
    expect(screen.getByText("Network unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
