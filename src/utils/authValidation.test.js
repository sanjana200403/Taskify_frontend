import { describe, expect, it } from "vitest";
import { getPasswordChecks, toAuthPayload, validateAuth } from "./authValidation.js";

describe("auth validation", () => {
  it("requires every registration field", () => {
    expect(validateAuth({}, "register")).toEqual({
      name: "Full name is required.",
      email: "Email address is required.",
      password: "Password is required.",
      confirmPassword: "Please confirm your password.",
    });
  });

  it("checks every strong-password requirement", () => {
    expect(getPasswordChecks("Strong123!")).toEqual({
      length: true,
      lowercase: true,
      uppercase: true,
      number: true,
      symbol: true,
      spaces: true,
    });
    expect(
      validateAuth(
        { name: "Sanjana", email: "sanjana@example.com", password: "weak password", confirmPassword: "weak password" },
        "register",
      ).password,
    ).toBe("Password must contain an uppercase letter.");
  });

  it("rejects a mismatched password confirmation", () => {
    const errors = validateAuth(
      { name: "Sanjana", email: "sanjana@example.com", password: "Strong123!", confirmPassword: "Different123!" },
      "register",
    );
    expect(errors.confirmPassword).toBe("Passwords do not match.");
  });

  it("normalizes names and email without including confirmation", () => {
    expect(
      toAuthPayload(
        {
          name: "  Sanjana Maurya  ",
          email: " SANJANA@EXAMPLE.COM ",
          password: "Strong123!",
          confirmPassword: "Strong123!",
        },
        "register",
      ),
    ).toEqual({
      name: "Sanjana Maurya",
      email: "sanjana@example.com",
      password: "Strong123!",
    });
  });
});
