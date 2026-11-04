import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

let bodyLockCount = 0;
let originalBodyOverflow = "";

function lockBodyScroll() {
  if (bodyLockCount === 0) {
    originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  bodyLockCount += 1;
}

function unlockBodyScroll() {
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount === 0) document.body.style.overflow = originalBodyOverflow;
}

function getFocusableElements(container) {
  return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true",
  );
}

/**
 * Provides modal keyboard behavior, focus containment, scroll locking, and focus restoration.
 */
export default function useDialogFocus({ open, onClose, closeDisabled = false, initialFocusRef } = {}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    const previouslyFocused = document.activeElement;
    lockBodyScroll();

    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = initialFocusRef?.current || getFocusableElements(dialog)[0] || dialog;
      firstFocusable.focus({ preventScroll: true });
    });

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (!closeDisabled) {
          event.preventDefault();
          onClose?.();
        }
        return;
      }

      if (event.key !== "Tab") return;
      const focusableElements = getFocusableElements(dialog);
      if (focusableElements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      unlockBodyScroll();
      if (previouslyFocused instanceof HTMLElement && previouslyFocused.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [closeDisabled, initialFocusRef, onClose, open]);

  return dialogRef;
}
