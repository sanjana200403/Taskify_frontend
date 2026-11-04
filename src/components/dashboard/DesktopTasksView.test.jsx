import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DesktopTasksView from "./DesktopTasksView.jsx";

describe("DesktopTasksView", () => {
  it("connects search, filters, clearing, and pagination", () => {
    const onFilterChange = vi.fn();
    const onClearFilters = vi.fn();
    const onPageChange = vi.fn();
    render(
      <DesktopTasksView
        filters={{ q: "plan", status: "Pending", priority: "", time: "all", sort: "activeNewest", page: 2 }}
        hasFilters
        taskMeta={{ page: 2, total: 12, totalPages: 3 }}
        taskListProps={{ tasks: [], loading: false, error: "", onAdd: vi.fn() }}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search title or description"), { target: { value: "review" } });
    expect(onFilterChange).toHaveBeenCalledWith("q", "review");
    expect(screen.getByRole("option", { name: "Open first, newest" }).selected).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
