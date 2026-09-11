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
};

export function CategoryFilter({
  categories,
  selectedCategory,
  basePath = "/products",
}: CategoryFilterProps) {
  return (
    <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-blue-600">Danh mục sản phẩm</p>
        <h2 className="text-xl font-semibold text-slate-900">Lọc theo nhóm vật liệu</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={basePath}
          className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
            !selectedCategory
              ? "border-blue-600 bg-blue-600 text-white shadow-sm"
              : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
          }`}
        >
          Tất cả
        </Link>

        {categories.map((category) => {
          const isActive = selectedCategory === category.slug;

          return (
            <Link
              key={category.id}
              href={`${basePath}?category=${category.slug}`}
              className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                isActive
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
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
