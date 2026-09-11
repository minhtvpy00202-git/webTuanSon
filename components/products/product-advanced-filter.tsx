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
}: ProductAdvancedFilterProps) {
  const router = useRouter();

  const [q, setQ] = useState(searchQuery);
  const [cats, setCats] = useState<string[]>(selectedCategories);
  const [minP, setMinP] = useState(minPrice);
  const [maxP, setMaxP] = useState(maxPrice);
  const [promo, setPromo] = useState(promotionOnly);

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

  return (
    <form
      onSubmit={handleApply}
      className="mhv-card flex h-full flex-col gap-6 p-6 lg:p-8"
    >
      <div className="space-y-1">
        <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
          Bộ lọc nâng cao
        </p>
        <h2 className="text-xl font-normal text-[var(--foreground)] tracking-[0.4px]">
          Tìm sản phẩm
        </h2>
      </div>

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
                  checked ? "lv-solid-primary" : "border-[var(--border)] bg-transparent"
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
    </form>
  );
}
