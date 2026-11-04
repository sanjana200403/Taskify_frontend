import { CalendarDays, Pencil, X } from "lucide-react";
import { createPortal } from "react-dom";
import useDialogFocus from "../../hooks/useDialogFocus.js";
import { formatTaskDate } from "../../utils/date.js";
import Button from "../common/Button.jsx";

const priorityTone = {
  High: "bg-rose-50 text-rose-800",
  Medium: "bg-amber-50 text-amber-800",
  Low: "bg-emerald-50 text-emerald-800",
};

const statusTone = {
  Pending: "bg-slate-100 text-slate-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

export default function TaskDetailsModal({ task, onClose, onEdit }) {
  const dialogRef = useDialogFocus({ open: Boolean(task), onClose });

  if (!task) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/45 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="task-details-panel max-h-[92dvh] w-full overflow-y-auto rounded-t-[1.75rem] bg-white px-5 pb-7 pt-5 shadow-[0_-20px_70px_rgba(15,23,42,.18)] animate-slide-up sm:max-w-lg sm:rounded-[1.5rem] sm:p-7 sm:shadow-soft"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-details-title"
        tabIndex={-1}
      >
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
        <header className="task-dialog-header flex items-start justify-between gap-5">
          <div className="min-w-0">
            <p className="task-dialog-eyebrow text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
              Task details
            </p>
            <h2
              id="task-details-title"
              className="task-dialog-title mt-1 break-words text-xl font-semibold tracking-[-0.02em] text-slate-950"
            >
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button -mr-2 -mt-2 shrink-0"
            onClick={onClose}
            aria-label="Close task details"
          >
            <X size={20} />
          </button>
        </header>

        <div className="mt-5 flex flex-wrap gap-2">
          <span
            className={`task-details-chip rounded-full px-3 py-1.5 text-[10px] font-semibold ${priorityTone[task.priority] || priorityTone.Medium}`}
          >
            {task.priority || "Medium"} priority
          </span>
          <span
            className={`task-details-chip rounded-full px-3 py-1.5 text-[10px] font-semibold ${statusTone[task.status] || statusTone.Pending}`}
          >
            {task.status || "Pending"}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <h3 className="task-details-label text-xs font-semibold text-slate-700">Description</h3>
          <p className="task-details-copy mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
            {task.description?.trim() || "No description was added for this task."}
          </p>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-slate-100 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <CalendarDays size={17} />
          </span>
          <div>
            <span className="task-details-label block text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
              Scheduled for
            </span>
            <strong className="task-details-value mt-1 block text-sm font-medium text-slate-800">
              {formatTaskDate(task.scheduledAt)}
            </strong>
          </div>
        </div>

        <footer className="task-dialog-actions mt-7 grid grid-cols-2 gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={() => onEdit(task)}>
            <Pencil size={16} />
            Edit task
          </Button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
