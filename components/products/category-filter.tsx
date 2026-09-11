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
        <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">Danh mục sản phẩm</p>
        <h2 className="text-xl font-normal text-[var(--foreground)] tracking-[0.4px]">Lọc theo nhóm vật liệu</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={buildHref()}
          className={`border px-4 py-2.5 text-sm font-normal transition-all duration-200 ease-in-out tracking-[0.4px] ${
            !selectedCategory
              ? "lv-chip-active"
              : "border-[var(--border)] bg-transparent text-[var(--foreground)] hover:opacity-70"
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
              className={`border px-4 py-2.5 text-sm font-normal transition-all duration-200 ease-in-out tracking-[0.4px] ${
                isActive
                  ? "lv-chip-active"
                  : "border-[var(--border)] bg-transparent text-[var(--foreground)] hover:opacity-70"
              }`}
            >
              {category.name}
              <span className="ml-2 text-xs opacity-80 tracking-[0.4px]">({category.productCount})</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
