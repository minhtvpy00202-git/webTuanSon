import { ProductListingSection } from "@/components/products/product-listing-section";
import { prisma } from "@/lib/prisma";

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedCategory = resolvedSearchParams?.category;

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      where: selectedCategory
        ? {
            category: {
              slug: selectedCategory,
            },
          }
        : undefined,
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
      badge="Danh mục vật liệu xây dựng"
      title="Sản phẩm nổi bật cho công trình hiện đại"
      description="Khám phá danh mục gạch ốp lát, ngói và thiết bị vệ sinh. Bạn có thể lọc nhanh theo từng nhóm sản phẩm để tìm đúng mẫu phù hợp với nhu cầu."
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: category._count.products,
      }))}
      selectedCategory={selectedCategory}
      selectedCategoryName={selectedCategoryName}
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
    />
  );
}
