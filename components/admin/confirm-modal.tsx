"use client";

import { useState } from "react";

import { AdminModal } from "@/components/admin/admin-modal";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleConfirm() {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await onConfirm();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể thực hiện thao tác.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AdminModal open={open} title={title} onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="space-y-5">
        <p className="text-sm font-normal leading-7 text-slate-600 dark:text-slate-400 tracking-[0.4px]">{description}</p>

        {errorMessage ? (
          <div className="border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm text-red-600 dark:border-slate-700 dark:bg-slate-900 tracking-[0.4px]">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-normal text-slate-700 transition-all duration-200 ease-in-out hover:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 tracking-[0.4px]"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex border border-[var(--foreground)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-normal text-red-600 transition-all duration-200 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-70 tracking-[0.4px]"
          >
            {isSubmitting ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
