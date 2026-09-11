export function formatCurrency(value: number | string) {
  const numericValue = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numericValue);
}
