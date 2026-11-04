import { X } from "lucide-react";
import { createPortal } from "react-dom";
import useDialogFocus from "../../hooks/useDialogFocus.js";
import TaskForm from "./TaskForm.jsx";

export default function TaskModal({ open, task, defaultDate, onClose, onSubmit, submitting }) {
  const dialogRef = useDialogFocus({ open, onClose, closeDisabled: submitting });

  if (!open) return null;
  return createPortal(
    <div
      className="task-modal-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/45 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="task-modal-panel max-h-[94vh] w-full overflow-y-auto rounded-t-[1.75rem] bg-white px-5 pb-7 pt-5 shadow-[0_-20px_70px_rgba(15,23,42,.18)] animate-slide-up sm:max-w-lg sm:rounded-[1.75rem] sm:p-7 sm:shadow-soft"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        tabIndex={-1}
      >
        <div className="task-modal-handle mx-auto mb-5 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
        <div className="task-dialog-header mb-7 flex items-center justify-between">
          <div>
            <p className="task-dialog-eyebrow text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
              {task ? "Update plan" : "Plan your week"}
            </p>
            <h2 id="task-modal-title" className="task-dialog-title mt-1 text-xl font-semibold text-slate-950">
              {task ? "Edit task" : "Add new task"}
            </h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close task form">
            <X size={20} />
          </button>
        </div>
        <TaskForm
          key={task?._id || `new-${defaultDate || "today"}`}
          task={task}
          defaultDate={defaultDate}
          onSubmit={onSubmit}
          submitting={submitting}
        />
      </div>
    </div>,
    document.body,
  );
}
