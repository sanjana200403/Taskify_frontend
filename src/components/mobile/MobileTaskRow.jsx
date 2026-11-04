import { Check, ChevronDown, Clock3, Eye, Pencil, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { formatTaskDate } from "../../utils/date.js";

const SWIPE_ACTION_WIDTH = 82;

export default function MobileTaskRow({ task, onToggle, onStatusChange, onView, onEdit, onDelete, busy }) {
  const completed = task.status === "Completed";
  const priority = task.priority || "Medium";
  const priorityTone = priority.toLowerCase();
  const statusTone = (task.status || "Pending").toLowerCase().replace(" ", "-");
  const [swipeOffset, setSwipeOffsetState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const swipeOffsetRef = useRef(0);
  const pointerRef = useRef(null);

  const setSwipeOffset = (value) => {
    swipeOffsetRef.current = value;
    setSwipeOffsetState(value);
  };

  const settleSwipe = (open) => {
    pointerRef.current = null;
    setIsDragging(false);
    setSwipeOffset(open ? -SWIPE_ACTION_WIDTH : 0);
  };

  const startSwipe = (event) => {
    if (busy || event.pointerType === "mouse" || event.target.closest?.("button, select, input, a")) return;
    pointerRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: swipeOffsetRef.current,
      horizontal: false,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveSwipe = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - pointer.startX;
    const deltaY = event.clientY - pointer.startY;

    if (!pointer.horizontal && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) {
      settleSwipe(pointer.startOffset < 0);
      return;
    }
    if (Math.abs(deltaX) > 6) pointer.horizontal = true;
    if (!pointer.horizontal) return;

    event.preventDefault();
    setSwipeOffset(Math.max(-SWIPE_ACTION_WIDTH, Math.min(0, pointer.startOffset + deltaX)));
  };

  const endSwipe = (event) => {
    const pointer = pointerRef.current;
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    settleSwipe(swipeOffsetRef.current <= -(SWIPE_ACTION_WIDTH / 2));
  };

  return (
    <div
      className={`mobile-task-swipe-shell ${swipeOffset < 0 ? "is-swipe-open" : ""} ${isDragging ? "is-dragging" : ""}`}
    >
      <button
        type="button"
        className="mobile-swipe-delete"
        onFocus={() => settleSwipe(true)}
        onClick={() => {
          settleSwipe(false);
          onDelete(task);
        }}
        disabled={busy}
        aria-label={`Delete ${task.title} after swipe`}
      >
        <Trash2 size={17} />
        <span>Delete</span>
      </button>
      <article
        className={`mobile-task-row ${completed ? "is-complete" : ""}`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onPointerDown={startSwipe}
        onPointerMove={moveSwipe}
        onPointerUp={endSwipe}
        onPointerCancel={() => settleSwipe(swipeOffsetRef.current < 0)}
      >
        <button
          type="button"
          className={`mobile-task-check ${completed ? "is-complete" : ""}`}
          onClick={() => onToggle(task)}
          disabled={busy}
          aria-label={completed ? `Mark ${task.title} as pending` : `Mark ${task.title} as complete`}
        >
          {completed && <Check size={12} strokeWidth={3} />}
        </button>
        <div className="mobile-task-copy">
          <div className="mobile-task-title-line">
            <strong className={completed ? "is-complete" : ""}>{task.title}</strong>
            <span className={`mobile-priority-chip mobile-priority-chip--${priorityTone}`}>{priority}</span>
          </div>
          {task.description && <p className="mobile-task-description">{task.description}</p>}
          <div className="mobile-task-meta">
            <span>
              <Clock3 size={12} />
              {formatTaskDate(task.scheduledAt)}
            </span>
            <label className={`mobile-status-chip mobile-status-control mobile-status-chip--${statusTone}`}>
              <span className="sr-only">Update status for {task.title}</span>
              <select
                value={task.status || "Pending"}
                onChange={(event) => onStatusChange?.(task, event.target.value)}
                disabled={busy}
                aria-label={`Update status for ${task.title}`}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <ChevronDown size={11} aria-hidden="true" />
            </label>
          </div>
        </div>
        <div className="mobile-row-actions">
          <button
            type="button"
            className="mobile-row-action mobile-row-action--view"
            onClick={() => onView(task)}
            disabled={busy}
            title="View task"
            aria-label={`View ${task.title}`}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="mobile-row-action mobile-row-action--edit"
            onClick={() => onEdit(task)}
            disabled={busy}
            title="Edit task"
            aria-label={`Edit ${task.title}`}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            className="mobile-row-action mobile-row-action--delete"
            onClick={() => onDelete(task)}
            disabled={busy}
            title="Delete task"
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </article>
    </div>
  );
}
