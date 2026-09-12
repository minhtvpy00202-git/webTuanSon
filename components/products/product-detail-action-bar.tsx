"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ContactOrderModal,
  type OrderLine,
} from "@/components/cart/contact-order-modal";
import { useCart } from "@/components/cart/cart-context";
import { formatCurrency } from "@/lib/format";

type ProductDetailActionBarProps = {
  product: {
    id: number;
    name: string;
    productCode: string;
    imageUrl: string;
  };
  unitLabel: string;
  unitPrice: number;
  discountPrice: number | null;
};

function SmallCartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
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

function ZaloChatIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
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

export function ProductDetailActionBar({
  product,
  unitLabel,
  unitPrice,
  discountPrice,
}: ProductDetailActionBarProps) {
  const { addItem, totalItems } = useCart();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [addedFlash, setAddedFlash] = useState(false);

  const price =
    discountPrice && discountPrice > 0 ? discountPrice : unitPrice;

  const singleLine = useMemo<OrderLine>(
    () => ({
      productId: product.id,
      productCode: product.productCode,
      name: product.name,
      quantity: 1,
      unitLabel,
      unitPrice: price,
      amount: price,
    }),
    [product.id, product.productCode, product.name, unitLabel, price],
  );

  function handleAddToCart() {
    addItem({
      id: product.id,
      name: product.name,
      productCode: product.productCode,
      imageUrl: product.imageUrl,
      price: unitPrice,
      discountPrice,
      unitLabel,
      quantity: 1,
    });
    setAddedFlash(true);
    window.setTimeout(() => setAddedFlash(false), 1400);
  }

  return (
    <>
      <div className="space-y-4 border-t border-[var(--border)] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[1.5px]" style={{ color: "#F27025" }}>
              Tổng đơn (1 sản phẩm)
            </p>
            <p className="text-2xl font-normal tracking-[0.4px] sm:text-3xl" style={{ color: "#F27025" }}>
              {formatCurrency(price)}
              {unitLabel ? (
                <span className="ml-2 align-middle text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
                  / {unitLabel}
                </span>
              ) : null}
            </p>
          </div>
          <p className="text-sm text-[var(--muted)] tracking-[0.4px]">
            Giỏ hàng hiện có:{" "}
            <Link href="/cart" className="underline underline-offset-4 transition-opacity duration-300 hover:opacity-80" style={{ color: "#F27025" }}>
              {totalItems} sản phẩm
            </Link>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`mhv-button-secondary justify-center !py-3.5 transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)] ${
              addedFlash ? "!bg-[#F27025] !text-white !border-[#F27025]" : ""
            }`}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <SmallCartIcon className="h-5 w-5" />
              <span>{addedFlash ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="mhv-button-primary justify-center !py-3.5"
            style={{ backgroundColor: "#F27025", borderColor: "#F27025", color: "#ffffff" }}
          >
            <span className="inline-flex items-center justify-center gap-2">
              <ZaloChatIcon className="h-5 w-5" />
              <span>Liên hệ đặt hàng qua Zalo</span>
            </span>
          </button>
        </div>
        <p className="text-xs leading-5 text-[var(--muted)] tracking-[0.4px]">
          Sau khi nhấn &ldquo;Gửi đơn đặt hàng&rdquo; hệ thống sẽ tạo file PDF đơn hàng, sao chép nội dung tin nhắn vào bộ nhớ đệm và mở app Zalo để bạn gửi đến cửa hàng.
        </p>
      </div>

      <ContactOrderModal
        open={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        mode="single"
        singleProductName={product.name}
        lines={[singleLine]}
        totalAmount={price}
      />
    </>
  );
}
