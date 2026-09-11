"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ProductAdvancedFilter } from "@/components/products/product-advanced-filter";
import { ProductCard } from "@/components/products/product-card";
import { ProductEmptyState } from "@/components/products/product-empty-state";

type ListingCategory = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
};

type ListingProduct = {
  id: number;
  name: string;
  productCode: string;
  description: string;
  specs: string | null;
  price: string | number;
  discountPrice: string | number | null;
  unitLabel: string;
  imageUrl: string;
  isPromotion: boolean;
  category: {
    name: string;
  };
};

type ProductListingSectionProps = {
  badge: string;
  title: string;
  description: string;
  categories: ListingCategory[];
  products: ListingProduct[];
  selectedCategory?: string;
  selectedCategories?: string[];
  selectedCategoryName?: string;
  basePath?: string;
  countLabel?: string;
  emptyResetLabel?: string;
  searchQuery?: string;
  promotionFilter?: "all" | "promotion" | "normal";
  sortOption?: "newest" | "price-asc" | "price-desc";
  enableSearchAndFilter?: boolean;
  showPromotionFilter?: boolean;
  minPrice?: string;
  maxPrice?: string;
};

export function ProductListingSection({
  badge,
  title,
  description,
  categories,
  products,
  selectedCategory,
  selectedCategories = [],
  selectedCategoryName,
  basePath = "/products",
  countLabel = "sản phẩm",
  emptyResetLabel = "Xem tất cả sản phẩm",
  searchQuery = "",
  promotionFilter = "all",
  sortOption = "newest",
  enableSearchAndFilter = false,
  showPromotionFilter = true,
  minPrice = "",
  maxPrice = "",
}: ProductListingSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const promotionOnly = promotionFilter === "promotion";

  function handleSortChange(value: "newest" | "price-asc" | "price-desc") {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  const resolvedSelectedCategories = useMemo(() => {
    if (selectedCategories.length > 0) return selectedCategories;
    return selectedCategory ? [selectedCategory] : [];
  }, [selectedCategories, selectedCategory]);

  return (
    <section className="space-y-6 lg:space-y-8">
      <div className="mhv-card p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">{badge}</p>
          <h1 className="text-3xl font-normal text-slate-900 sm:text-4xl dark:text-slate-100 tracking-[0.4px]">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400 tracking-[0.4px]">
            {description}
          </p>
        </div>
      </div>

      {enableSearchAndFilter ? (
        <>
          <div className="lg:hidden">
            <ProductAdvancedFilter
              categories={categories}
              selectedCategories={resolvedSelectedCategories}
              searchQuery={searchQuery}
              minPrice={minPrice}
              maxPrice={maxPrice}
              promotionOnly={promotionOnly}
              showPromotionFilter={showPromotionFilter}
              basePath={basePath}
            />
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <aside className="hidden w-[280px] shrink-0 lg:block lg:w-[300px]">
              <div className="lg:sticky lg:top-4">
                <ProductAdvancedFilter
                  categories={categories}
                  selectedCategories={resolvedSelectedCategories}
                  searchQuery={searchQuery}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  promotionOnly={promotionOnly}
                  showPromotionFilter={showPromotionFilter}
                  basePath={basePath}
                />
              </div>
            </aside>

            <main className="flex min-w-0 flex-1 flex-col gap-6">
              <div className="mhv-card flex flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 tracking-[0.4px]">Kết quả hiển thị</p>
                  <p className="text-lg font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                    {products.length} {countLabel}
                    {selectedCategoryName ? ` trong "${selectedCategoryName}"` : ""}
                  </p>
                </div>
                <div className="flex w-full items-center gap-3 md:w-auto">
                  <label className="flex w-full items-center gap-3 md:w-auto">
                    <span className="whitespace-nowrap text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
                      Sắp xếp
                    </span>
                    <select
                      value={sortOption}
                      onChange={(e) =>
                        handleSortChange(
                          e.target.value as "newest" | "price-asc" | "price-desc",
                        )
                      }
                      className="mhv-input w-full text-sm md:w-auto"
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="price-asc">Giá thấp đến cao</option>
                      <option value="price-desc">Giá cao đến thấp</option>
                    </select>
                  </label>
                </div>
              </div>

              {products.length === 0 ? (
                <ProductEmptyState
                  selectedCategoryName={selectedCategoryName}
                  resetHref={basePath}
                  resetLabel={emptyResetLabel}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </>
      ) : (
        <>
          <div className="mhv-card flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 tracking-[0.4px]">Kết quả hiển thị</p>
              <p className="text-lg font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                {products.length} {countLabel}
                {selectedCategoryName ? ` trong "${selectedCategoryName}"` : ""}
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <ProductEmptyState
              selectedCategoryName={selectedCategoryName}
              resetHref={basePath}
              resetLabel={emptyResetLabel}
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
