import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductPriceSelector } from "@/components/products/product-price-selector";
import { getPrimaryUnitPrice, resolveUnitPrices } from "@/lib/product-pricing";
import { prisma } from "@/lib/prisma";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (Number.isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: {
        include: {
          units: {
            orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          },
        },
      },
      unitPrices: {
        include: {
          categoryUnit: true,
        },
        orderBy: {
          categoryUnit: {
            sortOrder: "asc",
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const resolvedUnitPrices = resolveUnitPrices(
    product.category.units.map((unit) => ({
      id: unit.id,
      label: unit.label,
      sortOrder: unit.sortOrder,
      isDefault: unit.isDefault,
    })),
    product.unitPrices.map((unitPrice) => ({
      categoryUnitId: unitPrice.categoryUnitId,
      price: unitPrice.price.toString(),
      discountPrice: unitPrice.discountPrice?.toString() ?? null,
    })),
  );
  const primaryUnitPrice = getPrimaryUnitPrice(resolvedUnitPrices);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <Link
          href="/products"
          className="transition-all duration-200 ease-in-out hover:text-[var(--primary)]"
        >
          Sản phẩm
        </Link>
        <span>/</span>
        <span>{product.category.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="mhv-card overflow-hidden">
          <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />

            {product.isPromotion ? (
              <span className="absolute left-4 top-4 rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Khuyến mãi
              </span>
            ) : null}
          </div>
        </div>

        <div className="mhv-card space-y-6 p-6 sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[var(--primary)]">{product.category.name}</p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl dark:text-slate-100">
              {product.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mã sản phẩm: {product.productCode}</p>
            <p className="text-base leading-7 text-slate-600 dark:text-slate-300">{product.description}</p>
          </div>

          <ProductPriceSelector
            unitPrices={
              resolvedUnitPrices.length
                ? resolvedUnitPrices
                : primaryUnitPrice
                  ? [primaryUnitPrice]
                  : []
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Quy cách / mẫu mã</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {product.specs || "Đang cập nhật"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Danh mục</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{product.category.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={{
                pathname: "/contact",
                query: {
                  product: `${product.productCode} - ${product.name}`,
                },
              }}
              className="mhv-btn-primary inline-flex rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-sm"
            >
              Liên hệ tư vấn
            </Link>
            <Link
              href="/products"
              className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-orange-300 hover:text-[var(--primary)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
