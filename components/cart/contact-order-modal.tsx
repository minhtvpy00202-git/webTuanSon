"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AdminModal } from "@/components/admin/admin-modal";
import { formatCurrency } from "@/lib/format";

export type OrderLine = {
  productId: number;
  productCode: string;
  name: string;
  quantity: number;
  unitLabel: string;
  unitPrice: number;
  amount: number;
};

export function CartIcon({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={style}>
      <path
        d="M4 6h2.5l2.2 11.3A2 2 0 0 0 10.7 19h7.6a2 2 0 0 0 2-1.7L21.5 9H6.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      <circle cx="10" cy="21" r="1.2" fill="currentColor" />
      <circle cx="18" cy="21" r="1.2" fill="currentColor" />
    </svg>
  );
}

function CheckMarkIcon({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={style}>
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function ExternalZaloIcon({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="0" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7 14c3 0 5-2 5-5M10.5 10.5H17M10.5 13.5H16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
      />
    </svg>
  );
}

type ContactOrderModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "cart" | "single";
  lines: OrderLine[];
  totalAmount: number;
  singleProductName?: string;
};

type SubmitResult = {
  ok: true;
  publicPdfUrl: string;
  zaloLink: string;
  zaloMessage: string;
};

export function ContactOrderModal({
  open,
  onClose,
  mode,
  lines,
  totalAmount,
  singleProductName,
}: ContactOrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    if (open && !openedRef.current) {
      openedRef.current = true;
    }
    if (!open) {
      openedRef.current = false;
      const t = setTimeout(() => {
        setCustomerName("");
        setCustomerPhone("");
        setTouched({});
        setError(null);
        setResult(null);
        setSubmitting(false);
      }, 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  const phoneValid = /^\s*(?:\+?84|0)\d{9,10}\s*$/.test(customerPhone);
  const nameValid = customerName.trim().length >= 2;
  const formValid = nameValid && phoneValid && lines.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formValid) {
      setTouched({ name: true, phone: true });
      return;
    }
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/order-to-zalo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          orderKind: mode,
          note: singleProductName
            ? `Đặt hàng nhanh từ sản phẩm: ${singleProductName}`
            : undefined,
          lines,
          totalAmount,
        }),
      });
      if (!resp.ok) {
        let msg = `Gửi đơn thất bại (${resp.status}). Vui lòng thử lại.`;
        try {
          const j = await resp.json();
          if (j?.error) msg = String(j.error);
        } catch {}
        throw new Error(msg);
      }
      const json = (await resp.json()) as SubmitResult;
      setResult(json);

      try {
        void json;
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không gửi được đơn. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  const title =
    mode === "cart" ? "Tạo đơn đặt hàng" : `Tạo đơn đặt ${lines[0]?.name ?? "sản phẩm"}`;
  const description =
    mode === "cart"
      ? "Nhập thông tin liên hệ, hệ thống sẽ tạo file PDF đơn hàng. Sau đó bạn tải file về và gửi cho cửa hàng qua Zalo để xác nhận."
      : "Nhập thông tin liên hệ, hệ thống sẽ tạo file PDF đơn hàng cho sản phẩm này. Sau đó bạn tải file về và gửi cho cửa hàng qua Zalo để xác nhận.";

  return (
    <AdminModal
      open={open}
      title={title}
      description={description}
      onClose={onClose}
      maxWidthClassName="max-w-xl"
    >
      {result ? (
        <div className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center border"
              style={{ borderColor: "#F27025", backgroundColor: "#F27025" }}
            >
              <CheckMarkIcon className="h-6 w-6" style={{ color: "#ffffff" }} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-normal tracking-[0.4px] text-[var(--foreground)]">
                Đã tạo đơn thành công
              </h3>
              <p className="text-sm leading-6 tracking-[0.4px] text-[var(--muted)]">
                File PDF đơn hàng đã được tạo. Làm theo 2 bước sau để gửi cho cửa hàng qua Zalo:
              </p>
              <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 tracking-[0.4px] text-[var(--muted)] marker:text-[#F27025]">
                <li>
                  <span className="text-[var(--foreground)]">Tải PDF đơn hàng</span> về máy (nút bên dưới).
                </li>
                <li>
                  <span className="text-[var(--foreground)]">Mở Zalo chat cửa hàng</span> → bấm biểu tượng đính kèm file → chọn file PDF vừa tải về → gửi.
                </li>
              </ol>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-col-reverse sm:gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={result.publicPdfUrl}
                download
                className="mhv-btn-secondary inline-flex min-h-[48px] items-center justify-center gap-2 px-5 py-3 text-sm transition-all duration-300 hover:bg-[var(--surface-muted)]"
              >
                <span className="inline-flex items-center justify-center text-base leading-none">⬇</span>
                <span>Tải PDF đơn hàng</span>
              </a>
              <Link
                href={result.publicPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mhv-btn-secondary inline-flex min-h-[48px] items-center justify-center gap-2 px-5 py-3 text-sm transition-all duration-300 hover:bg-[var(--surface-muted)]"
              >
                <span className="inline-flex items-center justify-center text-base leading-none">👁</span>
                <span>Xem trước PDF</span>
              </Link>
            </div>

            {result.zaloLink ? (
              <a
                href={result.zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mhv-btn-primary inline-flex min-h-[52px] items-center justify-center gap-3 px-6 py-3 text-base transition-all duration-300 hover:opacity-85"
                style={{ backgroundColor: "#F27025", borderColor: "#F27025", color: "#ffffff" }}
              >
                <ExternalZaloIcon className="h-5 w-5 shrink-0" />
                <span className="tracking-[0.4px]">Mở Zalo chat cửa hàng để gửi đơn</span>
              </a>
            ) : null}
          </div>

          <div className="flex justify-start sm:justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="mhv-btn-secondary inline-flex min-h-[44px] items-center justify-center px-6 py-2.5 text-sm tracking-[0.4px] transition-all duration-300 hover:bg-[var(--surface-muted)] sm:min-w-[160px]"
            >
              Đóng
            </button>
          </div>
        </div>
      ) : (
        <form className="space-y-5 px-6 py-6 sm:px-8 sm:py-7" onSubmit={handleSubmit}>
          <div className="space-y-3 border border-[var(--border)] p-4">
            <p className="text-xs font-normal uppercase tracking-[0.4px] text-[var(--muted)]">
              {mode === "cart" ? `Đơn hàng (${lines.length} loại)` : "Sản phẩm muốn đặt"}
            </p>
            <ul className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {lines.map((l) => (
                <li
                  key={l.productId}
                  className="flex items-start justify-between gap-3 text-sm tracking-[0.4px]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[var(--foreground)]">{l.name}</p>
                    <p className="text-[var(--muted)] text-xs opacity-90 pt-0.5">
                      {l.productCode} · {l.quantity.toLocaleString("vi-VN")}
                      {l.unitLabel ? ` ${l.unitLabel}` : ""} × {formatCurrency(l.unitPrice)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[var(--foreground)]">{formatCurrency(l.amount)}</p>
                </li>
              ))}
            </ul>
            <div className="flex items-baseline justify-between border-t border-[var(--border)] pt-3">
              <p className="text-sm text-[var(--muted)] tracking-[0.4px]">Tổng tạm tính</p>
              <p className="text-xl font-normal tracking-[0.4px]" style={{ color: "#F27025" }}>
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="co-customer-name" className="block text-sm tracking-[0.4px] text-[var(--foreground)]">
                Họ và tên <span style={{ color: "#F27025" }}>*</span>
              </label>
              <input
                id="co-customer-name"
                type="text"
                autoComplete="name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                placeholder="Nhập họ tên của bạn"
                className="mhv-input"
              />
              {touched.name && !nameValid ? (
                <p className="text-xs tracking-[0.4px] text-red-600">
                  Vui lòng nhập họ tên (ít nhất 2 ký tự).
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="co-customer-phone" className="block text-sm tracking-[0.4px] text-[var(--foreground)]">
                Số điện thoại <span style={{ color: "#F27025" }}>*</span>
              </label>
              <input
                id="co-customer-phone"
                type="tel"
                autoComplete="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="Số điện thoại liên hệ"
                className="mhv-input"
              />
              {touched.phone && !phoneValid ? (
                <p className="text-xs tracking-[0.4px] text-red-600">
                  Vui lòng nhập số điện thoại hợp lệ (10-11 ký tự, bắt đầu bằng 0 hoặc +84).
                </p>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 tracking-[0.4px] text-red-700">
              {error}
            </div>
          ) : null}

          <div className="pt-3 flex flex-col-reverse items-stretch justify-end gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="mhv-btn-secondary inline-flex min-h-[48px] min-w-[140px] items-center justify-center px-6 py-3 text-sm transition-all duration-300 hover:bg-[var(--surface-muted)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !formValid}
              className="mhv-btn-primary inline-flex min-h-[48px] min-w-[200px] items-center justify-center px-6 py-3 text-sm transition-all duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: "#F27025", borderColor: "#F27025", color: "#ffffff" }}
            >
              {submitting ? "Đang tạo đơn..." : "Tạo đơn đặt hàng"}
            </button>
          </div>
        </form>
      )}
    </AdminModal>
  );
}
