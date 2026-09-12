import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";

export default function ProductsLoading() {
  return (
    <section className="space-y-6">
      <div className="bg-white p-6 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-3">
          <div className="h-4 w-40 animate-pulse bg-slate-200" />
          <div className="h-10 w-3/4 animate-pulse bg-slate-200" />
          <div className="h-4 w-full animate-pulse bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse bg-slate-200" />
        </div>
      </div>

      <div className="bg-white p-4 ring-1 ring-slate-200 sm:p-6">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-10 w-28 animate-pulse bg-slate-200"
            />
          ))}
        </div>
      </div>

      <div className="bg-white px-4 py-4 ring-1 ring-slate-200 sm:px-6">
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse bg-slate-200" />
          <div className="h-7 w-52 animate-pulse bg-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}
