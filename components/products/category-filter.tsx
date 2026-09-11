import Link from "next/link";

type CategoryFilterItem = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
};

type CategoryFilterProps = {
  categories: CategoryFilterItem[];
  selectedCategory?: string;
  basePath?: string;
  preservedParams?: Record<string, string | undefined>;
};

export function CategoryFilter({
  categories,
  selectedCategory,
  basePath = "/products",
  preservedParams,
}: CategoryFilterProps) {
  function buildHref(categorySlug?: string) {
    const params = new URLSearchParams();

    Object.entries(preservedParams ?? {}).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    if (categorySlug) {
      params.set("category", categorySlug);
    }

    const queryString = params.toString();

    return queryString ? `${basePath}?${queryString}` : basePath;
  }

  return (
    <section className="mhv-card space-y-4 p-4 sm:p-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-[var(--primary)]">Danh mục sản phẩm</p>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Lọc theo nhóm vật liệu</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={buildHref()}
          className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
            !selectedCategory
              ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-orange-300 hover:text-[var(--primary)] hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          }`}
        >
          Tất cả
        </Link>

        {categories.map((category) => {
          const isActive = selectedCategory === category.slug;

          return (
            <Link
              key={category.id}
              href={buildHref(category.slug)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out ${
                isActive
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-orange-300 hover:text-[var(--primary)] hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {category.name}
              <span className="ml-2 text-xs opacity-80">({category.productCount})</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
