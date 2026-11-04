import { Check, Eye, EyeOff, LockKeyhole, Mail, UserRound, X } from "lucide-react";
import { useRef, useState } from "react";
import { getPasswordChecks, PASSWORD_RULES, toAuthPayload, validateAuth } from "../../utils/authValidation.js";
import Button from "../common/Button.jsx";

function RequiredMark() {
  return (
    <span className="ml-0.5 text-rose-500" aria-hidden="true">
      *
    </span>
  );
}

function ErrorMessage({ id, message }) {
  if (!message) return null;
  return (
    <span id={id} role="alert" className="mt-1.5 block text-xs text-rose-600">
      {message}
    </span>
  );
}

export default function AuthForm({ mode, onSubmit, submitting, serverError }) {
  const register = mode === "register";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const dirtyFields = useRef(new Set());
  const passwordChecks = getPasswordChecks(values.password);

  const fieldClass = (name, padding = "") =>
    `field ${padding} ${errors[name] ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""}`;

  const update = (event) => {
    const { name, value } = event.target;
    dirtyFields.current.add(name);
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    const nextValidation = validateAuth(nextValues, mode);
    const affectedFields = name === "password" ? ["password", "confirmPassword"] : [name];
    setErrors((current) => {
      const next = { ...current };
      affectedFields.forEach((field) => {
        if (!touched[field]) return;
        if (nextValidation[field]) next[field] = nextValidation[field];
        else delete next[field];
      });
      return next;
    });
  };

  const blur = (event) => {
    const { name } = event.target;
    if (!dirtyFields.current.has(name) && !touched[name]) return;
    setTouched((current) => ({ ...current, [name]: true }));
    const message = validateAuth(values, mode)[name];
    setErrors((current) => {
      const next = { ...current };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validateAuth(values, mode);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(nextErrors).length) return;
    await onSubmit(toAuthPayload(values, mode));
  };

  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      {register && (
        <div className="block">
          <label className="field-label" htmlFor="auth-name">
            Full name
            <RequiredMark />
          </label>
          <span className="relative block">
            <UserRound className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              id="auth-name"
              className={fieldClass("name", "pl-11")}
              name="name"
              value={values.name}
              onChange={update}
              onBlur={blur}
              placeholder="Your name"
              autoComplete="name"
              required
              maxLength={80}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              autoFocus
            />
          </span>
          <ErrorMessage id="name-error" message={errors.name} />
        </div>
      )}

      <div className="block">
        <label className="field-label" htmlFor="auth-email">
          Email address
          <RequiredMark />
        </label>
        <span className="relative block">
          <Mail className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            id="auth-email"
            className={fieldClass("email", "pl-11")}
            type="email"
            name="email"
            value={values.email}
            onChange={update}
            onBlur={blur}
            placeholder="you@example.com"
            autoComplete="email"
            inputMode="email"
            required
            maxLength={254}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            autoFocus={!register}
          />
        </span>
        <ErrorMessage id="email-error" message={errors.email} />
      </div>

      <div className="block">
        <label className="field-label" htmlFor="auth-password">
          Password
          <RequiredMark />
        </label>
        <span className="relative block">
          <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            id="auth-password"
            className={fieldClass("password", "px-11")}
            type={showPassword ? "text" : "password"}
            name="password"
            value={values.password}
            onChange={update}
            onBlur={blur}
            placeholder={register ? "Create a strong password" : "Your password"}
            autoComplete={register ? "new-password" : "current-password"}
            required
            maxLength={72}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              [register ? "password-requirements" : "", errors.password ? "password-error" : ""]
                .filter(Boolean)
                .join(" ") || undefined
            }
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 icon-button h-8 w-8"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
        <ErrorMessage id="password-error" message={errors.password} />
      </div>

      {register && (
        <div
          id="password-requirements"
          className="-mt-2 grid grid-cols-2 gap-x-4 gap-y-2 rounded-xl bg-slate-50 px-4 py-3"
          aria-label="Password requirements"
        >
          {PASSWORD_RULES.map((rule) => {
            const complete = passwordChecks[rule.key];
            return (
              <span
                key={rule.key}
                className={`flex items-center gap-2 text-[11px] ${complete ? "text-emerald-700" : "text-slate-500"}`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-400"}`}
                >
                  {complete ? <Check size={10} strokeWidth={3} /> : <X size={9} strokeWidth={2.5} />}
                </span>
                {rule.label}
              </span>
            );
          })}
        </div>
      )}

      {register && (
        <div className="block">
          <label className="field-label" htmlFor="auth-confirm-password">
            Confirm password
            <RequiredMark />
          </label>
          <span className="relative block">
            <LockKeyhole className="pointer-events-none absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              id="auth-confirm-password"
              className={fieldClass("confirmPassword", "px-11")}
              type={showConfirmation ? "text" : "password"}
              name="confirmPassword"
              value={values.confirmPassword}
              onChange={update}
              onBlur={blur}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
              maxLength={72}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
            />
            <button
              type="button"
              className="absolute right-3 top-2.5 icon-button h-8 w-8"
              onClick={() => setShowConfirmation((value) => !value)}
              aria-label={showConfirmation ? "Hide password confirmation" : "Show password confirmation"}
            >
              {showConfirmation ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
          <ErrorMessage id="confirm-password-error" message={errors.confirmPassword} />
        </div>
      )}

      {serverError && (
        <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </div>
      )}
      <Button type="submit" className="w-full" loading={submitting}>
        {register ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}
