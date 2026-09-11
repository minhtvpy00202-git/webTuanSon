"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type CategoryOption = {
  id: number;
  name: string;
  units: Array<{
    id: number;
    label: string;
    isDefault: boolean;
    sortOrder: number;
  }>;
};

type ProductValue = {
  id: number;
  productCode: string;
  name: string;
  description: string;
  specs: string;
  categoryId: number;
  isPromotion: boolean;
  imageUrl: string;
  unitPrices: Array<{
    categoryUnitId: number;
    label: string;
    isDefault: boolean;
    price: string;
    discountPrice: string | null;
  }>;
};

type ProductModalFormProps = {
  categories: CategoryOption[];
  product?: ProductValue;
  onSuccess: () => void;
};

type UnitPriceField = {
  categoryUnitId: string;
  label: string;
  isDefault: boolean;
  price: string;
  discountPrice: string;
};

type ProductFormState = {
  productCode: string;
  name: string;
  description: string;
  specs: string;
  categoryId: string;
  isPromotion: boolean;
  image: File | null;
  unitPrices: UnitPriceField[];
};

function buildUnitPriceFields(
  categories: CategoryOption[],
  categoryId: string,
  sourceUnitPrices: Array<{
    categoryUnitId: number | string;
    label: string;
    price: string;
    discountPrice: string | null;
  }>,
) {
  const selectedCategory = categories.find(
    (category) => String(category.id) === categoryId,
  );

  if (!selectedCategory) {
    return [];
  }

  return selectedCategory.units.map((unit) => {
    const matchedUnitPrice =
      sourceUnitPrices.find(
        (item) => String(item.categoryUnitId) === String(unit.id),
      ) ?? sourceUnitPrices.find((item) => item.label === unit.label);

    return {
      categoryUnitId: String(unit.id),
      label: unit.label,
      isDefault: unit.isDefault,
      price: matchedUnitPrice?.price ?? "",
      discountPrice: matchedUnitPrice?.discountPrice ?? "",
    };
  });
}

