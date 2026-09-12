import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/products/product-gallery";
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
          parent: { select: { id: true, name: true, slug: true } },
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
      images: {
        orderBy: [
          { isMain: "desc" },
          { sortOrder: "asc" },
          { id: "asc" },
        ],
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
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 tracking-[0.4px]">
        <Link
          href="/products"
          className="transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
        >
          Sản phẩm
        </Link>
        {product.category.parent ? (
          <>
            <span>/</span>
            <Link
              href={`/products?categories=${encodeURIComponent(product.category.parent.slug)}`}
              className="transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
            >
              {product.category.parent.name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="tracking-[0.4px]">{product.category.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <ProductGallery
          name={product.name}
          isPromotion={product.isPromotion}
          images={product.images.map((img) => ({
            imageUrl: img.imageUrl,
            isMain: img.isMain,
          }))}
          fallbackImageUrl={product.imageUrl}
        />

        <div className="mhv-card space-y-6 p-6 sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">{product.category.name}</p>
            <h1 className="text-3xl font-normal text-slate-900 sm:text-4xl dark:text-slate-100 tracking-[0.4px]">
              {product.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 tracking-[0.4px]">Mã sản phẩm: {product.productCode}</p>
            <p className="text-base leading-7 text-slate-600 dark:text-slate-300 tracking-[0.4px]">{product.description}</p>
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
            <div className="border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">Quy cách / mẫu mã</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 tracking-[0.4px]">
                {product.specs || "Đang cập nhật"}
              </p>
            </div>

            <div className="border border-slate-200 p-4 dark:border-slate-700">
              <p className="text-sm font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">Danh mục</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 tracking-[0.4px]">
                {product.category.parent
                  ? `${product.category.parent.name} › ${product.category.name}`
                  : product.category.name}
              </p>
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
              className="mhv-btn-primary inline-flex px-4 py-3 text-sm font-normal transition-all duration-200 ease-in-out tracking-[0.4px]"
            >
              Liên hệ tư vấn
            </Link>
            <Link
              href="/products"
              className="inline-flex border border-slate-200 bg-white px-4 py-3 text-sm font-normal text-slate-700 transition-all duration-200 ease-in-out hover:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 tracking-[0.4px]"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
