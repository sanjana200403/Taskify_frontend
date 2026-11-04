import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TaskForm from "./TaskForm.jsx";

describe("TaskForm", () => {
  it("blocks an empty title and shows a useful validation message", () => {
    const submit = vi.fn();
    render(<TaskForm onSubmit={submit} submitting={false} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Finish wireframe"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));
    expect(screen.getByText("Task title is required.")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("marks required fields and validates missing date, time, priority, and status", () => {
    const submit = vi.fn();
    render(<TaskForm onSubmit={submit} submitting={false} />);

    expect(screen.getByLabelText("Task title")).toBeRequired();
    expect(screen.getByLabelText("Date")).toBeRequired();
    expect(screen.getByLabelText("Time")).toBeRequired();
    expect(screen.getByLabelText("Priority")).toBeRequired();
    expect(screen.getByLabelText("Status")).toBeRequired();

    fireEvent.change(screen.getByLabelText("Date"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Time"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Priority"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));

    expect(screen.getByText("Choose a date.")).toBeInTheDocument();
    expect(screen.getByText("Choose a time.")).toBeInTheDocument();
    expect(screen.getByText("Choose a priority.")).toBeInTheDocument();
    expect(screen.getByText("Choose a status.")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });

  it("clears a field error as soon as the user corrects it", () => {
    render(<TaskForm onSubmit={vi.fn()} submitting={false} />);
    const title = screen.getByLabelText("Task title");
    fireEvent.change(title, { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));
    expect(screen.getByText("Task title is required.")).toBeInTheDocument();

    fireEvent.change(title, { target: { value: "Write report" } });
    expect(screen.queryByText("Task title is required.")).not.toBeInTheDocument();
  });

  it("submits a valid new task", () => {
    const submit = vi.fn();
    render(<TaskForm onSubmit={submit} submitting={false} />);
    fireEvent.change(screen.getByPlaceholderText("e.g. Finish wireframe"), { target: { value: "Build dashboard" } });
    fireEvent.click(screen.getByRole("button", { name: "Create task" }));
    expect(submit).toHaveBeenCalledOnce();
    expect(submit.mock.calls[0][0]).toMatchObject({ title: "Build dashboard", priority: "Medium", status: "Pending" });
  });

  it("uses the selected dashboard date for a new task", () => {
    render(<TaskForm defaultDate="2026-11-06" onSubmit={vi.fn()} submitting={false} />);
    expect(screen.getByLabelText("Date")).toHaveValue("2026-11-06");
  });

  it("prepopulates and submits edits", () => {
    const submit = vi.fn();
    const task = {
      _id: "1",
      title: "Old title",
      description: "Existing",
      scheduledAt: "2026-11-03T09:30:00.000Z",
      priority: "Low",
      status: "In Progress",
    };
    render(<TaskForm task={task} onSubmit={submit} submitting={false} />);
    const title = screen.getByDisplayValue("Old title");
    fireEvent.change(title, { target: { value: "New title" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
    expect(submit.mock.calls[0][0]).toMatchObject({ title: "New title", description: "Existing", priority: "Low" });
  });
});
