"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: number;
  customerName: string;
};

export function OrderDeleteButton({ orderId, customerName }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    try {
      setDeleting(true);
      setError(null);
      const resp = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "DELETE",
      });
      let msg: string | null = null;
      try {
        const j = await resp.json();
        if (j?.error) msg = String(j.error);
      } catch {}
      if (!resp.ok) {
        throw new Error(msg || `Không thể xóa (HTTP ${resp.status}).`);
      }
      setConfirming(false);
      router.refresh();
    } catch (err) {
      const m =
        err instanceof Error ? err.message : "Lỗi hệ thống khi xóa đơn hàng.";
      setError(m);
    } finally {
      setDeleting(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="mhv-btn-secondary inline-flex h-[38px] w-[70px] shrink-0 items-center justify-center border px-2 py-2 text-xs font-normal tracking-[0.4px] transition-all duration-300 hover:border-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        title="Xóa đơn hàng này (xóa cả PDF trên Supabase)"
        disabled={deleting}
      >
        <span className="inline-flex text-base leading-none" aria-hidden>
          🗑
        </span>
        <span className="sr-only">Xoá</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 whitespace-nowrap text-xs">
      <div className="flex h-[38px] shrink-0 items-center gap-1.5 border px-2">
        <span
          aria-hidden
          className="text-sm leading-none text-red-600"
        >
          ⚠
        </span>
        <span className="max-w-[160px] truncate tracking-[0.4px] text-[var(--foreground)]">
          Xoá đơn của <strong className="font-medium">{customerName}</strong>?
        </span>
      </div>
      <button
        type="button"
        onClick={() => {
          setConfirming(false);
          setError(null);
        }}
        disabled={deleting}
        className="mhv-btn-secondary inline-flex h-[38px] shrink-0 items-center justify-center px-3 py-2 tracking-[0.4px] transition-opacity duration-300 hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Huỷ
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="inline-flex h-[38px] shrink-0 items-center justify-center gap-1.5 border px-3 py-2 tracking-[0.4px] text-white transition-opacity duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundColor: "#dc2626",
          borderColor: "#dc2626",
        }}
        title="Xoá vĩnh viễn đơn hàng này khỏi CSDL và xóa file PDF trên Supabase Storage luôn."
      >
        <span className="inline-flex text-sm leading-none" aria-hidden>
          {deleting ? "…" : "🗑"}
        </span>
        <span>{deleting ? "Đang xoá..." : "Xác nhận xoá"}</span>
      </button>
      {error ? (
        <span
          className="inline-flex h-[38px] items-center truncate px-2 tracking-[0.4px] text-red-600"
          title={error}
        >
          {error.length > 32 ? error.slice(0, 30) + "…" : error}
        </span>
      ) : null}
    </div>
  );
}
