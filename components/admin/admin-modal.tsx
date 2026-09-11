"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

type AdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminModal({
  open,
  title,
  description,
  onClose,
  children,
  maxWidthClassName = "max-w-3xl",
}: AdminModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-[61] max-h-[90vh] w-full overflow-hidden rounded-[28px] bg-white shadow-2xl ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800 ${maxWidthClassName}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
            {description ? (
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition-all duration-200 ease-in-out hover:border-orange-300 hover:bg-orange-50 hover:text-[var(--primary)] dark:border-slate-700 dark:text-slate-400 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10"
            aria-label="Đóng modal"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="max-h-[calc(90vh-88px)] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
