"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type ProductFormProps = {
  categories: Array<{
    id: number;
    name: string;
  }>;
};

type ProductFormState = {
  productCode: string;
  name: string;
  description: string;
  specs: string;
  price: string;
  discountPrice: string;
  categoryId: string;
  isPromotion: boolean;
  image: File | null;
};

const initialState: ProductFormState = {
  productCode: "",
  name: "",
  description: "",
  specs: "",
  price: "",
  discountPrice: "",
  categoryId: "",
  isPromotion: false,
  image: null,
};

export function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormState>(initialState);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasCategories = useMemo(() => categories.length > 0, [categories.length]);

  function updateField<K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");

    if (!hasCategories) {
      setErrorMessage("Bạn cần tạo ít nhất một loại sản phẩm trước.");
      return;
    }

    if (!formData.image) {
      setErrorMessage("Vui lòng chọn ảnh sản phẩm.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("productCode", formData.productCode);
      payload.append("name", formData.name);
      payload.append("description", formData.description);
      payload.append("specs", formData.specs);
      payload.append("price", formData.price);
      payload.append("discountPrice", formData.discountPrice);
      payload.append("categoryId", formData.categoryId);
      payload.append("isPromotion", String(formData.isPromotion));
      payload.append("image", formData.image);

      const response = await fetch("/api/admin/products", {
        method: "POST",
        body: payload,
      });

      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !result.success) {
        setErrorMessage(result.message);
        return;
      }

      setFormData(initialState);
      setMessage(result.message);
      router.refresh();
    } catch (error) {
      console.error("Không thể tạo sản phẩm:", error);
      setErrorMessage("Không thể tạo sản phẩm lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-4 bg-white p-6 ring-1 ring-slate-200"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Thêm sản phẩm</p>
        <h2 className="text-xl font-normal tracking-[0.4px] text-slate-900">Tạo sản phẩm mới</h2>
      </div>

      {message ? (
        <div className="border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm tracking-[0.4px] text-[var(--foreground)]">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm tracking-[0.4px] text-[var(--foreground)]">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Mã sản phẩm</span>
          <input
            type="text"
            value={formData.productCode}
            onChange={(event) => updateField("productCode", event.target.value)}
            className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-[var(--foreground)]"
            placeholder="Ví dụ: GACH-600X600-010"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Tên sản phẩm</span>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-[var(--foreground)]"
            placeholder="Ví dụ: Gạch lát nền Prime 600x600"
            required
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Mô tả</span>
        <textarea
          value={formData.description}
          onChange={(event) => updateField("description", event.target.value)}
          className="min-h-28 w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-[var(--foreground)]"
          placeholder="Mô tả ngắn về sản phẩm"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Quy cách / mẫu mã</span>
          <input
            type="text"
            value={formData.specs}
            onChange={(event) => updateField("specs", event.target.value)}
            className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-[var(--foreground)]"
            placeholder="Ví dụ: 600x600mm, men mờ"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Loại sản phẩm</span>
          <select
            value={formData.categoryId}
            onChange={(event) => updateField("categoryId", event.target.value)}
            className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out focus:border-[var(--foreground)]"
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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Giá gốc</span>
          <input
            type="number"
            min="0"
            value={formData.price}
            onChange={(event) => updateField("price", event.target.value)}
            className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-[var(--foreground)]"
            placeholder="Ví dụ: 325000"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Giá khuyến mãi</span>
          <input
            type="number"
            min="0"
            value={formData.discountPrice}
            onChange={(event) => updateField("discountPrice", event.target.value)}
            className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-[var(--foreground)]"
            placeholder="Để trống nếu không có"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Ảnh sản phẩm</span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => updateField("image", event.target.files?.[0] ?? null)}
          className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out file:mr-4 file:border-0 file:bg-[var(--surface-muted)] file:px-3 file:py-2 file:text-sm file:font-normal file:tracking-[0.4px] file:text-[var(--foreground)] hover:file:opacity-70"
          required
        />
      </label>

      <label className="flex items-center gap-3 bg-[var(--surface-muted)] px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-700">
        <input
          type="checkbox"
          checked={formData.isPromotion}
          onChange={(event) => updateField("isPromotion", event.target.checked)}
          className="h-4 w-4 border-slate-300 text-[var(--foreground)] focus:ring-[var(--foreground)]"
        />
        Đánh dấu sản phẩm đang khuyến mãi
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Đang tạo sản phẩm..." : "Tạo sản phẩm"}
      </button>
    </form>
  );
}
