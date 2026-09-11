export type CategoryUnitSummary = {
  id: number;
  label: string;
  sortOrder: number;
  isDefault: boolean;
};

export type ProductUnitPriceSummary = {
  categoryUnitId: number;
  price: string;
  discountPrice: string | null;
};

export type ResolvedUnitPrice = {
  categoryUnitId: number;
  label: string;
  isDefault: boolean;
  price: string;
  discountPrice: string | null;
};

export function parseUnitLabels(input: string) {
  const seen = new Set<string>();

  return input
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => {
      const normalized = item.toLowerCase();

      if (!normalized || seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
}

export function resolveUnitPrices(
  categoryUnits: CategoryUnitSummary[],
  productUnitPrices: ProductUnitPriceSummary[],
) {
  const priceMap = new Map(
    productUnitPrices.map((item) => [item.categoryUnitId, item]),
  );

  return categoryUnits
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((unit) => {
      const matchedPrice = priceMap.get(unit.id);

      return {
        categoryUnitId: unit.id,
        label: unit.label,
        isDefault: unit.isDefault,
        price: matchedPrice?.price ?? "",
        discountPrice: matchedPrice?.discountPrice ?? null,
      };
    })
    .filter((item) => item.price);
}

export function getPrimaryUnitPrice(unitPrices: ResolvedUnitPrice[]) {
  return unitPrices.find((item) => item.isDefault) ?? unitPrices[0] ?? null;
}
