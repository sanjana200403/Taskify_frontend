import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { taskService } from "../../services/taskService.js";
import TaskSearch from "./TaskSearch.jsx";

vi.mock("../../services/taskService.js", () => ({ taskService: { search: vi.fn() } }));

describe("TaskSearch", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("debounces server search and can clear the query", async () => {
    vi.useFakeTimers();
    taskService.search.mockResolvedValue({ data: [{ _id: "1", title: "Wireframe" }] });
    const onStateChange = vi.fn();
    render(<TaskSearch onStateChange={onStateChange} />);
    fireEvent.change(screen.getByPlaceholderText("Search for a task"), { target: { value: "wire" } });
    expect(taskService.search).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(351);
    });
    expect(taskService.search).toHaveBeenCalledWith("wire", { limit: 100 });
    await act(async () => {
      await Promise.resolve();
    });
    expect(onStateChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ active: true, loading: false, query: "wire" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByPlaceholderText("Search for a task")).toHaveValue("");
  });
});
