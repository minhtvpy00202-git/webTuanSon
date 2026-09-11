export default function ProductDetailLoading() {
  return (
    <section className="space-y-6">
      <div className="flex gap-3 text-sm">
        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="aspect-[4/3] animate-pulse rounded-xl bg-slate-200 shadow-sm ring-1 ring-slate-200" />

        <div className="space-y-6 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-10 w-40 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
          </div>

          <div className="flex gap-3">
            <div className="h-12 w-36 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-12 w-40 animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </section>
  );
}
