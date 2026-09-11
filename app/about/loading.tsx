export default function AboutLoading() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-3">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
        </div>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-10 w-44 animate-pulse rounded-xl bg-slate-200" />
        </div>
        <div className="mt-6 h-56 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </section>
  );
}
