import { Check, Clock3, Pencil, Trash2 } from "lucide-react";
import { formatTaskDate } from "../../utils/date.js";

const priorityStyle = {
  Low: "bg-emerald-50 text-emerald-700",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-rose-50 text-rose-700",
};

const statusStyle = {
  Pending: "bg-slate-100 text-slate-600",
  "In Progress": "bg-indigo-50 text-indigo-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

export default function TaskItem({ task, onToggle, onEdit, onDelete, busy = false }) {
  const complete = task.status === "Completed";
  return (
    <article className="group flex items-start gap-3 rounded-2xl border border-transparent px-2 py-3.5 transition hover:border-slate-100 hover:bg-slate-50/80 sm:px-3">
      <button
        type="button"
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-4 focus:ring-brand-100 ${complete ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-slate-400 hover:border-brand-500"}`}
        onClick={() => onToggle(task)}
        disabled={busy}
        aria-label={complete ? `Mark ${task.title} as pending` : `Mark ${task.title} as complete`}
      >
        {complete && <Check size={13} strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1 pt-px">
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`break-words text-sm font-medium ${complete ? "text-slate-400 line-through" : "text-slate-900"}`}
          >
            {task.title}
          </h3>
          <span className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${priorityStyle[task.priority]}`}>
            {task.priority}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${statusStyle[task.status] || statusStyle.Pending}`}
          >
            {task.status}
          </span>
        </div>
        {task.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{task.description}</p>}
        <p className="mt-2.5 flex items-center gap-1.5 text-[10px] text-slate-400">
          <Clock3 size={12} />
          {formatTaskDate(task.scheduledAt)}
        </p>
      </div>
      <div className="flex shrink-0 gap-0.5 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
        <button className="icon-button h-8 w-8" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`}>
          <Pencil size={15} />
        </button>
        <button
          className="icon-button h-8 w-8 hover:bg-rose-50 hover:text-rose-600"
          onClick={() => onDelete(task)}
          aria-label={`Delete ${task.title}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}
