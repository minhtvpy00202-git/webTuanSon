"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ProductAdvancedFilter } from "@/components/products/product-advanced-filter";
import { ProductCard } from "@/components/products/product-card";
import { ProductEmptyState } from "@/components/products/product-empty-state";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

type ListingCategory = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
  parentId: number | null;
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

function FilterToggleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
    >
      <path
        d="M3 6h18M6 12h12M10 18h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

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

  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
      <RevealOnScroll>
        <div className="mhv-card p-6 sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">{badge}</p>
            <h1 className="text-3xl font-normal text-slate-900 sm:text-4xl dark:text-slate-100 tracking-[0.4px]">{title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400 tracking-[0.4px]">
              {description}
            </p>
          </div>
        </div>
      </RevealOnScroll>

      {enableSearchAndFilter ? (
        <>
          <div className="lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setIsFilterOpen((v) => !v)}
                aria-expanded={isFilterOpen}
                aria-controls="mobile-product-filter-wrapper"
                className={`${isFilterOpen ? "lv-solid-primary" : "mhv-btn-secondary"} flex h-11 w-11 items-center justify-center transition-opacity duration-300 ease-in-out hover:opacity-80`}
              >
                <FilterToggleIcon />
              </button>
            </div>
            <div
              id="mobile-product-filter-wrapper"
              className={`grid overflow-hidden transition-[grid-template-rows] duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
                isFilterOpen ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="min-h-0">
                <RevealOnScroll delay={100}>
                  <ProductAdvancedFilter
                    categories={categories}
                    selectedCategories={resolvedSelectedCategories}
                    searchQuery={searchQuery}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    promotionOnly={promotionOnly}
                    showPromotionFilter={showPromotionFilter}
                    basePath={basePath}
                    controlledOpen={true}
                    hideInternalHeader
                  />
                </RevealOnScroll>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
            <aside
              className={`hidden overflow-hidden transition-[width,min-width,max-width] duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] lg:block lg:sticky lg:top-4 ${
                isFilterOpen ? "lg:w-[300px] lg:min-w-[300px]" : "lg:w-0 lg:min-w-0"
              }`}
            >
              <RevealOnScroll delay={100}>
                <ProductAdvancedFilter
                  categories={categories}
                  selectedCategories={resolvedSelectedCategories}
                  searchQuery={searchQuery}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  promotionOnly={promotionOnly}
                  showPromotionFilter={showPromotionFilter}
                  basePath={basePath}
                  controlledOpen={true}
                  hideInternalHeader
                />
              </RevealOnScroll>
            </aside>

            <main className="flex min-w-0 flex-1 flex-col gap-6">
              <RevealOnScroll delay={200}>
                <div className="mhv-card flex flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen((v) => !v)}
                      aria-expanded={isFilterOpen}
                      className={`hidden lg:flex ${
                        isFilterOpen ? "lv-solid-primary" : "mhv-btn-secondary"
                      } h-11 w-11 items-center justify-center transition-opacity duration-300 ease-in-out hover:opacity-80`}
                    >
                      <FilterToggleIcon />
                    </button>
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 tracking-[0.4px]">Kết quả hiển thị</p>
                      <p className="text-lg font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                        {products.length} {countLabel}
                        {selectedCategoryName ? ` trong "${selectedCategoryName}"` : ""}
                      </p>
                    </div>
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
              </RevealOnScroll>

              {products.length === 0 ? (
                <RevealOnScroll delay={100}>
                  <ProductEmptyState
                    selectedCategoryName={selectedCategoryName}
                    resetHref={basePath}
                    resetLabel={emptyResetLabel}
                  />
                </RevealOnScroll>
              ) : (
                <div className="grid w-full grid-cols-2 gap-2 items-stretch sm:gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-3">
                  {products.map((product, idx) => (
                    <RevealOnScroll
                      key={product.id}
                      variant="item"
                      staggerIndex={idx}
                      className="h-full flex w-full min-w-0"
                    >
                      <ProductCard product={product} />
                    </RevealOnScroll>
                  ))}
                </div>
              )}
            </main>
          </div>
        </>
      ) : (
        <>
          <RevealOnScroll delay={100}>
            <div className="mhv-card flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 tracking-[0.4px]">Kết quả hiển thị</p>
                <p className="text-lg font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                  {products.length} {countLabel}
                  {selectedCategoryName ? ` trong "${selectedCategoryName}"` : ""}
                </p>
              </div>
            </div>
          </RevealOnScroll>

          {products.length === 0 ? (
            <RevealOnScroll delay={100}>
              <ProductEmptyState
                selectedCategoryName={selectedCategoryName}
                resetHref={basePath}
                resetLabel={emptyResetLabel}
              />
            </RevealOnScroll>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product, idx) => (
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
          )}
        </>
      )}
    </section>
  );
}
