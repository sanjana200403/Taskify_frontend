import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AuthForm from "./AuthForm.jsx";

describe("AuthForm registration", () => {
  it("shows required validation without submitting", async () => {
    const onSubmit = vi.fn();
    render(<AuthForm mode="register" onSubmit={onSubmit} submitting={false} serverError="" />);

    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    expect(screen.getByText("Email address is required.")).toBeInTheDocument();
    expect(screen.getByText("Password is required.")).toBeInTheDocument();
    expect(screen.getByText("Please confirm your password.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each(["login", "register"])("does not show errors when untouched %s fields lose focus", (mode) => {
    render(<AuthForm mode={mode} onSubmit={vi.fn()} submitting={false} serverError="" />);
    const email = screen.getByLabelText(/email address/i);
    const password = screen.getByPlaceholderText(mode === "login" ? "Your password" : "Create a strong password");

    fireEvent.focus(email);
    fireEvent.blur(email);
    fireEvent.focus(password);
    fireEvent.blur(password);

    expect(screen.queryByText("Email address is required.")).not.toBeInTheDocument();
    expect(screen.queryByText("Password is required.")).not.toBeInTheDocument();
  });

  it("validates a field after the user changes it and then leaves it empty", () => {
    render(<AuthForm mode="login" onSubmit={vi.fn()} submitting={false} serverError="" />);
    const email = screen.getByLabelText(/email address/i);

    fireEvent.change(email, { target: { value: "person@example.com" } });
    fireEvent.change(email, { target: { value: "" } });
    fireEvent.blur(email);

    expect(screen.getByText("Email address is required.")).toBeInTheDocument();
  });

  it("submits a normalized payload when every field is valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AuthForm mode="register" onSubmit={onSubmit} submitting={false} serverError="" />);

    await userEvent.type(screen.getByLabelText(/full name/i), "  Sanjana Maurya  ");
    await userEvent.type(screen.getByLabelText(/email address/i), "SANJANA@EXAMPLE.COM");
    await userEvent.type(screen.getByPlaceholderText("Create a strong password"), "Strong123!");
    await userEvent.type(screen.getByLabelText(/confirm password/i), "Strong123!");
    await userEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Sanjana Maurya",
      email: "sanjana@example.com",
      password: "Strong123!",
    });
  });
});
