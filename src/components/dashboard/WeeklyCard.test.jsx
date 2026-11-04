import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WeeklyCard from "./WeeklyCard.jsx";

describe("WeeklyCard", () => {
  it("shows counts and requests expansion", () => {
    const onClick = vi.fn();
    render(
      <WeeklyCard
        summary={{ weekStart: "2026-11-02", weekEnd: "2026-11-08", totalTasks: 4, openTasks: 3, completedTasks: 1 }}
        expanded={false}
        onClick={onClick}
      />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("shows expanded content on every viewport", () => {
    render(
      <WeeklyCard
        summary={{ weekStart: "2026-11-02", weekEnd: "2026-11-08", totalTasks: 1, openTasks: 1, completedTasks: 0 }}
        expanded
        onClick={vi.fn()}
      >
        <p>Expanded week task</p>
      </WeeklyCard>,
    );

    const content = screen.getByText("Expanded week task").parentElement;
    expect(content).toBeVisible();
    expect(content).not.toHaveClass("lg:hidden");
  });
});
