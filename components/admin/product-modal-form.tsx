"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ConfirmModal } from "@/components/admin/confirm-modal";

type UploadedImagePayload = { path: string; publicUrl: string };

async function uploadImagesViaServer(files: File[]): Promise<UploadedImagePayload[]> {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const res = await fetch("/api/admin/storage/upload-product", {
    method: "POST",
    body,
  });
  const data = (await res.json()) as {
    success: boolean;
    message: string;
    images?: UploadedImagePayload[];
  };
  if (!res.ok || !data.success || !data.images) {
    throw new Error(data.message || "Không thể upload ảnh sản phẩm.");
  }
  return data.images;
}

async function deleteImagesViaServer(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const res = await fetch("/api/admin/storage/delete-product-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paths }),
  });
  const data = (await res.json()) as { success: boolean; message: string };
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Không thể xóa ảnh sản phẩm.");
  }
}

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
  images: Array<{
    id: number;
    imageUrl: string;
    storagePath: string | null;
    isMain: boolean;
    sortOrder: number;
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
  images: Array<{
    id?: number;
    imageUrl: string;
    storagePath?: string | null;
    isMain: boolean;
    sortOrder: number;
    file?: File;
    isRemoved?: boolean;
    label?: string;
  }>;
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

function buildInitialImages(product: ProductValue | undefined) {
  if (!product?.images || !product.images.length) {
    return [];
  }
  return product.images
    .slice()
    .sort((a, b) => {
      if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.id - b.id;
    })
    .map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      storagePath: img.storagePath,
      isMain: img.isMain,
      sortOrder: img.sortOrder,
    }));
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
    images: buildInitialImages(product),
    unitPrices: buildUnitPriceFields(categories, initialCategoryId, product?.unitPrices ?? []),
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UnitPriceField | null>(null);
  const [pendingImageRemove, setPendingImageRemove] = useState<ProductFormState["images"][number] | null>(null);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitLabel, setNewUnitLabel] = useState("");

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

  function handleStartAddUnit() {
    setErrorMessage("");
    setNewUnitLabel("");
    setIsAddingUnit(true);
  }

  function handleCancelAddUnit() {
    setIsAddingUnit(false);
    setNewUnitLabel("");
    setErrorMessage("");
  }

  function handleConfirmAddUnit() {
    const trimmedLabel = newUnitLabel.trim();

    if (!trimmedLabel) {
      setErrorMessage("Vui lòng nhập tên đơn vị tính.");
      return;
    }

    const isDuplicate = formData.unitPrices.some(
      (existing) => existing.label.toLowerCase() === trimmedLabel.toLowerCase(),
    );

    if (isDuplicate) {
      setErrorMessage(`Đơn vị tính "${trimmedLabel}" đã tồn tại.`);
      return;
    }

    const newUnit: UnitPriceField = {
      categoryUnitId: `custom-${Date.now()}`,
      label: trimmedLabel,
      isDefault: false,
      price: "",
      discountPrice: "",
    };

    setFormData((current) => ({
      ...current,
      unitPrices: [...current.unitPrices, newUnit],
    }));

    setIsAddingUnit(false);
    setNewUnitLabel("");
    setErrorMessage("");
  }

  function handleStartDeleteUnit(unitPrice: UnitPriceField) {
    setPendingDelete(unitPrice);
  }

  function handleConfirmDeleteUnit() {
    if (!pendingDelete) {
      return;
    }

    setFormData((current) => ({
      ...current,
      unitPrices: current.unitPrices.filter(
        (item) => item.categoryUnitId !== pendingDelete.categoryUnitId,
      ),
    }));

    setPendingDelete(null);
  }

  function handleCancelDeleteUnit() {
    setPendingDelete(null);
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

    type UploadedImageEntry = {
      id?: number;
      imageUrl: string;
      storagePath?: string | null;
      isMain: boolean;
      sortOrder: number;
    };

    let finalImages = formData.images.filter((x) => !x.isRemoved);

    if (!isEditMode && finalImages.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất 1 ảnh sản phẩm.");
      return;
    }

    if (finalImages.length > 0) {
      const mainCount = finalImages.filter((x) => x.isMain).length;
      if (mainCount === 0) {
        finalImages = finalImages.map((img, idx) => ({
          ...img,
          isMain: idx === 0,
        }));
      } else if (mainCount > 1) {
        let foundMain = false;
        finalImages = finalImages.map((img) => {
          if (!foundMain && img.isMain) {
            foundMain = true;
            return img;
          }
          return { ...img, isMain: false };
        });
      }
    }

    setIsSubmitting(true);

    try {
      const entries: UploadedImageEntry[] = [];
      const newFiles = finalImages.filter((img) => img.file);
      const removedStorageImages = formData.images.filter(
        (img) => img.isRemoved && img.storagePath,
      );

      if (removedStorageImages.length) {
        void deleteImagesViaServer(
          removedStorageImages
            .map((img) => img.storagePath)
            .filter((p): p is string => !!p),
        ).catch(() => undefined);
      }

      if (newFiles.length) {
        const uploadedResults = await uploadImagesViaServer(
          newFiles.map((img) => img.file as File),
        );
        let resultIdx = 0;
        for (const img of finalImages) {
          if (img.file) {
            const result = uploadedResults[resultIdx++];
            entries.push({
              imageUrl: result.publicUrl,
              storagePath: result.path,
              isMain: img.isMain,
              sortOrder: img.sortOrder,
            });
          } else {
            entries.push({
              id: img.id,
              imageUrl: img.imageUrl,
              storagePath: img.storagePath,
              isMain: img.isMain,
              sortOrder: img.sortOrder,
            });
          }
        }
      } else {
        for (const img of finalImages) {
          entries.push({
            id: img.id,
            imageUrl: img.imageUrl,
            storagePath: img.storagePath,
            isMain: img.isMain,
            sortOrder: img.sortOrder,
          });
        }
      }

      const activeUnitPrices = formData.unitPrices
        .map((unitPrice) => ({
          categoryUnitId: unitPrice.categoryUnitId,
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

      const payload = new FormData();
      payload.append("productCode", formData.productCode);
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("specs", formData.specs);
      payload.append("categoryId", formData.categoryId);
      payload.append("isPromotion", String(formData.isPromotion));
      payload.append("unitPrices", JSON.stringify(activeUnitPrices));
      payload.append("images", JSON.stringify(entries));

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
        <div className="mhv-alert-danger p-4 text-sm tracking-[0.4px]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
            Mã sản phẩm
          </span>
          <input
            type="text"
            value={formData.productCode}
            onChange={(event) => updateField("productCode", event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
            Tên sản phẩm
          </span>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
            required
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Mô tả</span>
        <textarea
          value={formData.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="mhv-input min-h-28 text-sm tracking-[0.4px]"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
            Quy cách / mẫu mã
          </span>
          <input
            type="text"
            value={formData.specs}
            onChange={(event) => updateField("specs", event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
            Loại sản phẩm
          </span>
          <select
            value={formData.categoryId}
            onChange={(event) => handleCategoryChange(event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
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
          <p className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Đơn giá theo đơn vị tính</p>
          <p className="text-xs font-normal leading-5 tracking-[0.4px] text-[var(--muted)]">
            Hệ thống sẽ lấy đơn vị mặc định của loại sản phẩm làm giá chính để hiển thị
            và sắp xếp ngoài trang công khai.
          </p>
        </div>

        {hasUnits || formData.unitPrices.length > 0 ? (
          <div className="space-y-4">
            {formData.unitPrices.map((unitPrice) => (
              <div
                key={unitPrice.categoryUnitId}
                className="border border-[var(--border)] bg-[var(--surface-muted)] p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
                      {unitPrice.label}
                    </span>
                    {unitPrice.isDefault ? (
                      <span className="mhv-chip">Mặc định</span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartDeleteUnit(unitPrice)}
                    disabled={unitPrice.isDefault}
                    title={
                      unitPrice.isDefault
                        ? "Không thể xoá đơn vị tính mặc định của loại sản phẩm"
                        : "Xoá đơn vị tính"
                    }
                    className="mhv-btn-secondary inline-flex h-9 w-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
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
                      className="mhv-input text-sm tracking-[0.4px]"
                      placeholder="Nhập giá gốc"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
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
                      className="mhv-input text-sm tracking-[0.4px]"
                      placeholder="Để trống nếu không có"
                    />
                  </label>
                </div>
              </div>
            ))}

            {!isAddingUnit ? (
              <button
                type="button"
                onClick={handleStartAddUnit}
                className="mhv-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm tracking-[0.4px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
                Thêm đơn vị tính
              </button>
            ) : (
              <div className="border border-[var(--border)] bg-[var(--surface-muted)] p-4 space-y-3">
                <label className="space-y-2 block">
                  <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
                    Tên đơn vị tính mới
                  </span>
                  <input
                    type="text"
                    value={newUnitLabel}
                    onChange={(event) => setNewUnitLabel(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        handleConfirmAddUnit();
                      }
                      if (event.key === "Escape") {
                        event.preventDefault();
                        handleCancelAddUnit();
                      }
                    }}
                    className="mhv-input text-sm tracking-[0.4px]"
                    placeholder="Nhập tên đơn vị tính (ví dụ: Thùng, Hộp, Cái...)"
                    autoFocus
                  />
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmAddUnit}
                    className="mhv-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm tracking-[0.4px]"
                  >
                    Xác nhận thêm
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAddUnit}
                    className="inline-flex border border-[var(--border)] bg-[var(--card)] px-4 py-2.5 text-sm font-normal text-[var(--foreground)] transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-dashed border-[var(--border)] bg-[var(--card)] px-4 py-5 text-sm font-normal tracking-[0.4px] text-[var(--muted)]">
            Loại sản phẩm này chưa có đơn vị tính. Vui lòng vào quản lý loại sản phẩm để
            thêm đơn vị trước khi lưu sản phẩm.
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Thư viện ảnh sản phẩm</p>
          <p className="text-xs font-normal leading-5 tracking-[0.4px] text-[var(--muted)]">
            {isEditMode ? "Thêm ảnh phụ (tùy chọn). Ảnh được đánh dấu chính sẽ hiển thị ngoài trang công khai." : "Chọn ít nhất 1 ảnh làm ảnh chính. Bạn có thể chọn nhiều ảnh phụ kèm theo."}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_200px]">
          <label className="space-y-2">
            <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
              Thêm ảnh mới (chọn 1 hoặc nhiều file)
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (!files.length) return;
                setFormData((current) => {
                  const nextEntries = files.map<ProductFormState["images"][number]>((file, idx) => ({
                    imageUrl: URL.createObjectURL(file),
                    storagePath: null,
                    isMain: false,
                    sortOrder: (current.images.at(-1)?.sortOrder ?? 0) + idx + 1,
                    file,
                  }));
                  return {
                    ...current,
                    images: [...current.images.filter(img => !img.isRemoved), ...nextEntries],
                  };
                });
                event.target.value = "";
              }}
              className="mhv-file-input text-sm tracking-[0.4px]"
            />
          </label>

          {product?.imageUrl || formData.images.some(img => img.isMain) ? null : (
            <div className="flex items-center justify-center border border-dashed border-[var(--border)] bg-[var(--card)] p-4 text-center text-xs leading-5 tracking-[0.4px] text-[var(--muted)]">
              {isEditMode ? "Ảnh chính được giữ từ phiên bản trước." : "Vui lòng chọn ít nhất 1 ảnh làm ảnh chính."}
            </div>
          )}
        </div>

        {formData.images.filter(img => !img.isRemoved).length ? (
          <div className="grid gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {formData.images
              .filter(img => !img.isRemoved)
              .map((img, index) => (
                <div
                  key={img.id ?? `new-${index}-${img.imageUrl.slice(0, 20)}`}
                  className={`group relative aspect-square overflow-hidden border transition-all duration-300 ease-in-out ${
                    img.isMain
                      ? "border-[var(--foreground)]"
                      : "border-[var(--border)] hover:opacity-90"
                  } bg-[var(--surface-muted)]`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={product?.name || `Ảnh ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />

                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-black/70 p-2 text-white">
                    {img.isMain ? (
                      <span className="text-xs font-normal tracking-[0.4px] text-center bg-white text-black px-2 py-0.5 w-fit mx-auto">
                        Ảnh chính
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(current => ({
                            ...current,
                            images: current.images.map(candidate => {
                              if (candidate === img) return { ...candidate, isMain: true };
                              if (candidate.isMain && candidate !== img) return { ...candidate, isMain: false };
                              return candidate;
                            }),
                          }));
                        }}
                        className="text-xs font-normal tracking-[0.4px] border border-white/60 px-2 py-1 hover:opacity-80"
                      >
                        Đặt làm chính
                      </button>
                    )}

                    {img.isMain && formData.images.filter(x => !x.isRemoved).length === 1 ? null : (
                      <button
                        type="button"
                        onClick={() => {
                          if (img.isMain) {
                            setErrorMessage("Không thể xoá ảnh chính. Đặt ảnh khác làm chính trước khi xoá.");
                            return;
                          }
                          setPendingImageRemove(img);
                        }}
                        className="text-xs font-normal tracking-[0.4px] border border-white/60 px-2 py-1 hover:opacity-80"
                      >
                        Xoá
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : null}
      </div>

      <label className="mhv-muted-surface flex items-center gap-3 px-4 py-3 text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
        <input
          type="checkbox"
          checked={formData.isPromotion}
          onChange={(event) => updateField("isPromotion", event.target.checked)}
          className="mhv-checkbox h-4 w-4 border-slate-300"
        />
        Đánh dấu sản phẩm đang khuyến mãi
      </label>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting
            ? "Đang lưu..."
            : isEditMode
              ? "Lưu thay đổi"
              : "Thêm sản phẩm"}
        </button>
      </div>

      <ConfirmModal
        open={pendingDelete !== null}
        title={pendingDelete ? `Xoá đơn vị tính "${pendingDelete.label}"?` : ""}
        description={
          pendingDelete
            ? `Đơn giá gốc và khuyến mãi của đơn vị này sẽ bị bỏ đi khỏi sản phẩm. Bạn có chắc chắn muốn xoá "${pendingDelete.label}" không?`
            : ""
        }
        confirmLabel="Xoá đơn vị"
        onClose={handleCancelDeleteUnit}
        onConfirm={handleConfirmDeleteUnit}
      />

      <ConfirmModal
        open={pendingImageRemove !== null}
        title={`Xoá ảnh "${pendingImageRemove?.isMain ? "chính" : "phụ"}"?`}
        description="Bạn có chắc chắn muốn xoá ảnh này khỏi sản phẩm?"
        confirmLabel="Xoá ảnh"
        onClose={() => setPendingImageRemove(null)}
        onConfirm={async () => {
          if (!pendingImageRemove) return;
          setFormData((current) => ({
            ...current,
            images: current.images.map((candidate) =>
              candidate === pendingImageRemove
                ? { ...candidate, isRemoved: true }
                : candidate,
            ),
          }));
          setPendingImageRemove(null);
        }}
      />
    </form>
  );
}
