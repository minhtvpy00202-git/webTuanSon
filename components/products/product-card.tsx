import Image from "next/image";
import Link from "next/link";

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

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discountPrice && Number(product.discountPrice) > 0;

  return (
    <article className="mhv-card group overflow-hidden transition-all duration-200 ease-in-out">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-all duration-200 ease-in-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />

          {product.isPromotion ? (
            <span className="absolute left-3 top-3 border border-[var(--foreground)] bg-transparent px-3 py-1 text-xs font-normal text-[var(--foreground)] tracking-[0.4px]">
              Khuyến mãi
            </span>
          ) : null}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="space-y-2">
            <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">{product.category.name}</p>
            <div className="space-y-1">
              <h3 className="line-clamp-2 text-lg font-normal text-[var(--foreground)] tracking-[0.4px]">
                {product.name}
              </h3>
              <p className="text-sm text-[var(--muted)] tracking-[0.4px]">Mã sản phẩm: {product.productCode}</p>
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)] tracking-[0.4px]">
              {product.description}
            </p>
          </div>

          <div className="mhv-muted-surface p-3">
            <p className="line-clamp-2 text-sm text-[var(--muted)] tracking-[0.4px]">
              <span className="font-normal text-[var(--foreground)] tracking-[0.4px]">Quy cách:</span>{" "}
              {product.specs || "Đang cập nhật"}
            </p>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              {hasDiscount ? (
                <p className="text-sm text-[var(--muted)] line-through tracking-[0.4px] opacity-60">
                  {product.unitLabel
                    ? formatCurrencyPerUnit(product.price, product.unitLabel)
                    : formatCurrency(product.price)}
                </p>
              ) : null}
              <p className="text-lg font-normal text-[var(--foreground)] tracking-[0.4px]">
                {product.unitLabel
                  ? formatCurrencyPerUnit(
                      hasDiscount ? Number(product.discountPrice) : product.price,
                      product.unitLabel,
                    )
                  : formatCurrency(
                      hasDiscount ? Number(product.discountPrice) : product.price,
                    )}
              </p>
            </div>

            <span className="border border-[var(--border)] px-3 py-2 text-sm font-normal text-[var(--foreground)] transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]">
              Xem chi tiết
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
