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
}: ProductListingSectionProps) {
  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-600">{badge}</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">{title}</h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            {description}
          </p>
        </div>
      </div>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        basePath={basePath}
      />

      <div className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200 sm:px-6">
        <div>
          <p className="text-sm text-slate-500">Kết quả hiển thị</p>
          <p className="text-lg font-semibold text-slate-900">
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
