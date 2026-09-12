import { ProductListingSection } from "@/components/products/product-listing-section";
import { getPrimaryUnitPrice, resolveUnitPrices } from "@/lib/product-pricing";
import { prisma } from "@/lib/prisma";

type ListingCategoryFlat = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  productCount: number;
};

type ProductsPageProps = {
  searchParams?: Promise<{
    category?: string;
    categories?: string;
    q?: string;
    promotion?: "all" | "promotion" | "normal" | "1";
    sort?: "newest" | "price-asc" | "price-desc";
    minPrice?: string;
    maxPrice?: string;
  }>;
};

function expandSlugsToIds(
  selectedSlugs: string[],
  flat: ListingCategoryFlat[],
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

function computeDescendantCounts(
  flat: ListingCategoryFlat[],
): Map<number, number> {
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
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
  const promotionRaw = resolvedSearchParams?.promotion ?? "all";
  const promotionFilter =
    promotionRaw === "1"
      ? ("promotion" as const)
      : (promotionRaw as "all" | "promotion" | "normal");
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

  const flatCategoriesPromise = prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }, { id: "asc" }],
    include: {
      units: {
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const flatCategories = await flatCategoriesPromise;
  const descendantCounts = computeDescendantCounts(
    flatCategories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId,
      productCount: c._count.products,
    })),
  );
  const rawCategories: ListingCategoryFlat[] = flatCategories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    productCount: descendantCounts.get(c.id) ?? c._count.products,
  }));

  const selectedCategoryIds = expandSlugsToIds(selectedCategories, rawCategories);

  const whereClause = {
    ...(selectedCategoryIds.length > 0
      ? { categoryId: { in: selectedCategoryIds } }
      : {}),
    ...(promotionFilter === "promotion"
      ? { isPromotion: true }
      : promotionFilter === "normal"
        ? { isPromotion: false }
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
      ? rawCategories.find((category) => category.slug === selectedCategories[0])?.name
      : selectedCategories.length > 1
        ? `${selectedCategories.length} nhóm`
        : undefined;

  return (
    <ProductListingSection
      badge="Vật liệu xây dựng"
      title="Sản phẩm xây dựng"
      description="Gạch ốp lát, ngói và thiết bị vệ sinh chính hãng."
      categories={rawCategories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        productCount: category.productCount,
        parentId: category.parentId,
      }))}
      selectedCategory={selectedCategories.length === 1 ? selectedCategories[0] : undefined}
      selectedCategories={selectedCategories}
      selectedCategoryName={selectedCategoryName}
      searchQuery={searchQuery}
      promotionFilter={promotionFilter}
      sortOption={sortOption}
      enableSearchAndFilter
      minPrice={minPriceRaw}
      maxPrice={maxPriceRaw}
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
            parentName: product.category.parent?.name ?? undefined,
            parentSlug: product.category.parent?.slug ?? undefined,
          },
        };
      })}
    />
  );
}
