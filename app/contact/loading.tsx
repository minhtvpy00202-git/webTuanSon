export default function ContactLoading() {
  return (
    <section className="space-y-6">
      <div className="bg-white p-6 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-3">
          <div className="h-4 w-28 animate-pulse bg-slate-200" />
          <div className="h-10 w-3/4 animate-pulse bg-slate-200" />
          <div className="h-4 w-full animate-pulse bg-slate-200" />
          <div className="h-4 w-4/5 animate-pulse bg-slate-200" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="h-40 animate-pulse bg-white ring-1 ring-slate-200" />
          <div className="h-24 animate-pulse bg-white ring-1 ring-slate-200" />
          <div className="h-24 animate-pulse bg-white ring-1 ring-slate-200" />
          <div className="h-24 animate-pulse bg-white ring-1 ring-slate-200" />
        </div>

        <div className="h-[520px] animate-pulse bg-white ring-1 ring-slate-200" />
      </div>
    </section>
  );
}
