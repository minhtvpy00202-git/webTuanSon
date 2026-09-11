import { ProductListingSection } from "@/components/products/product-listing-section";
import { prisma } from "@/lib/prisma";

type PromotionsPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function PromotionsPage({ searchParams }: PromotionsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedCategory = resolvedSearchParams?.category;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: {
              where: {
                isPromotion: true,
              },
            },
          },
        },
      },
    }),
    prisma.product.findMany({
      where: {
        isPromotion: true,
        ...(selectedCategory
          ? {
              category: {
                slug: selectedCategory,
              },
            }
          : {}),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  const selectedCategoryName = categories.find(
    (category) => category.slug === selectedCategory,
  )?.name;

  return (
    <ProductListingSection
      badge="Ưu đãi nổi bật"
      title="Sản phẩm đang có khuyến mãi"
      description="Theo dõi các mẫu vật liệu và thiết bị đang có giá ưu đãi để tối ưu chi phí cho công trình của bạn. Bộ lọc danh mục vẫn hoạt động giống trang sản phẩm."
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: category._count.products,
      }))}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        productCode: product.productCode,
        description: product.description,
        specs: product.specs,
        price: product.price.toString(),
        discountPrice: product.discountPrice?.toString() ?? null,
        imageUrl: product.imageUrl,
        isPromotion: product.isPromotion,
        category: {
          name: product.category.name,
        },
      }))}
      selectedCategory={selectedCategory}
      selectedCategoryName={selectedCategoryName}
      basePath="/promotions"
      emptyResetLabel="Xem tất cả khuyến mãi"
    />
  );
}
