"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { parseUnitLabels } from "@/lib/product-pricing";

type ParentOption = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

type CategoryModalFormProps = {
  category?: {
    id: number;
    name: string;
    slug: string;
    parentId?: number | null;
    sortOrder?: number;
    units: Array<{
      id: number;
      label: string;
      isDefault: boolean;
    }>;
  };
  parentOptions?: ParentOption[];
  onSuccess: () => void;
};

type OptionTree = {
  id: number;
  name: string;
  level: number;
};

function buildOptions(
  list: ParentOption[],
  excludeId?: number,
): OptionTree[] {
  const byParent = new Map<number | null, ParentOption[]>();
  for (const c of list) {
    if (c.id === excludeId) continue;
    const key = c.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(c);
  }
  const result: OptionTree[] = [];
  const queue: Array<{ id: number | null; level: number }> = [{ id: null, level: 0 }];
  while (queue.length) {
    const current = queue.shift()!;
    const children = byParent.get(current.id) ?? [];
    for (const c of children) {
      result.push({ id: c.id, name: c.name, level: current.level });
      queue.unshift({ id: c.id, level: current.level + 1 });
    }
  }
  return result;
}

export function CategoryModalForm({
  category,
  parentOptions = [],
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
  const [parentId, setParentId] = useState<string>(
    category?.parentId === undefined || category?.parentId === null
      ? ""
      : String(category.parentId),
  );
  const [sortOrder, setSortOrder] = useState<string>(
    category?.sortOrder === undefined ? "0" : String(category.sortOrder),
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(category);
  const parsedUnits = parseUnitLabels(unitsText);

  const flatOptions = useMemo(
    () => buildOptions(parentOptions, category?.id),
    [parentOptions, category?.id],
  );

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
            parentId: parentId === "" ? null : Number(parentId),
            sortOrder: Number(sortOrder),
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

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
            Nhóm cha
          </span>
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
          >
            <option value="">Không có (là nhóm gốc)</option>
            {flatOptions.map((opt) => (
              <option key={opt.id} value={String(opt.id)}>
                {`${"  ".repeat(opt.level)}${opt.level > 0 ? "└ " : ""}${opt.name}`}
              </option>
            ))}
          </select>
          <p className="text-xs font-normal leading-5 tracking-[0.4px] text-[var(--muted)]">
            Đặt nhóm cha để tạo cấu trúc nhiều cấp. Ví dụ: Nhóm "Gạch" chứa "Gạch
            30x30", "Gạch 60x60".
          </p>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
            Thứ tự sắp xếp
          </span>
          <input
            type="number"
            min="0"
            step="1"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
            placeholder="0"
          />
          <p className="text-xs font-normal leading-5 tracking-[0.4px] text-[var(--muted)]">
            Số nhỏ hơn xuất hiện trước. Mặc định là 0.
          </p>
        </label>
      </div>

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
