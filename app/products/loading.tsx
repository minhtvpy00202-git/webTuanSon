import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";

export default function ProductsLoading() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-3">
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-28 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-200 sm:px-6">
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          <div className="h-7 w-52 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
