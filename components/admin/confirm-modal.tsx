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
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>

        {errorMessage ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 ease-in-out hover:border-orange-300 hover:bg-orange-50 hover:text-[var(--primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="inline-flex rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 ease-in-out hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Đang xử lý..." : confirmLabel}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
