"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type BranchDeleteButtonProps = {
  branchId: number;
};

export function BranchDeleteButton({ branchId }: BranchDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleDelete() {
    setIsDeleting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/admin/branches/${branchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { message?: string }
          | null;
        throw new Error(result?.message || "Không thể xoá chi nhánh.");
      }

      router.refresh();
    } catch (error) {
      console.error("Không thể xoá chi nhánh:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Không thể xoá chi nhánh.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-2 text-right">
      <button
        type="button"
        onClick={handleDelete}
        className="mhv-btn-secondary inline-flex border border-[var(--border)] bg-white px-3 py-2 text-xs font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
      >
        {isDeleting ? "Đang xoá..." : "Xoá"}
      </button>

      {errorMessage ? <p className="text-xs text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
