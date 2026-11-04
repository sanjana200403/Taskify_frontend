import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaskItem from "./TaskItem.jsx";

const task = {
  _id: "task-1",
  title: "Review assignment",
  description: "Check every requirement",
  scheduledAt: "2026-11-03T09:30:00.000Z",
  priority: "High",
  status: "In Progress",
};

describe("TaskItem", () => {
  it("exposes status, edit, and delete actions", () => {
    const onToggle = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(<TaskItem task={task} onToggle={onToggle} onEdit={onEdit} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark Review assignment as complete" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit Review assignment" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete Review assignment" }));
    expect(onToggle).toHaveBeenCalledWith(task);
    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onDelete).toHaveBeenCalledWith(task);
  });

  it("uses the checkbox to reopen a completed task", () => {
    const completedTask = { ...task, status: "Completed" };
    const onToggle = vi.fn();
    render(<TaskItem task={completedTask} onToggle={onToggle} onEdit={vi.fn()} onDelete={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Mark Review assignment as pending" }));
    expect(onToggle).toHaveBeenCalledWith(completedTask);
  });
});
