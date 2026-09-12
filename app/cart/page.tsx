"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CartIcon, ContactOrderModal, type OrderLine } from "@/components/cart/contact-order-modal";
import { useCart } from "@/components/cart/cart-context";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { formatCurrency } from "@/lib/format";

function MinusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="butt" />
    </svg>
  );
}

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="butt" />
    </svg>
  );
}

function TrashIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function EmptyCart() {
  return (
    <div className="mhv-card flex flex-col items-center justify-center p-10 text-center sm:p-14">
      <div
        className="mb-6 flex h-20 w-20 items-center justify-center border border-[var(--border)]"
        style={{ borderColor: "#F27025" }}
      >
        <CartIcon className="h-10 w-10" style={{ color: "#F27025" } as React.CSSProperties} />
      </div>
      <h2 className="text-xl font-normal text-[var(--foreground)] tracking-[0.4px] sm:text-2xl">
        Giỏ hàng của bạn đang trống
      </h2>
      <p className="mt-3 max-w-md text-sm leading-6 text-[var(--muted)] tracking-[0.4px] sm:text-base">
        Vui lòng xem danh sách sản phẩm và chọn thêm vào giỏ hàng để đặt hàng qua Zalo nhanh chóng.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-flex items-center px-6 py-3 text-sm font-normal tracking-[0.4px] text-white transition-all duration-300 ease-in-out hover:opacity-80"
        style={{ backgroundColor: "#F27025", border: "1px solid #F27025" }}
      >
        Xem danh sách sản phẩm
      </Link>
    </div>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount, totalItems, clearCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const orderLines = useMemo<OrderLine[]>(
    () =>
      items.map((it) => {
        const unitPrice =
          it.discountPrice && it.discountPrice > 0 ? it.discountPrice : it.price;
        return {
          productId: it.id,
          productCode: it.productCode,
          name: it.name,
          quantity: it.quantity,
          unitLabel: it.unitLabel,
          unitPrice,
          amount: unitPrice * it.quantity,
        };
      }),
    [items],
  );

  if (items.length === 0) {
    return (
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <RevealOnScroll>
          <div className="space-y-2">
            <p className="text-xs font-normal tracking-[2px] uppercase" style={{ color: "#F27025" }}>
              Giỏ hàng
            </p>
            <h1 className="text-3xl font-normal text-slate-900 sm:text-4xl tracking-[0.4px]">
              Giỏ hàng của bạn
            </h1>
          </div>
        </RevealOnScroll>
        <RevealOnScroll delay={200}>
          <EmptyCart />
        </RevealOnScroll>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <RevealOnScroll>
        <div className="space-y-2">
          <p className="text-xs font-normal tracking-[2px] uppercase" style={{ color: "#F27025" }}>
            Giỏ hàng
          </p>
          <h1 className="text-3xl font-normal text-slate-900 sm:text-4xl tracking-[0.4px]">
            Giỏ hàng của bạn
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-[var(--muted)] tracking-[0.4px] sm:text-base">
            Bạn đang có {totalItems} sản phẩm trong giỏ. Kiểm tra lại đơn hàng rồi gửi nhanh đến cửa hàng qua Zalo.
          </p>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={200}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="mhv-card overflow-hidden">
            <div className="hidden border-b border-[var(--border)] px-6 py-4 sm:grid sm:grid-cols-[80px_minmax(0,1fr)_140px_120px_56px] sm:gap-4">
              <div />
              <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">Sản phẩm</p>
              <p className="text-right text-sm font-normal text-[var(--muted)] tracking-[0.4px]">Số lượng</p>
              <p className="text-right text-sm font-normal text-[var(--muted)] tracking-[0.4px]">Thành tiền</p>
              <div />
            </div>

            <ul className="divide-y divide-[var(--border)]">
              {items.map((it) => {
                const unitPrice =
                  it.discountPrice && it.discountPrice > 0 ? it.discountPrice : it.price;
                const lineTotal = unitPrice * it.quantity;
                return (
                  <li
                    key={it.id}
                    className="grid grid-cols-1 gap-4 px-4 py-5 sm:px-6 sm:grid-cols-[80px_minmax(0,1fr)_140px_120px_56px] sm:items-center sm:gap-4"
                  >
                    <Link
                      href={`/products/${it.id}`}
                      className="relative mx-auto block aspect-square w-20 shrink-0 overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)] sm:w-full"
                    >
                      <Image
                        src={it.imageUrl}
                        alt={it.name}
                        fill
                        sizes="80px"
                        className="h-full w-full object-cover"
                      />
                    </Link>
                    <div className="min-w-0 space-y-1.5">
                      <Link
                        href={`/products/${it.id}`}
                        className="block truncate text-base font-normal text-[var(--foreground)] tracking-[0.4px] sm:text-lg hover:opacity-80 transition-opacity duration-300"
                      >
                        {it.name}
                      </Link>
                      <p className="truncate text-xs text-[var(--muted)] tracking-[0.4px] sm:text-sm">
                        Mã SP: {it.productCode}
                      </p>
                      <div className="sm:hidden">
                        <p className="text-sm text-[var(--muted)] tracking-[0.4px]">
                          Đơn giá: {formatCurrency(unitPrice)}
                          {it.unitLabel ? ` / ${it.unitLabel}` : ""}
                        </p>
                      </div>
                      <div className="sm:hidden pt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-[var(--muted)] tracking-[0.4px]">Số lượng</p>
                          <QuantityStepper
                            quantity={it.quantity}
                            onChange={(q) => updateQuantity(it.id, q)}
                          />
                        </div>
                        <div className="flex items-center justify-between border-t border-[var(--border)] pt-2">
                          <p className="text-sm text-[var(--muted)] tracking-[0.4px]">Thành tiền</p>
                          <p className="text-base font-normal text-[var(--foreground)] tracking-[0.4px]">
                            {formatCurrency(lineTotal)}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(it.id)}
                            aria-label="Xoá sản phẩm"
                            className="inline-flex h-9 w-9 items-center justify-center border border-[var(--border)] text-[var(--muted)] transition-colors duration-300 ease-in-out hover:text-red-600 hover:border-red-300"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:flex sm:items-center sm:justify-end">
                      <QuantityStepper
                        quantity={it.quantity}
                        onChange={(q) => updateQuantity(it.id, q)}
                      />
                    </div>
                    <div className="hidden sm:block sm:text-right">
                      <p className="text-base font-normal text-[var(--foreground)] tracking-[0.4px] sm:text-lg">
                        {formatCurrency(lineTotal)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)] tracking-[0.4px] opacity-80">
                        {formatCurrency(unitPrice)}
                        {it.unitLabel ? ` / ${it.unitLabel}` : ""}
                      </p>
                    </div>
                    <div className="hidden sm:flex sm:justify-end">
                      <button
                        type="button"
                        onClick={() => removeItem(it.id)}
                        aria-label="Xoá sản phẩm"
                        className="inline-flex h-9 w-9 items-center justify-center border border-[var(--border)] text-[var(--muted)] transition-colors duration-300 ease-in-out hover:text-red-600 hover:border-red-300"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col items-start justify-between gap-3 border-t border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <button
                type="button"
                onClick={clearCart}
                className="text-sm font-normal tracking-[0.4px] text-[var(--muted)] transition-all duration-300 ease-in-out hover:text-red-600 hover:underline underline-offset-4"
              >
                Xoá toàn bộ giỏ hàng
              </button>
              <Link
                href="/products"
                className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70 hover:underline underline-offset-4"
              >
                Tiếp tục xem sản phẩm khác →
              </Link>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <div className="mhv-card space-y-5 p-5 sm:p-6">
              <h3 className="text-lg font-normal text-[var(--foreground)] tracking-[0.4px] sm:text-xl">
                Tóm tắt đơn hàng
              </h3>
              <dl className="space-y-3 text-sm tracking-[0.4px]">
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--muted)]">Tổng số sản phẩm</dt>
                  <dd className="text-[var(--foreground)]">{totalItems} sản phẩm</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-[var(--muted)]">Số loại hàng</dt>
                  <dd className="text-[var(--foreground)]">{items.length} loại</dd>
                </div>
              </dl>
              <div className="border-t border-[var(--border)] pt-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-[var(--muted)] tracking-[0.4px]">Tổng tạm tính</p>
                  <p
                    className="text-2xl font-normal tracking-[0.4px] sm:text-3xl"
                    style={{ color: "#F27025" }}
                  >
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted)] tracking-[0.4px] opacity-90">
                  Tổng tiền bên trên là tham khảo. Cửa hàng sẽ liên hệ lại để xác nhận giá và phí vận chuyển (nếu có) khi nhận được đơn hàng trên Zalo.
                </p>
              </div>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="mhv-button-primary w-full justify-center !py-3 text-sm sm:text-base"
                  style={{ backgroundColor: "#F27025", borderColor: "#F27025", color: "#ffffff" }}
                >
                  Liên hệ đặt hàng qua Zalo
                </button>
                <Link
                  href="/products"
                  className="mhv-button-secondary w-full justify-center"
                >
                  Tiếp tục xem sản phẩm
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </RevealOnScroll>

      <ContactOrderModal
        open={isModalOpen}
        mode="cart"
        lines={orderLines}
        totalAmount={totalAmount}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}

function QuantityStepper({
  quantity,
  onChange,
}: {
  quantity: number;
  onChange: (nextQuantity: number) => void;
}) {
  return (
    <div className="inline-flex items-stretch overflow-hidden border border-[var(--border)] bg-[var(--card)]">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        aria-label="Giảm số lượng"
        className="inline-flex h-9 w-9 items-center justify-center text-[var(--foreground)] transition-colors duration-300 ease-in-out hover:bg-[var(--surface-muted)]"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!Number.isFinite(v) || v < 1) {
            onChange(1);
          } else {
            onChange(Math.round(v));
          }
        }}
        className="h-9 w-14 border-x border-[var(--border)] bg-[var(--card)] text-center text-sm font-normal text-[var(--foreground)] focus:outline-none tracking-[0.4px]"
      />
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        aria-label="Tăng số lượng"
        className="inline-flex h-9 w-9 items-center justify-center text-[var(--foreground)] transition-colors duration-300 ease-in-out hover:bg-[var(--surface-muted)]"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
