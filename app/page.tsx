import Link from "next/link";

import { ProductCard } from "@/components/products/product-card";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { getCompanyInfoWithBranches } from "@/lib/company";
import { prisma } from "@/lib/prisma";
import { HomeHeroCarousel } from "@/components/home/home-hero-carousel";

const quickLinks = [
  {
    href: "/products",
    title: "Khám phá sản phẩm",
    description: "Xem danh mục gạch ốp lát, ngói và thiết bị vệ sinh đang có sẵn.",
  },
  {
    href: "/promotions",
    title: "Xem khuyến mãi",
    description: "Theo dõi các sản phẩm đang có ưu đãi để tối ưu chi phí công trình.",
  },
  {
    href: "/about",
    title: "Tìm hiểu doanh nghiệp",
    description: "Xem thêm giới thiệu doanh nghiệp và định hướng hoạt động chi tiết.",
  },
  {
    href: "/contact",
    title: "Liên hệ tư vấn",
    description: "Gửi yêu cầu để được hỗ trợ báo giá và chọn sản phẩm phù hợp.",
  },
];

const productInclude = {
  category: true,
  images: {
    take: 1,
    orderBy: [{ isMain: "desc" as const }, { sortOrder: "asc" as const }],
  },
  unitPrices: {
    take: 1,
    include: {
      categoryUnit: true,
    },
  },
};

type RawProduct = Awaited<ReturnType<typeof prisma.product.findMany<{ include: typeof productInclude }>>>[number];

function mapProductForCard(product: RawProduct) {
  const unitPrice = product.unitPrices?.[0];
  const image = product.images?.[0];

  return {
    id: product.id,
    name: product.name,
    productCode: product.productCode,
    description: product.description,
    specs: product.specs,
    price: unitPrice?.price?.toString() ?? (product as unknown as { price?: number | string }).price?.toString() ?? "0",
    discountPrice:
      unitPrice?.discountPrice?.toString() ??
      (product as unknown as { discountPrice?: number | string | null }).discountPrice?.toString() ??
      null,
    unitLabel: unitPrice?.categoryUnit?.label ?? "",
    imageUrl: image?.imageUrl ?? (product as unknown as { imageUrl?: string }).imageUrl ?? "",
    isPromotion: product.isPromotion,
    category: {
      name: product.category?.name ?? "",
    },
  };
}

export default async function HomePage() {
  const { companyInfo } = await getCompanyInfoWithBranches();

  const heroSlidesPromise = prisma.heroSlide.findMany({
    where: { companyInfoId: 1 },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const [newestProducts, promotionProducts, heroSlides] = await Promise.all([
    prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: productInclude,
    }),
    prisma.product.findMany({
      take: 4,
      where: { isPromotion: true },
      orderBy: { createdAt: "desc" },
      include: productInclude,
    }),
    heroSlidesPromise,
  ]);

  const newestCards = newestProducts.map(mapProductForCard);
  const promotionCards = promotionProducts.map(mapProductForCard);

  return (
    <section className="space-y-12">
      <HomeHeroCarousel
        slides={heroSlides.map((slide) => ({
          id: slide.id,
          imageUrl: slide.imageUrl,
          heading: slide.heading,
          subheading: slide.subheading,
          ctaText: slide.ctaText,
          ctaLink: slide.ctaLink,
        }))}
        fallback={{
          companyName: companyInfo?.companyName || "",
          aboutUs: companyInfo?.aboutUs || "",
        }}
      />

      <div className="max-w-full px-4 sm:px-6 lg:px-8 space-y-6">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
                Sản phẩm mới
              </span>
              <h2 className="text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                Mẫu vật liệu mới nhất
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 tracking-[0.4px]">
                Cập nhật các dòng sản phẩm mới nhất cho công trình hiện đại và bền vững.
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70"
            >
              Xem tất cả →
            </Link>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newestCards.map((product, idx) => (
            <RevealOnScroll
              key={product.id}
              variant="item"
              staggerIndex={idx}
              className="h-full"
            >
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>
      </div>

      <div className="max-w-full px-4 sm:px-6 lg:px-8 space-y-6">
        <RevealOnScroll delay={100}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="inline-flex border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
                Sản phẩm khuyến mãi
              </span>
              <h2 className="text-2xl sm:text-3xl font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                Ưu đãi đang diễn ra
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 tracking-[0.4px]">
                Các sản phẩm đang có chương trình khuyến mãi đặc biệt, tiết kiệm chi phí tối ưu.
              </p>
            </div>
            <Link
              href="/promotions"
              className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70"
            >
              Xem khuyến mãi →
            </Link>
          </div>
        </RevealOnScroll>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {promotionCards.map((product, idx) => (
            <RevealOnScroll
              key={product.id}
              variant="item"
              staggerIndex={idx}
              className="h-full"
            >
              <ProductCard product={product} />
            </RevealOnScroll>
          ))}
        </div>
      </div>

      <div className="max-w-full px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((item, idx) => (
            <RevealOnScroll
              key={item.href}
              variant="item"
              staggerIndex={idx}
              className="h-full"
            >
              <Link
                href={item.href}
                className="mhv-card flex h-full flex-col p-6 transition-all duration-300 ease-in-out hover:opacity-70"
              >
                <h2 className="text-lg font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 tracking-[0.4px]">
                  {item.description}
                </p>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
