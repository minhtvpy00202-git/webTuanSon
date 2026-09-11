import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatCurrency } from "@/lib/format";
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
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const hasDiscount =
    product.discountPrice && Number(product.discountPrice.toString()) > 0;
  const currentPrice = hasDiscount
    ? formatCurrency(product.discountPrice!.toString())
    : formatCurrency(product.price.toString());

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <Link
          href="/products"
          className="transition-all duration-200 ease-in-out hover:text-blue-600"
        >
          Sản phẩm
        </Link>
        <span>/</span>
        <span>{product.category.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="relative aspect-[4/3] bg-slate-100">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />

            {product.isPromotion ? (
              <span className="absolute left-4 top-4 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                Khuyến mãi
              </span>
            ) : null}
          </div>
        </div>

        <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-medium text-blue-600">{product.category.name}</p>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              {product.name}
            </h1>
            <p className="text-sm text-slate-500">Mã sản phẩm: {product.productCode}</p>
            <p className="text-base leading-7 text-slate-600">{product.description}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Giá tham khảo</p>
            {hasDiscount ? (
              <p className="mt-2 text-sm text-slate-400 line-through">
                {formatCurrency(product.price.toString())}
              </p>
            ) : null}
            <p className="mt-1 text-3xl font-semibold text-slate-900">{currentPrice}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-900">Quy cách / mẫu mã</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {product.specs || "Đang cập nhật"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <p className="text-sm font-medium text-slate-900">Danh mục</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{product.category.name}</p>
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
              className="inline-flex rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
            >
              Liên hệ tư vấn
            </Link>
            <Link
              href="/products"
              className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
