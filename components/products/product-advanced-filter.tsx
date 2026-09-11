"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FilterCategory = {
  id: number;
  name: string;
  slug: string;
  productCount: number;
};

type ProductAdvancedFilterProps = {
  categories: FilterCategory[];
  selectedCategories?: string[];
  searchQuery?: string;
  minPrice?: string;
  maxPrice?: string;
  promotionOnly?: boolean;
  showPromotionFilter?: boolean;
  basePath?: string;
  defaultOpen?: boolean;
  controlledOpen?: boolean;
  controlledOnToggle?: (next: boolean) => void;
  hideInternalHeader?: boolean;
};

export function ProductAdvancedFilter({
  categories,
  selectedCategories = [],
  searchQuery = "",
  minPrice = "",
  maxPrice = "",
  promotionOnly = false,
  showPromotionFilter = true,
  basePath = "/products",
  defaultOpen = false,
  controlledOpen,
  controlledOnToggle,
  hideInternalHeader = false,
}: ProductAdvancedFilterProps) {
  const router = useRouter();

  const [q, setQ] = useState(searchQuery);
  const [cats, setCats] = useState<string[]>(selectedCategories);
  const [minP, setMinP] = useState(minPrice);
  const [maxP, setMaxP] = useState(maxPrice);
  const [promo, setPromo] = useState(promotionOnly);

  const internalOpenState = useState(defaultOpen);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpenState[0];
  const setOpen = (next: boolean) => {
    if (controlledOnToggle) {
      controlledOnToggle(next);
    } else {
      internalOpenState[1](next);
    }
  };

  function toggleCategory(slug: string) {
    setCats((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function handleApply(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();

    if (q.trim()) {
      params.set("q", q.trim());
    }

    if (cats.length > 0) {
      params.set("categories", cats.join(","));
    }

    if (minP.trim()) {
      params.set("minPrice", minP.trim());
    }

    if (maxP.trim()) {
      params.set("maxPrice", maxP.trim());
    }

    if (showPromotionFilter && promo) {
      params.set("promotion", "1");
    }

    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  function handleReset() {
    setQ("");
    setCats([]);
    setMinP("");
    setMaxP("");
    setPromo(false);
    router.push(basePath);
  }

  const bodyContent = (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <div className="space-y-2">
        <label className="block text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
          Từ khoá
        </label>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tên sản phẩm, mã, mô tả..."
          className="mhv-input text-sm"
        />
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
          Nhóm vật liệu
        </label>
        <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
          {categories.map((category) => {
            const checked = cats.includes(category.slug);
            return (
              <label
                key={category.id}
                className={`flex cursor-pointer items-start gap-3 border px-4 py-3 text-sm font-normal tracking-[0.4px] transition-opacity duration-200 hover:opacity-70 ${
                  checked
                    ? "lv-solid-primary"
                    : "border-[var(--border)] bg-transparent"
                }`}
              >
                <input
                  type="checkbox"
                  className="mhv-checkbox mt-0.5 h-4 w-4 shrink-0"
                  checked={checked}
                  onChange={() => toggleCategory(category.slug)}
                />
                <span className="flex flex-1 items-center justify-between gap-2">
                  <span className={checked ? "" : "text-[var(--foreground)]"}>
                    {category.name}
                  </span>
                  <span
                    className={`text-xs tracking-[0.4px] ${
                      checked ? "opacity-80" : "opacity-70"
                    }`}
                  >
                    ({category.productCount})
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
          Khoảng giá (đơn vị mặc định)
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-normal text-[var(--muted)] tracking-[0.4px]">
              Từ
            </label>
            <input
              type="number"
              min="0"
              value={minP}
              onChange={(e) => setMinP(e.target.value)}
              placeholder="0"
              className="mhv-input text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-normal text-[var(--muted)] tracking-[0.4px]">
              Đến
            </label>
            <input
              type="number"
              min="0"
              value={maxP}
              onChange={(e) => setMaxP(e.target.value)}
              placeholder="..."
              className="mhv-input text-sm"
            />
          </div>
        </div>
      </div>

      {showPromotionFilter ? (
        <div className="space-y-2">
          <label className="block text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
            Trạng thái
          </label>
          <label
            className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm font-normal tracking-[0.4px] transition-opacity duration-200 hover:opacity-70 ${
              promo ? "lv-solid-primary" : "border-[var(--border)] bg-transparent"
            }`}
          >
            <input
              type="checkbox"
              className="mhv-checkbox h-4 w-4 shrink-0"
              checked={promo}
              onChange={(e) => setPromo(e.target.checked)}
            />
            <span className={promo ? "" : "text-[var(--foreground)]"}>
              Chỉ sản phẩm khuyến mãi
            </span>
          </label>
        </div>
      ) : null}

      <div className="mt-auto flex flex-col gap-3 pt-2">
        <button
          type="submit"
          className="mhv-btn-primary inline-flex h-11 w-full items-center justify-center px-5 text-sm font-normal tracking-[0.4px]"
        >
          Áp dụng
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="mhv-btn-secondary inline-flex h-11 w-full items-center justify-center px-5 text-sm font-normal tracking-[0.4px]"
        >
          Xoá bộ lọc
        </button>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={handleApply}
      className="mhv-card flex h-full flex-col gap-0 overflow-hidden lg:gap-0"
    >
      {!hideInternalHeader && (
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="product-advanced-filter-body"
          className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-6 py-5 text-left transition-opacity duration-300 ease-in-out hover:opacity-80 lg:px-8"
        >
          <div className="space-y-1">
            <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
              Bộ lọc nâng cao
            </p>
            <h2 className="text-xl font-normal text-[var(--foreground)] tracking-[0.4px]">
              Tìm sản phẩm
            </h2>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 text-[var(--muted)] transition-transform duration-[700ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {hideInternalHeader ? (
        <div className="min-h-0">{bodyContent}</div>
      ) : (
        <div
          id="product-advanced-filter-body"
          className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0">{bodyContent}</div>
        </div>
      )}
    </form>
  );
}
