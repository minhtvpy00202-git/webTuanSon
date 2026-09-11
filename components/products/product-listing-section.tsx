import Link from "next/link";

import { CategoryFilter } from "@/components/products/category-filter";
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
  selectedCategoryName?: string;
  basePath?: string;
  countLabel?: string;
  emptyResetLabel?: string;
  searchQuery?: string;
  promotionFilter?: "all" | "promotion" | "normal";
  sortOption?: "newest" | "price-asc" | "price-desc";
  enableSearchAndFilter?: boolean;
  showPromotionFilter?: boolean;
};

export function ProductListingSection({
  badge,
  title,
  description,
  categories,
  products,
  selectedCategory,
  selectedCategoryName,
  basePath = "/products",
  countLabel = "sản phẩm",
  emptyResetLabel = "Xem tất cả sản phẩm",
  searchQuery = "",
  promotionFilter = "all",
  sortOption = "newest",
  enableSearchAndFilter = false,
  showPromotionFilter = true,
}: ProductListingSectionProps) {
  return (
    <section className="space-y-6">
      <div className="mhv-card p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-[var(--primary)]">{badge}</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl dark:text-slate-100">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400">
            {description}
          </p>
        </div>
      </div>

      {enableSearchAndFilter ? (
        <form action={basePath} className="mhv-card space-y-4 p-4 sm:p-6">
          <div
            className={`grid gap-4 ${
              showPromotionFilter
                ? "xl:grid-cols-[minmax(0,1fr)_220px_220px_auto]"
                : "xl:grid-cols-[minmax(0,1fr)_220px_auto]"
            }`}
          >
            <label className="space-y-2">
              <span className="text-sm font-semibold text-[var(--primary)]">
                Tìm kiếm sản phẩm
              </span>
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Nhập tên sản phẩm, mã sản phẩm hoặc mô tả"
                className="mhv-input text-sm"
              />
            </label>

            {showPromotionFilter ? (
              <label className="space-y-2">
                <span className="text-sm font-semibold text-[var(--primary)]">Bộ lọc</span>
                <select
                  name="promotion"
                  defaultValue={promotionFilter}
                  className="mhv-input text-sm"
                >
                  <option value="all">Tất cả sản phẩm</option>
                  <option value="promotion">Đang khuyến mãi</option>
                  <option value="normal">Không khuyến mãi</option>
                </select>
              </label>
            ) : null}

            <label className="space-y-2">
              <span className="text-sm font-semibold text-[var(--primary)]">Sắp xếp</span>
              <select
                name="sort"
                defaultValue={sortOption}
                className="mhv-input text-sm"
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row lg:items-end">
              {selectedCategory ? (
                <input type="hidden" name="category" value={selectedCategory} />
              ) : null}

              <button
                type="submit"
                className="mhv-btn-primary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
              >
                Áp dụng
              </button>
              <Link
                href={basePath}
                className="mhv-btn-secondary inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold"
              >
                Xóa bộ lọc
              </Link>
            </div>
          </div>
        </form>
      ) : null}

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        basePath={basePath}
        preservedParams={{
          q: searchQuery || undefined,
          promotion:
            showPromotionFilter && promotionFilter && promotionFilter !== "all"
              ? promotionFilter
              : undefined,
          sort: sortOption !== "newest" ? sortOption : undefined,
        }}
      />

      <div className="mhv-card flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kết quả hiển thị</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
    </section>
  );
}
