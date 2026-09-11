import Image from "next/image";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";

type ProductCardProps = {
  product: {
    id: number;
    name: string;
    productCode: string;
    description: string;
    specs: string | null;
    price: string | number;
    discountPrice: string | number | null;
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
    <article className="group overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-all duration-200 ease-in-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />

          {product.isPromotion ? (
            <span className="absolute left-3 top-3 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              Khuyến mãi
            </span>
          ) : null}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="space-y-2">
            <p className="text-sm font-medium text-blue-600">{product.category.name}</p>
            <div className="space-y-1">
              <h3 className="line-clamp-2 text-lg font-semibold text-slate-900">
                {product.name}
              </h3>
              <p className="text-sm text-slate-500">Mã sản phẩm: {product.productCode}</p>
            </div>
            <p className="line-clamp-2 text-sm leading-6 text-slate-600">
              {product.description}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="line-clamp-2 text-sm text-slate-600">
              <span className="font-medium text-slate-900">Quy cách:</span>{" "}
              {product.specs || "Đang cập nhật"}
            </p>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="space-y-1">
              {hasDiscount ? (
                <p className="text-sm text-slate-400 line-through">
                  {formatCurrency(product.price)}
                </p>
              ) : null}
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(hasDiscount ? Number(product.discountPrice) : product.price)}
              </p>
            </div>

            <span className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 ease-in-out group-hover:border-blue-200 group-hover:text-blue-600">
              Xem chi tiết
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
