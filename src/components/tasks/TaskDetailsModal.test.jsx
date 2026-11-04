import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import TaskDetailsModal from "./TaskDetailsModal.jsx";

const task = {
  _id: "task-1",
  title: "Review assignment",
  description: "Check every requirement before submitting.",
  scheduledAt: "2026-11-04T09:30:00.000Z",
  priority: "High",
  status: "In Progress",
};

function ModalHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open details
      </button>
      <TaskDetailsModal task={open ? task : null} onClose={() => setOpen(false)} onEdit={vi.fn()} />
    </>
  );
}

describe("TaskDetailsModal", () => {
  it("shows the full task and keeps view and edit as separate actions", () => {
    const onClose = vi.fn();
    const onEdit = vi.fn();
    render(<TaskDetailsModal task={task} onClose={onClose} onEdit={onEdit} />);

    expect(screen.getByRole("dialog", { name: "Review assignment" })).toBeInTheDocument();
    expect(screen.getByText(task.description)).toBeInTheDocument();
    expect(screen.getByText("High priority")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit task" }));
    expect(onEdit).toHaveBeenCalledWith(task);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes with the close action", () => {
    const onClose = vi.fn();
    render(<TaskDetailsModal task={task} onClose={onClose} onEdit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Close task details" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("traps modal focus and restores it to the opener after Escape", async () => {
    render(<ModalHarness />);
    const opener = screen.getByRole("button", { name: "Open details" });
    opener.focus();
    fireEvent.click(opener);

    await waitFor(() => expect(screen.getByRole("button", { name: "Close task details" })).toHaveFocus());
    expect(document.body).toHaveStyle({ overflow: "hidden" });

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });
});
