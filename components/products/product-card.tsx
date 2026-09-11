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
    <article className="mhv-card group overflow-hidden transition-all duration-200 ease-in-out hover:-translate-y-1">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl bg-slate-100 dark:bg-slate-800">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-all duration-200 ease-in-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />

          {product.isPromotion ? (
            <span className="absolute left-3 top-3 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
              Khuyến mãi
            </span>
          ) : null}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--primary)]">{product.category.name}</p>
            <div className="space-y-1">
              <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {product.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Mã sản phẩm: {product.productCode}</p>
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {product.description}
            </p>
          </div>

          <div className="mhv-muted-surface p-3">
            <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">Quy cách:</span>{" "}
              {product.specs || "Đang cập nhật"}
            </p>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              {hasDiscount ? (
                <p className="text-sm text-slate-400 line-through dark:text-slate-500">
                  {product.unitLabel
                    ? formatCurrencyPerUnit(product.price, product.unitLabel)
                    : formatCurrency(product.price)}
                </p>
              ) : null}
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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

            <span className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 ease-in-out group-hover:border-orange-300 group-hover:text-[var(--primary)] dark:border-slate-700 dark:text-slate-300">
              Xem chi tiết
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
