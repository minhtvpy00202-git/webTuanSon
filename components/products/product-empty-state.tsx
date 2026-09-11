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
    <div className="mhv-card p-8 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]">
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

      <h3 className="mt-4 text-xl font-normal text-[var(--foreground)] tracking-[0.4px]">
        Chưa có sản phẩm phù hợp
      </h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)] tracking-[0.4px]">
        {selectedCategoryName
          ? `Hiện chưa có sản phẩm trong danh mục "${selectedCategoryName}".`
          : "Danh sách sản phẩm hiện đang trống. Vui lòng quay lại sau."}
      </p>

      <div className="mt-5">
        <Link
          href={resetHref}
          className="mhv-btn-primary inline-flex px-4 py-2.5 text-sm font-normal transition-all duration-300 ease-in-out hover:opacity-70 tracking-[0.4px]"
        >
          {resetLabel}
        </Link>
      </div>
    </div>
  );
}
