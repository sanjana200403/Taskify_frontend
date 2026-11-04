const shortDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const longDate = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

export function formatWeekRange(start, end) {
  return `${shortDate.format(new Date(`${start}T00:00:00`))} - ${shortDate.format(new Date(`${end}T00:00:00`))}`;
}

export function formatTaskDate(date) {
  const value = new Date(date);
  return `${longDate.format(value)} at ${timeFormat.format(value)}`;
}

export function getWeekDays(start) {
  if (!start) return [];
  const base = new Date(`${start}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setDate(base.getDate() + index);
    return {
      weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(date).slice(0, 2),
      day: date.getDate(),
      iso: [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-"),
    };
  });
}

export function toTaskPayload(values) {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    scheduledAt: new Date(`${values.date}T${values.time}`).toISOString(),
    priority: values.priority,
    status: values.status,
  };
}

export function toLocalDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function toLocalTimeValue(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function taskToForm(task, defaults = {}) {
  if (!task) {
    const now = defaults.now ? new Date(defaults.now) : new Date();
    return {
      title: "",
      description: "",
      date: defaults.date || toLocalDateKey(now),
      time: defaults.time || toLocalTimeValue(now),
      priority: "Medium",
      status: "Pending",
    };
  }
  const date = new Date(task.scheduledAt);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString();
  return {
    title: task.title,
    description: task.description || "",
    date: local.slice(0, 10),
    time: local.slice(11, 16),
    priority: task.priority,
    status: task.status,
  };
}

export function weekQuery(summary) {
  const from = new Date(`${summary.weekStart}T00:00:00`);
  const to = new Date(`${summary.weekEnd}T23:59:59.999`);
  return { from: from.toISOString(), to: to.toISOString(), limit: 100 };
}