export function ProductModalForm({
  categories,
  product,
  onSuccess,
}: ProductModalFormProps) {
  const router = useRouter();
  const initialCategoryId = product ? String(product.categoryId) : String(categories[0]?.id ?? "");
  const [formData, setFormData] = useState<ProductFormState>({
    productCode: product?.productCode ?? "",
    name: product?.name ?? "",
    description: product?.description ?? "",
    specs: product?.specs ?? "",
    categoryId: initialCategoryId,
    isPromotion: product?.isPromotion ?? false,
    image: null,
    unitPrices: buildUnitPriceFields(categories, initialCategoryId, product?.unitPrices ?? []),
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(product);
  const hasCategories = categories.length > 0;
  const selectedCategory = useMemo(
    () =>
      categories.find((category) => String(category.id) === formData.categoryId) ?? null,
    [categories, formData.categoryId],
  );
  const hasUnits = Boolean(selectedCategory?.units.length);

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleCategoryChange(nextCategoryId: string) {
    setFormData((current) => ({
      ...current,
      categoryId: nextCategoryId,
      unitPrices: buildUnitPriceFields(categories, nextCategoryId, current.unitPrices),
    }));
  }

  function updateUnitPrice(
    categoryUnitId: string,
    key: "price" | "discountPrice",
    value: string,
  ) {
    setFormData((current) => ({
      ...current,
      unitPrices: current.unitPrices.map((unitPrice) =>
        unitPrice.categoryUnitId === categoryUnitId
          ? {
              ...unitPrice,
              [key]: value,
            }
          : unitPrice,
      ),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!hasCategories) {
      setErrorMessage("Bạn cần tạo ít nhất một loại sản phẩm trước.");
      return;
    }

    if (!hasUnits) {
      setErrorMessage("Loại sản phẩm này chưa có đơn vị tính. Vui lòng cập nhật loại trước.");
      return;
    }

    if (!isEditMode && !formData.image) {
      setErrorMessage("Vui lòng chọn ảnh sản phẩm.");
      return;
    }

    const activeUnitPrices = formData.unitPrices
      .map((unitPrice) => ({
        categoryUnitId: Number(unitPrice.categoryUnitId),
        label: unitPrice.label,
        price: unitPrice.price.trim(),
        discountPrice: unitPrice.discountPrice.trim(),
      }))
      .filter((unitPrice) => unitPrice.price);

    if (activeUnitPrices.length === 0) {
      setErrorMessage("Vui lòng nhập ít nhất một đơn giá theo đơn vị tính.");
      return;
    }

    for (const unitPrice of activeUnitPrices) {
      const priceValue = Number(unitPrice.price);
      const discountValue = unitPrice.discountPrice ? Number(unitPrice.discountPrice) : null;

      if (!Number.isFinite(priceValue) || priceValue < 0) {
        setErrorMessage(`Đơn giá của "${unitPrice.label}" không hợp lệ.`);
        return;
      }

      if (
        discountValue !== null &&
        (!Number.isFinite(discountValue) || discountValue < 0 || discountValue > priceValue)
      ) {
        setErrorMessage(
          `Giá khuyến mãi của "${unitPrice.label}" phải nhỏ hơn hoặc bằng giá gốc.`,
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("productCode", formData.productCode);
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("specs", formData.specs);
      payload.append("categoryId", formData.categoryId);
      payload.append("isPromotion", String(formData.isPromotion));
      payload.append("unitPrices", JSON.stringify(activeUnitPrices));

      if (formData.image) {
        payload.append("image", formData.image);
      }

      const response = await fetch(
        isEditMode ? `/api/admin/products/${product?.id}` : "/api/admin/products",
        {
          method: isEditMode ? "PATCH" : "POST",
          body: payload,
        },
      );

      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !result.success) {
        setErrorMessage(result.message);
        return;
      }

      router.refresh();
      onSuccess();
    } catch (error) {
      console.error("Không thể lưu sản phẩm:", error);
      setErrorMessage("Không thể lưu sản phẩm lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {errorMessage ? (
        <div className="mhv-alert-danger rounded-xl p-4 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Mã sản phẩm
          </span>
          <input
            type="text"
            value={formData.productCode}
            onChange={(event) => updateField("productCode", event.target.value)}
            className="mhv-input text-sm"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Tên sản phẩm
          </span>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="mhv-input text-sm"
            required
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Mô tả</span>
        <textarea
          value={formData.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="mhv-input min-h-28 text-sm"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Quy cách / mẫu mã
          </span>
          <input
            type="text"
            value={formData.specs}
            onChange={(event) => updateField("specs", event.target.value)}
            className="mhv-input text-sm"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Loại sản phẩm
          </span>
          <select
            value={formData.categoryId}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="mhv-input text-sm"
            required
          >
            <option value="">Chọn loại sản phẩm</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mhv-muted-surface space-y-4 p-4 sm:p-5">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--primary)]">Đơn giá theo đơn vị tính</p>
          <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
            Hệ thống sẽ lấy đơn vị mặc định của loại sản phẩm làm giá chính để hiển thị
            và sắp xếp ngoài trang công khai.
          </p>
        </div>

        {hasUnits ? (
          <div className="space-y-4">
            {formData.unitPrices.map((unitPrice) => (
              <div
                key={unitPrice.categoryUnitId}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {unitPrice.label}
                  </span>
                  {unitPrice.isDefault ? (
                    <span className="mhv-chip">Mặc định</span>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Giá gốc / {unitPrice.label}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={unitPrice.price}
                      onChange={(event) =>
                        updateUnitPrice(
                          unitPrice.categoryUnitId,
                          "price",
                          event.target.value,
                        )
                      }
                      className="mhv-input text-sm"
                      placeholder="Nhập giá gốc"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Giá khuyến mãi / {unitPrice.label}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={unitPrice.discountPrice}
                      onChange={(event) =>
                        updateUnitPrice(
                          unitPrice.categoryUnitId,
                          "discountPrice",
                          event.target.value,
                        )
                      }
                      className="mhv-input text-sm"
                      placeholder="Để trống nếu không có"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
            Loại sản phẩm này chưa có đơn vị tính. Vui lòng vào quản lý loại sản phẩm để
            thêm đơn vị trước khi lưu sản phẩm.
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_180px]">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {isEditMode ? "Đổi ảnh sản phẩm (tùy chọn)" : "Ảnh sản phẩm"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => updateField("image", event.target.files?.[0] ?? null)}
            className="mhv-file-input text-sm"
            required={!isEditMode}
          />
        </label>

        {product?.imageUrl ? (
          <div className="space-y-2">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Ảnh hiện tại
            </span>
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="180px"
              />
            </div>
          </div>
        ) : null}
      </div>

      <label className="mhv-muted-surface flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={formData.isPromotion}
          onChange={(event) => updateField("isPromotion", event.target.checked)}
          className="mhv-checkbox h-4 w-4 rounded border-slate-300"
        />
        Đánh dấu sản phẩm đang khuyến mãi
      </label>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="mhv-btn-primary inline-flex rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? "Đang lưu..."
            : isEditMode
              ? "Lưu thay đổi"
              : "Thêm sản phẩm"}
        </button>
      </div>
    </form>
  );
}
