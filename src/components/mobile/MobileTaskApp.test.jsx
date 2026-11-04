import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MobileTaskApp from "./MobileTaskApp.jsx";

const analytics = {
  total: 0,
  completionRate: 0,
  status: { pending: 0, inProgress: 0, completed: 0 },
};

function renderOverview({
  tasks = [],
  onAdd = vi.fn(),
  onToggle = vi.fn(),
  onStatusChange = vi.fn(),
  onView = vi.fn(),
  onDelete = vi.fn(),
  selectedDate,
  onSelectedDateChange,
  visibleWeekStart,
  onVisibleWeekChange = vi.fn(),
  weeklySummaries = [],
  expandedWeek = "",
  expandedWeekTasks = [],
  onToggleWeek = vi.fn(),
  analyticsLoading = false,
  overviewTaskLoading = false,
  overviewTaskError = "",
  onRetryOverviewTasks = vi.fn(),
  analyticsValue = analytics,
} = {}) {
  const onViewChange = vi.fn();
  render(
    <MobileTaskApp
      view="overview"
      onViewChange={onViewChange}
      analytics={analyticsValue}
      analyticsLoading={analyticsLoading}
      tasks={tasks}
      query=""
      onQueryChange={vi.fn()}
      onAdd={onAdd}
      onToggle={onToggle}
      onStatusChange={onStatusChange}
      onView={onView}
      onEdit={vi.fn()}
      onDelete={onDelete}
      busyTaskId={null}
      onMenu={vi.fn()}
      selectedDate={selectedDate}
      onSelectedDateChange={onSelectedDateChange}
      visibleWeekStart={visibleWeekStart}
      onVisibleWeekChange={onVisibleWeekChange}
      weeklySummaries={weeklySummaries}
      expandedWeek={expandedWeek}
      expandedWeekTasks={expandedWeekTasks}
      onToggleWeek={onToggleWeek}
      overviewTaskLoading={overviewTaskLoading}
      overviewTaskError={overviewTaskError}
      onRetryOverviewTasks={onRetryOverviewTasks}
    />,
  );
  return { onViewChange };
}

function renderAllTasks(overrides = {}) {
  const props = {
    view: "tasks",
    onViewChange: vi.fn(),
    analytics,
    tasks: [],
    query: "",
    onQueryChange: vi.fn(),
    onAdd: vi.fn(),
    onToggle: vi.fn(),
    onStatusChange: vi.fn(),
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    busyTaskId: null,
    onMenu: vi.fn(),
    statusFilter: "",
    priorityFilter: "",
    onStatusFilterChange: vi.fn(),
    onPriorityFilterChange: vi.fn(),
    onClearTaskFilters: vi.fn(),
    taskMeta: { page: 1, total: 0, totalPages: 1 },
    taskLoading: false,
    taskError: "",
    onRetryTasks: vi.fn(),
    onTaskPageChange: vi.fn(),
    ...overrides,
  };

  render(<MobileTaskApp {...props} />);
  return props;
}

