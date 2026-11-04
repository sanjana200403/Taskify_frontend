import { ListTodo } from "lucide-react";

export default function EmptyState({
  title = "No tasks yet",
  message = "Create a task and make this week count.",
  action,
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-10 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <ListTodo size={22} />
      </span>
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
