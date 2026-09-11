import { ProductListingSection } from "@/components/products/product-listing-section";
import { getPrimaryUnitPrice, resolveUnitPrices } from "@/lib/product-pricing";
import { prisma } from "@/lib/prisma";

type PromotionsPageProps = {
  searchParams?: Promise<{
    category?: string;
    q?: string;
    promotion?: "all" | "promotion" | "normal";
    sort?: "newest" | "price-asc" | "price-desc";
  }>;
};

export default async function PromotionsPage({ searchParams }: PromotionsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedCategory = resolvedSearchParams?.category;
  const searchQuery = resolvedSearchParams?.q?.trim() ?? "";
  const promotionFilter = "promotion";
  const sortOption = resolvedSearchParams?.sort ?? "newest";

  const whereClause = {
    isPromotion: true,
    ...(selectedCategory
      ? {
          category: {
            slug: selectedCategory,
          },
        }
      : {}),
    ...(searchQuery
      ? {
          OR: [
            {
              name: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              productCode: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              specs: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              category: {
                name: {
                  contains: searchQuery,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),
  };

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        units: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        },
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
      where: whereClause,
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
      orderBy:
        sortOption === "price-asc"
          ? { price: "asc" }
          : sortOption === "price-desc"
            ? { price: "desc" }
            : { createdAt: "desc" },
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
      products={products.map((product) => {
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

        return {
          id: product.id,
          name: product.name,
          productCode: product.productCode,
          description: product.description,
          specs: product.specs,
          price: primaryUnitPrice?.price ?? product.price.toString(),
          discountPrice:
            primaryUnitPrice?.discountPrice ?? product.discountPrice?.toString() ?? null,
          unitLabel: primaryUnitPrice?.label ?? "",
          imageUrl: product.imageUrl,
          isPromotion: product.isPromotion,
          category: {
            name: product.category.name,
          },
        };
      })}
      selectedCategory={selectedCategory}
      selectedCategoryName={selectedCategoryName}
      basePath="/promotions"
      emptyResetLabel="Xem tất cả khuyến mãi"
      searchQuery={searchQuery}
      promotionFilter={promotionFilter}
      sortOption={sortOption}
      enableSearchAndFilter
      showPromotionFilter={false}
    />
  );
}
