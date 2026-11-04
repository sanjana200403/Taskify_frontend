import { CalendarDays, Clock3 } from "lucide-react";
import { useState } from "react";
import Button from "../common/Button.jsx";
import { taskToForm, toTaskPayload } from "../../utils/date.js";

function RequiredMark() {
  return (
    <span className="ml-0.5 text-rose-500" aria-hidden="true">
      *
    </span>
  );
}

export default function TaskForm({ task, defaultDate, onSubmit, submitting }) {
  const [values, setValues] = useState(() => taskToForm(task, { date: defaultDate }));
  const [errors, setErrors] = useState({});
  const update = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const fieldClass = (name, extra = "") =>
    `field ${extra} ${errors[name] ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""}`;

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!values.title.trim()) nextErrors.title = "Task title is required.";
    else if (values.title.trim().length > 160) nextErrors.title = "Task title must be 160 characters or fewer.";
    if (!values.date) nextErrors.date = "Choose a date.";
    if (!values.time) nextErrors.time = "Choose a time.";
    if (!values.priority) nextErrors.priority = "Choose a priority.";
    if (!values.status) nextErrors.status = "Choose a status.";
    if (values.description.length > 2000) nextErrors.description = "Description must be 2,000 characters or fewer.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    await onSubmit(toTaskPayload(values));
  };

  return (
    <form className="task-form space-y-5" onSubmit={submit} noValidate>
      <label className="block">
        <span className="field-label">
          Task title
          <RequiredMark />
        </span>
        <input
          name="title"
          aria-label="Task title"
          className={fieldClass("title")}
          value={values.title}
          onChange={update}
          placeholder="e.g. Finish wireframe"
          maxLength={160}
          required
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "task-title-error" : undefined}
          autoFocus
        />
        {errors.title && (
          <span id="task-title-error" role="alert" className="mt-1.5 block text-xs text-rose-600">
            {errors.title}
          </span>
        )}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="field-label">
            Date
            <RequiredMark />
          </span>
          <span className="relative block">
            <CalendarDays className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={17} />
            <input
              type="date"
              name="date"
              aria-label="Date"
              className={fieldClass("date", "pl-10")}
              value={values.date}
              onChange={update}
              required
              aria-invalid={Boolean(errors.date)}
              aria-describedby={errors.date ? "task-date-error" : undefined}
            />
          </span>
          {errors.date && (
            <span id="task-date-error" role="alert" className="mt-1.5 block text-xs text-rose-600">
              {errors.date}
            </span>
          )}
        </label>
        <label className="block">
          <span className="field-label">
            Time
            <RequiredMark />
          </span>
          <span className="relative block">
            <Clock3 className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={17} />
            <input
              type="time"
              name="time"
              aria-label="Time"
              className={fieldClass("time", "pl-10")}
              value={values.time}
              onChange={update}
              required
              aria-invalid={Boolean(errors.time)}
              aria-describedby={errors.time ? "task-time-error" : undefined}
            />
          </span>
          {errors.time && (
            <span id="task-time-error" role="alert" className="mt-1.5 block text-xs text-rose-600">
              {errors.time}
            </span>
          )}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="field-label">
            Priority
            <RequiredMark />
          </span>
          <select
            name="priority"
            aria-label="Priority"
            className={fieldClass("priority")}
            value={values.priority}
            onChange={update}
            required
            aria-invalid={Boolean(errors.priority)}
            aria-describedby={errors.priority ? "task-priority-error" : undefined}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          {errors.priority && (
            <span id="task-priority-error" role="alert" className="mt-1.5 block text-xs text-rose-600">
              {errors.priority}
            </span>
          )}
        </label>
        <label className="block">
          <span className="field-label">
            Status
            <RequiredMark />
          </span>
          <select
            name="status"
            aria-label="Status"
            className={fieldClass("status")}
            value={values.status}
            onChange={update}
            required
            aria-invalid={Boolean(errors.status)}
            aria-describedby={errors.status ? "task-status-error" : undefined}
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
          {errors.status && (
            <span id="task-status-error" role="alert" className="mt-1.5 block text-xs text-rose-600">
              {errors.status}
            </span>
          )}
        </label>
      </div>

      <label className="block">
        <span className="field-label">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <textarea
          name="description"
          aria-label="Description"
          className={fieldClass("description", "min-h-28 resize-y")}
          value={values.description}
          onChange={update}
          placeholder="Add a few helpful details"
          maxLength={2000}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? "task-description-error" : undefined}
        />
        {errors.description && (
          <span id="task-description-error" role="alert" className="mt-1.5 block text-xs text-rose-600">
            {errors.description}
          </span>
        )}
      </label>

      <Button type="submit" className="w-full" loading={submitting}>
        {task ? "Save changes" : "Create task"}
      </Button>
    </form>
  );
}
