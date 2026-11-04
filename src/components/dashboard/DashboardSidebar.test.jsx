import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardSidebar from "./DashboardSidebar.jsx";

describe("DashboardSidebar", () => {
  it("shows current-week progress and keeps navigation callbacks focused", () => {
    const onViewChange = vi.fn();
    const onClose = vi.fn();
    const onLogout = vi.fn();
    render(
      <DashboardSidebar
        user={{ name: "Sanjana Maurya", email: "sanjana@example.com" }}
        activeView="overview"
        totalTasks={4}
        currentWeekProgress={{ hasTasks: true, percentage: 75 }}
        onViewChange={onViewChange}
        onCreateTask={vi.fn()}
        onClose={onClose}
        onLogout={onLogout}
      />,
    );

    expect(screen.getByText("75% complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /All tasks/ }));
    expect(onViewChange).toHaveBeenCalledWith("tasks");
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Log out" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
