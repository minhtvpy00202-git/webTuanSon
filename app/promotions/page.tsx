import { ProductListingSection } from "@/components/products/product-listing-section";
import { getPrimaryUnitPrice, resolveUnitPrices } from "@/lib/product-pricing";
import { prisma } from "@/lib/prisma";

type FlatCategory = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  productCount: number;
};

type PromotionsPageProps = {
  searchParams?: Promise<{
    category?: string;
    categories?: string;
    q?: string;
    sort?: "newest" | "price-asc" | "price-desc";
    minPrice?: string;
    maxPrice?: string;
  }>;
};

function expandSlugsToIds(
  selectedSlugs: string[],
  flat: FlatCategory[],
): number[] {
  const slugToCat = new Map(flat.map((c) => [c.slug, c]));
  const resultIds = new Set<number>();
  const queue: number[] = [];
  for (const slug of selectedSlugs) {
    const cat = slugToCat.get(slug);
    if (cat) queue.push(cat.id);
  }
  while (queue.length) {
    const id = queue.shift()!;
    if (resultIds.has(id)) continue;
    resultIds.add(id);
    for (const c of flat) {
      if (c.parentId === id) queue.push(c.id);
    }
  }
  return Array.from(resultIds);
}

function computeDescendantCounts(flat: FlatCategory[]): Map<number, number> {
  const counts = new Map<number, number>();
  const childIdsByParent = new Map<number | null, number[]>();
  for (const c of flat) {
    counts.set(c.id, c.productCount);
    const k = c.parentId ?? null;
    if (!childIdsByParent.has(k)) childIdsByParent.set(k, []);
    childIdsByParent.get(k)!.push(c.id);
  }
  function sumFrom(nodeId: number): number {
    let total = counts.get(nodeId) ?? 0;
    const children = childIdsByParent.get(nodeId) ?? [];
    for (const ch of children) total += sumFrom(ch);
    counts.set(nodeId, total);
    return total;
  }
  for (const rootId of childIdsByParent.get(null) ?? []) {
    sumFrom(rootId);
  }
  return counts;
}

export default async function PromotionsPage({ searchParams }: PromotionsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const singleCategory = resolvedSearchParams?.category;
  const categoriesParam = resolvedSearchParams?.categories;
  const selectedCategories = categoriesParam
    ? categoriesParam
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : singleCategory
      ? [singleCategory]
      : [];
  const searchQuery = resolvedSearchParams?.q?.trim() ?? "";
  const promotionFilter = "promotion" as const;
  const sortOption = resolvedSearchParams?.sort ?? "newest";
  const minPriceRaw = resolvedSearchParams?.minPrice?.trim() ?? "";
  const maxPriceRaw = resolvedSearchParams?.maxPrice?.trim() ?? "";
  const minPriceNum = minPriceRaw ? Number(minPriceRaw) : null;
  const maxPriceNum = maxPriceRaw ? Number(maxPriceRaw) : null;

  const unitPriceConditions: Record<string, unknown> = {
    categoryUnit: { isDefault: true },
  };
  if (minPriceNum !== null && !Number.isNaN(minPriceNum)) {
    unitPriceConditions.price = { ...(unitPriceConditions.price as object ?? {}), gte: minPriceNum };
  }
  if (maxPriceNum !== null && !Number.isNaN(maxPriceNum)) {
    unitPriceConditions.price = { ...(unitPriceConditions.price as object ?? {}), lte: maxPriceNum };
  }
  const hasUnitPriceFilter =
    (minPriceNum !== null && !Number.isNaN(minPriceNum)) ||
    (maxPriceNum !== null && !Number.isNaN(maxPriceNum));

  const flatCats = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      parentId: true,
      _count: {
        select: {
          products: {
            where: { isPromotion: true },
          },
        },
      },
    },
  });

  const flatPromotionCounts: FlatCategory[] = flatCats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    productCount: c._count.products,
  }));
  const descendantPromoCounts = computeDescendantCounts(flatPromotionCounts);
  const categories: FlatCategory[] = flatPromotionCounts.map((c) => ({
    ...c,
    productCount: descendantPromoCounts.get(c.id) ?? c.productCount,
  }));

  const selectedCategoryIds = expandSlugsToIds(selectedCategories, categories);

  const whereClause = {
    isPromotion: true,
    ...(selectedCategoryIds.length > 0
      ? { categoryId: { in: selectedCategoryIds } }
      : {}),
    ...(hasUnitPriceFilter
      ? {
          unitPrices: {
            some: unitPriceConditions,
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

  const products = await prisma.product.findMany({
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
  });

  const selectedCategoryName =
    selectedCategories.length === 1
      ? categories.find((category) => category.slug === selectedCategories[0])?.name
      : selectedCategories.length > 1
        ? `${selectedCategories.length} nhóm`
        : undefined;

  return (
    <ProductListingSection
      badge="Giá ưu đãi"
      title="Sản phẩm khuyến mãi"
      description="Giá tốt cho vật liệu & thiết bị công trình."
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: category.productCount,
        parentId: category.parentId,
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
      selectedCategory={selectedCategories.length === 1 ? selectedCategories[0] : undefined}
      selectedCategories={selectedCategories}
      selectedCategoryName={selectedCategoryName}
      basePath="/promotions"
      emptyResetLabel="Xem tất cả khuyến mãi"
      searchQuery={searchQuery}
      promotionFilter={promotionFilter}
      sortOption={sortOption}
      enableSearchAndFilter
      showPromotionFilter={false}
      minPrice={minPriceRaw}
      maxPrice={maxPriceRaw}
    />
  );
}
