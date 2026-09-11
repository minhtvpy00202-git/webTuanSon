"use client";

import { useMemo, useState } from "react";

import { formatCurrencyPerUnit } from "@/lib/format";

type ProductPriceSelectorProps = {
  unitPrices: Array<{
    categoryUnitId: number;
    label: string;
    isDefault: boolean;
    price: string;
    discountPrice: string | null;
  }>;
};

export function ProductPriceSelector({ unitPrices }: ProductPriceSelectorProps) {
  const defaultIndex = useMemo(() => {
    const matchedIndex = unitPrices.findIndex((item) => item.isDefault);

    return matchedIndex >= 0 ? matchedIndex : 0;
  }, [unitPrices]);
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const activeUnitPrice = unitPrices[activeIndex] ?? unitPrices[0];

  if (!activeUnitPrice) {
    return (
      <div className="mhv-muted-surface p-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 tracking-[0.4px]">Đang cập nhật đơn giá.</p>
      </div>
    );
  }

  const hasDiscount =
    activeUnitPrice.discountPrice && Number(activeUnitPrice.discountPrice) > 0;

  return (
    <div className="mhv-muted-surface space-y-4 p-4">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 tracking-[0.4px]">Giá tham khảo</p>
        {hasDiscount ? (
          <p className="mt-2 text-sm text-slate-400 line-through dark:text-slate-500 tracking-[0.4px]">
            {formatCurrencyPerUnit(activeUnitPrice.price, activeUnitPrice.label)}
          </p>
        ) : null}
        <p className="mt-1 text-3xl font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
          {formatCurrencyPerUnit(
            hasDiscount ? activeUnitPrice.discountPrice! : activeUnitPrice.price,
            activeUnitPrice.label,
          )}
        </p>
      </div>

      {unitPrices.length > 1 ? (
        <div className="space-y-2">
          <p className="text-xs font-normal uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 tracking-[0.4px]">
            Chọn đơn vị tính
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {unitPrices.map((unitPrice, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  key={unitPrice.categoryUnitId}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`border px-4 py-3 text-left transition-all duration-200 ease-in-out ${
                    isActive
                      ? "border-[var(--foreground)] bg-transparent text-[var(--foreground)]"
                      : "border-slate-200 bg-white text-slate-700 hover:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  }`}
                >
                  <p className="text-sm font-normal tracking-[0.4px]">{unitPrice.label}</p>
                  <p className="mt-1 text-sm tracking-[0.4px]">
                    {formatCurrencyPerUnit(
                      unitPrice.discountPrice || unitPrice.price,
                      unitPrice.label,
                    )}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
