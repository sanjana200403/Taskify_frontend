export const PASSWORD_RULES = [
  {
    key: "length",
    label: "8–72 characters",
    error: "Password must contain between 8 and 72 characters.",
    test: (value) => value.length >= 8 && value.length <= 72,
  },
  {
    key: "lowercase",
    label: "One lowercase letter",
    error: "Password must contain a lowercase letter.",
    test: (value) => /[a-z]/.test(value),
  },
  {
    key: "uppercase",
    label: "One uppercase letter",
    error: "Password must contain an uppercase letter.",
    test: (value) => /[A-Z]/.test(value),
  },
  { key: "number", label: "One number", error: "Password must contain a number.", test: (value) => /\d/.test(value) },
  {
    key: "symbol",
    label: "One special character",
    error: "Password must contain a special character.",
    test: (value) => /[^A-Za-z0-9\s]/.test(value),
  },
  {
    key: "spaces",
    label: "No spaces",
    error: "Password must not contain spaces.",
    test: (value) => value.length > 0 && !/\s/.test(value),
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function getPasswordChecks(password = "") {
  return Object.fromEntries(PASSWORD_RULES.map((rule) => [rule.key, rule.test(password)]));
}

export function validateAuth(values, mode = "register") {
  const register = mode === "register";
  const errors = {};
  const name = values.name?.trim() || "";
  const email = values.email?.trim() || "";
  const password = values.password || "";
  const confirmPassword = values.confirmPassword || "";

  if (register) {
    if (!name) errors.name = "Full name is required.";
    else if (name.length < 2) errors.name = "Full name must contain at least 2 characters.";
    else if (name.length > 80) errors.name = "Full name must contain 80 characters or fewer.";
  }

  if (!email) errors.email = "Email address is required.";
  else if (email.length > 254 || !EMAIL_PATTERN.test(email)) errors.email = "Enter a valid email address.";

  if (!password) {
    errors.password = "Password is required.";
  } else if (register) {
    const failedRule = PASSWORD_RULES.find((rule) => !rule.test(password));
    if (failedRule) errors.password = failedRule.error;
  }

  if (register) {
    if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
    else if (confirmPassword !== password) errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function toAuthPayload(values, mode = "register") {
  const payload = {
    email: values.email.trim().toLowerCase(),
    password: values.password,
  };
  if (mode === "register") payload.name = values.name.trim();
  return payload;
}
