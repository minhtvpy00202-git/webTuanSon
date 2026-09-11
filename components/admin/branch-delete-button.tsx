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
        className="inline-flex rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-sm"
      >
        {isDeleting ? "Đang xoá..." : "Xoá"}
      </button>

      {errorMessage ? <p className="text-xs text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
