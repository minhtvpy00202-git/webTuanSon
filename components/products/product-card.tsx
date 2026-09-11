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
    <article className="mhv-card group flex h-full w-full flex-col overflow-hidden transition-all duration-200 ease-in-out">
      <Link href={`/products/${product.id}`} className="flex h-full w-full flex-col">
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

        <div className="flex flex-1 w-full flex-col justify-between gap-4 p-3 sm:p-4 md:p-5">
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

          <div className="min-h-[3rem] space-y-1 pt-1">
            {hasDiscount ? (
              <p className="line-clamp-1 truncate text-sm text-[var(--muted)] line-through tracking-[0.4px] opacity-60">
                {product.unitLabel
                  ? formatCurrencyPerUnit(product.price, product.unitLabel)
                  : formatCurrency(product.price)}
              </p>
            ) : null}
            <p className="line-clamp-1 truncate text-base font-normal text-[var(--foreground)] tracking-[0.4px] md:text-lg">
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
        </div>
      </Link>
    </article>
  );
}
