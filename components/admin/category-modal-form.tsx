"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { parseUnitLabels } from "@/lib/product-pricing";

type CategoryModalFormProps = {
  category?: {
    id: number;
    name: string;
    slug: string;
    units: Array<{
      id: number;
      label: string;
      isDefault: boolean;
    }>;
  };
  onSuccess: () => void;
};

export function CategoryModalForm({
  category,
  onSuccess,
}: CategoryModalFormProps) {
  const router = useRouter();
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [unitsText, setUnitsText] = useState(
    category?.units.map((unit) => unit.label).join("\n") ?? "cái",
  );
  const [defaultUnit, setDefaultUnit] = useState(
    category?.units.find((unit) => unit.isDefault)?.label ?? category?.units[0]?.label ?? "cái",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(category);
  const parsedUnits = parseUnitLabels(unitsText);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (parsedUnits.length === 0) {
      setErrorMessage("Vui lòng nhập ít nhất một đơn vị tính.");
      return;
    }

    if (!parsedUnits.includes(defaultUnit.trim())) {
      setErrorMessage("Đơn vị mặc định phải nằm trong danh sách đơn vị tính.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        isEditMode ? `/api/admin/categories/${category?.id}` : "/api/admin/categories",
        {
          method: isEditMode ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            units: parsedUnits,
            defaultUnit: defaultUnit.trim(),
          }),
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
      console.error("Không thể lưu loại sản phẩm:", error);
      setErrorMessage("Không thể lưu loại sản phẩm lúc này. Vui lòng thử lại sau.");
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

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
          Tên loại sản phẩm
        </span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mhv-input text-sm tracking-[0.4px]"
          placeholder="Ví dụ: Gạch ốp lát"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
          Slug
        </span>
        <input
          type="text"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="mhv-input text-sm tracking-[0.4px]"
          placeholder="Ví dụ: gach-op-lat"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
          Đơn vị tính
        </span>
        <textarea
          value={unitsText}
          onChange={(event) => {
            setUnitsText(event.target.value);

            const nextUnits = parseUnitLabels(event.target.value);

            if (nextUnits.length > 0 && !nextUnits.includes(defaultUnit.trim())) {
              setDefaultUnit(nextUnits[0]);
            }
          }}
          className="mhv-input min-h-28 text-sm tracking-[0.4px]"
          placeholder={"Mỗi dòng hoặc mỗi dấu phẩy là một đơn vị.\nVí dụ: cái\nchiếc\nhộp\nthùng\nm2"}
          required
        />
        <p className="text-xs font-normal leading-5 tracking-[0.4px] text-[var(--muted)]">
          Bạn có thể nhập nhiều đơn vị cho mỗi loại sản phẩm. Ví dụ: `m2`, `thùng`,
          `cái`, `chiếc`.
        </p>
      </label>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
          Đơn vị mặc định
        </span>
        <select
          value={defaultUnit}
          onChange={(event) => setDefaultUnit(event.target.value)}
          className="mhv-input text-sm tracking-[0.4px]"
          required
        >
          {parsedUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
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
              : "Thêm loại sản phẩm"}
        </button>
      </div>
    </form>
  );
}
