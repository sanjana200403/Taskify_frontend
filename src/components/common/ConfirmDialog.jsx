import { AlertTriangle, X } from "lucide-react";
import useDialogFocus from "../../hooks/useDialogFocus.js";
import Button from "./Button.jsx";

export default function ConfirmDialog({ open, title, message, confirming, onConfirm, onClose }) {
  const dialogRef = useDialogFocus({ open, onClose, closeDisabled: confirming });
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-5 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !confirming) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm animate-slide-up rounded-3xl bg-white p-6 shadow-soft"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        tabIndex={-1}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle size={21} />
          </span>
          <button className="icon-button -mr-2 -mt-2" onClick={onClose} aria-label="Close confirmation">
            <X size={19} />
          </button>
        </div>
        <h2 id="confirm-title" className="text-lg font-semibold text-slate-950">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" loading={confirming} onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
