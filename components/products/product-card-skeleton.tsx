export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden bg-white ring-1 ring-slate-200">
      <div className="aspect-[4/3] animate-pulse bg-slate-200" />
      <div className="space-y-4 p-4 sm:p-5">
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse bg-slate-200" />
          <div className="h-6 w-3/4 animate-pulse bg-slate-200" />
          <div className="h-4 w-1/2 animate-pulse bg-slate-200" />
          <div className="h-4 w-full animate-pulse bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse bg-slate-200" />
        </div>
        <div className="h-16 animate-pulse bg-[var(--surface-muted)]" />
        <div className="flex items-end justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse bg-slate-200" />
            <div className="h-6 w-28 animate-pulse bg-slate-200" />
          </div>
          <div className="h-10 w-28 animate-pulse bg-[var(--surface-muted)]" />
        </div>
      </div>
    </div>
  );
}
