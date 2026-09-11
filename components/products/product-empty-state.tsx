import Link from "next/link";

type ProductEmptyStateProps = {
  selectedCategoryName?: string;
  resetHref?: string;
  resetLabel?: string;
};

export function ProductEmptyState({
  selectedCategoryName,
  resetHref = "/products",
  resetLabel = "Xem tất cả sản phẩm",
}: ProductEmptyStateProps) {
  return (
    <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200 sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden="true">
          <path
            d="M6 7.5h12M6 12h7m-7 4.5h12M4.8 20h14.4A1.8 1.8 0 0 0 21 18.2V5.8A1.8 1.8 0 0 0 19.2 4H4.8A1.8 1.8 0 0 0 3 5.8v12.4A1.8 1.8 0 0 0 4.8 20Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h3 className="mt-4 text-xl font-semibold text-slate-900">
        Chưa có sản phẩm phù hợp
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {selectedCategoryName
          ? `Hiện chưa có sản phẩm trong danh mục "${selectedCategoryName}".`
          : "Danh sách sản phẩm hiện đang trống. Vui lòng quay lại sau."}
      </p>

      <div className="mt-5">
        <Link
          href={resetHref}
          className="inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
        >
          {resetLabel}
        </Link>
      </div>
    </div>
  );
}