describe("MobileTaskApp responsive controls", () => {
  it("opens search from the mobile header and keeps notifications functional", () => {
    const { onViewChange } = renderOverview();

    const mobileSearch = screen.getByRole("button", { name: "Search tasks" });
    expect(mobileSearch).toHaveClass("mobile-header-search");
    fireEvent.click(mobileSearch);
    expect(onViewChange).toHaveBeenCalledWith("tasks");

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByRole("status")).toHaveTextContent("No new notifications");
  });

  it("closes the notification popover when the user presses outside it", () => {
    renderOverview();

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByRole("status")).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows tasks for the selected day", () => {
    const today = new Date();
    const target = new Date(today);
    target.setDate(today.getDate() + (today.getDay() === 0 ? -1 : 1));
    target.setHours(10, 0, 0, 0);
    const label = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(target);

    renderOverview({
      tasks: [
        { _id: "selected-day-task", title: "Selected day task", scheduledAt: target.toISOString(), status: "Pending" },
      ],
    });

    expect(screen.queryByText("Selected day task")).not.toBeInTheDocument();
    const taskDateButton = screen.getByRole("button", { name: `Show tasks for ${label}, 1 task` });
    expect(taskDateButton.querySelector(".mobile-week-task-dot")).toHaveClass("has-tasks");
    fireEvent.click(taskDateButton);
    expect(screen.getByText("Selected day task")).toBeInTheDocument();
  });

  it("does not show a task dot on empty dates", () => {
    renderOverview();

    const emptyDateButton = screen.getAllByRole("button", { name: /Show tasks for .+, no tasks/ })[0];
    expect(emptyDateButton.querySelector(".mobile-week-task-dot")).not.toHaveClass("has-tasks");
  });

  it("moves to the previous and next weeks while preserving the selected weekday", () => {
    const onVisibleWeekChange = vi.fn();
    renderOverview({
      selectedDate: "2026-11-04",
      visibleWeekStart: "2026-11-02",
      onVisibleWeekChange,
    });

    fireEvent.click(screen.getByRole("button", { name: "Show next week" }));
    expect(onVisibleWeekChange).toHaveBeenNthCalledWith(1, "2026-11-09", "2026-11-11");

    fireEvent.click(screen.getByRole("button", { name: "Show previous week" }));
    expect(onVisibleWeekChange).toHaveBeenNthCalledWith(2, "2026-10-26", "2026-10-28");
  });

  it("opens the task form with the selected date", () => {
    const onAdd = vi.fn();
    const selectedDate = toDateKey(new Date());
    renderOverview({ onAdd });

    fireEvent.click(screen.getByRole("button", { name: "Add task" }));
    expect(onAdd).toHaveBeenCalledWith(selectedDate);
  });

  it("uses direct completion semantics for the task checkbox", () => {
    const onToggle = vi.fn();
    const today = new Date();
    const task = {
      _id: "pending-task",
      title: "Pending task",
      scheduledAt: today.toISOString(),
      status: "Pending",
      priority: "Medium",
    };
    renderOverview({ tasks: [task], onToggle });

    fireEvent.click(screen.getByRole("button", { name: "Mark Pending task as complete" }));
    expect(onToggle).toHaveBeenCalledWith(task);
  });

  it("changes a task to in progress directly from its row", () => {
    const onStatusChange = vi.fn();
    const task = {
      _id: "status-task",
      title: "Prepare brief",
      scheduledAt: new Date().toISOString(),
      status: "Pending",
      priority: "Medium",
    };
    renderOverview({ tasks: [task], onStatusChange });

    fireEvent.change(screen.getByRole("combobox", { name: "Update status for Prepare brief" }), {
      target: { value: "In Progress" },
    });
    expect(onStatusChange).toHaveBeenCalledWith(task, "In Progress");
  });

  it("reveals delete after swiping a mobile task row left", () => {
    const onDelete = vi.fn();
    const task = {
      _id: "swipe-task",
      title: "Swipe task",
      scheduledAt: new Date().toISOString(),
      status: "Pending",
      priority: "Medium",
    };
    renderOverview({ tasks: [task], onDelete });

    const row = screen.getByText("Swipe task").closest("article");
    const dispatchPointer = (type, clientX, clientY) => {
      const event = new MouseEvent(type, { bubbles: true, cancelable: true, clientX, clientY });
      Object.defineProperties(event, {
        pointerId: { value: 1 },
        pointerType: { value: "touch" },
      });
      fireEvent(row, event);
    };

    dispatchPointer("pointerdown", 220, 40);
    dispatchPointer("pointermove", 120, 42);
    dispatchPointer("pointerup", 120, 42);

    expect(row.parentElement).toHaveClass("is-swipe-open");
    fireEvent.click(screen.getByRole("button", { name: "Delete Swipe task after swipe" }));
    expect(onDelete).toHaveBeenCalledWith(task);
  });

  it("shows skeletons instead of an empty state while overview tasks are loading", () => {
    renderOverview({ analyticsLoading: true, overviewTaskLoading: true });

    expect(screen.getByRole("status", { name: "Loading overview tasks" })).toBeInTheDocument();
    expect(screen.queryByText("No tasks today")).not.toBeInTheDocument();
    expect(document.querySelectorAll(".mobile-summary--loading")).toHaveLength(2);
  });

  it("shows an empty-week state instead of zero percent when there are no tasks", () => {
    renderOverview();

    expect(screen.getByText("No tasks this week")).toBeInTheDocument();
    expect(screen.queryByText("—")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar", { name: "Weekly task completion" })).not.toBeInTheDocument();
  });

  it("shows zero percent when tasks exist but none are completed", () => {
    renderOverview({
      analyticsValue: {
        total: 2,
        completionRate: 0,
        status: { pending: 1, inProgress: 1, completed: 0 },
      },
    });

    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.queryByText("No tasks this week")).not.toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Weekly task completion" })).toHaveAttribute("aria-valuenow", "0");
  });

  it("searches the current week's tasks inside the overview", () => {
    const today = new Date();
    const anotherDay = new Date(today);
    anotherDay.setDate(today.getDate() + (today.getDay() === 0 ? -1 : 1));
    const { onViewChange } = renderOverview({
      tasks: [
        {
          _id: "today-task",
          title: "Write report",
          description: "Quarterly notes",
          scheduledAt: today.toISOString(),
          status: "Pending",
          priority: "Medium",
        },
        {
          _id: "week-task",
          title: "Planning session",
          description: "Review roadmap",
          scheduledAt: anotherDay.toISOString(),
          status: "Pending",
          priority: "Medium",
        },
      ],
    });

    expect(screen.queryByText("Planning session")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search this week's tasks" }), {
      target: { value: "roadmap" },
    });

    expect(screen.getByText("Planning session")).toBeInTheDocument();
    expect(screen.queryByText("Write report")).not.toBeInTheDocument();
    expect(screen.getByText("Search Results")).toBeInTheDocument();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it("searches and filters the all tasks list", () => {
    const props = renderAllTasks();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search tasks" }), { target: { value: "report" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Status" }), { target: { value: "Completed" } });
    fireEvent.change(screen.getByRole("combobox", { name: "Priority" }), { target: { value: "High" } });

    expect(props.onQueryChange).toHaveBeenCalledWith("report");
    expect(props.onStatusFilterChange).toHaveBeenCalledWith("Completed");
    expect(props.onPriorityFilterChange).toHaveBeenCalledWith("High");
  });

  it("does not duplicate the sidebar create action on the all tasks screen", () => {
    renderAllTasks();

    expect(screen.queryByRole("button", { name: "Add task" })).not.toBeInTheDocument();
  });

  it("clears active all task filters and paginates results", () => {
    const props = renderAllTasks({
      query: "planning",
      statusFilter: "Pending",
      taskMeta: { page: 2, total: 24, totalPages: 3 },
    });

    fireEvent.click(screen.getByRole("button", { name: "Clear all task filters" }));
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(props.onClearTaskFilters).toHaveBeenCalledTimes(1);
    expect(props.onTaskPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(props.onTaskPageChange).toHaveBeenNthCalledWith(2, 3);
    expect(screen.getByText("24 results")).toBeInTheDocument();
  });

  it("shows a description preview and opens the separate view action", () => {
    const task = {
      _id: "search-result",
      title: "Review roadmap",
      description: "Compare the release plan with the customer feedback notes.",
      scheduledAt: new Date().toISOString(),
      status: "Pending",
      priority: "High",
    };
    const props = renderAllTasks({ tasks: [task], taskMeta: { page: 1, total: 1, totalPages: 1 } });

    expect(screen.getByText(task.description)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View Review roadmap" }));
    expect(props.onView).toHaveBeenCalledWith(task);
  });

  it("shows weekly task counts and the tasks inside an expanded week", () => {
    const onToggleWeek = vi.fn();
    const summary = {
      weekStart: "2026-11-02",
      weekEnd: "2026-11-08",
      totalTasks: 2,
      openTasks: 1,
      completedTasks: 1,
    };
    const task = {
      _id: "weekly-task",
      title: "Plan the release",
      description: "Review this week's launch checklist.",
      scheduledAt: "2026-11-04T10:00:00.000Z",
      status: "In Progress",
      priority: "High",
    };

    renderOverview({
      weeklySummaries: [summary],
      expandedWeek: summary.weekStart,
      expandedWeekTasks: [task],
      onToggleWeek,
    });

    expect(screen.getByText("Open")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Plan the release")).toBeInTheDocument();
    fireEvent.click(screen.getByText("2 tasks scheduled").closest("button"));
    expect(onToggleWeek).toHaveBeenCalledWith(summary);
  });
});

function toDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}
