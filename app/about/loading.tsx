export default function AboutLoading() {
  return (
    <section className="space-y-6">
      <div className="bg-white p-6 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-3">
          <div className="h-4 w-36 animate-pulse bg-slate-200" />
          <div className="h-10 w-3/4 animate-pulse bg-slate-200" />
          <div className="h-4 w-full animate-pulse bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse bg-slate-200" />
        </div>
      </div>

      <div className="bg-white p-6 ring-1 ring-slate-200 sm:p-8">
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-48 animate-pulse bg-slate-200" />
          <div className="h-10 w-44 animate-pulse bg-slate-200" />
        </div>
        <div className="mt-6 h-56 animate-pulse bg-[var(--surface-muted)]" />
      </div>
    </section>
  );
}
