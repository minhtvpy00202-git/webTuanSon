"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/components/cart/cart-context";
import { formatCurrency, formatCurrencyPerUnit } from "@/lib/format";

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    productCode: string;
    description: string;
    specs: string | null;
    price: string | number;
    discountPrice: string | number | null;
    unitLabel: string;
    imageUrl: string;
    isPromotion: boolean;
    category: {
      name: string;
    };
  };
};

function CartPlusIcon({ className = "" }: { className?: string }) {
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
      <path
        d="M16 11h4M18 9v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
      />
    </svg>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discountPrice && Number(product.discountPrice) > 0;
  const { addItem } = useCart();

  const numericPrice = Number(product.price) || 0;
  const numericDiscountPrice =
    product.discountPrice != null ? Number(product.discountPrice) || 0 : null;
  const displayPrice =
    numericDiscountPrice && numericDiscountPrice > 0
      ? numericDiscountPrice
      : numericPrice;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      productCode: product.productCode,
      imageUrl: product.imageUrl,
      price: numericPrice,
      discountPrice: numericDiscountPrice,
      unitLabel: product.unitLabel,
      quantity: 1,
    });
  }

  return (
    <article className="mhv-card group flex h-full w-full flex-col overflow-hidden transition-all duration-200 ease-in-out">
      <Link href={`/products/${product.id}`} className="block w-full">
        <div className="relative shrink-0 aspect-square w-full overflow-hidden bg-[var(--surface-muted)]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="h-full w-full object-cover transition-all duration-200 ease-in-out group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          />

          {product.isPromotion ? (
            <span
              className="lv-promotion-badge absolute left-3 top-3 px-3 py-1.5 text-xs"
              style={{
                backgroundColor: "#F27025",
                color: "#ffffff",
                border: "1px solid #F27025",
              }}
            >
              Khuyến mãi
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 w-full flex-col justify-between gap-4 p-3 sm:p-4 md:p-5">
        <Link href={`/products/${product.id}`} className="block w-full">
          <div className="space-y-2 w-full">
            <p className="line-clamp-1 truncate text-sm font-normal text-[var(--muted)] tracking-[0.4px]">{product.category.name}</p>
            <div className="space-y-1.5 w-full">
              <h3
                className="min-h-[4.5rem] line-clamp-2 text-base font-normal text-[var(--foreground)] tracking-[0.4px] md:text-lg"
              >
                {product.name}
              </h3>
              <p className="line-clamp-1 truncate text-sm text-[var(--muted)] tracking-[0.4px]">Mã sản phẩm: {product.productCode}</p>
            </div>
          </div>

          <div className="min-h-[3rem] space-y-1 pt-3">
            {hasDiscount ? (
              <p className="line-clamp-1 truncate text-sm text-[var(--muted)] line-through tracking-[0.4px] opacity-60">
                {product.unitLabel
                  ? formatCurrencyPerUnit(product.price, product.unitLabel)
                  : formatCurrency(product.price)}
              </p>
            ) : null}
            <p className="line-clamp-1 truncate text-base font-normal text-[var(--foreground)] tracking-[0.4px] md:text-lg">
              {product.unitLabel
                ? formatCurrencyPerUnit(displayPrice, product.unitLabel)
                : formatCurrency(displayPrice)}
            </p>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            href={`/products/${product.id}`}
            className="mhv-button-secondary justify-center"
          >
            Xem chi tiết
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            className="mhv-button-primary justify-center !px-2"
            style={{ backgroundColor: "#F27025", borderColor: "#F27025", color: "#ffffff" }}
          >
            <span className="hidden sm:inline">Thêm vào giỏ</span>
            <span className="inline-flex sm:hidden items-center justify-center gap-1">
              <CartPlusIcon className="h-4 w-4" />
              <span>Giỏ</span>
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
