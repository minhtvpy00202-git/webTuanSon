"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CategoryForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, slug }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !result.success) {
        setErrorMessage(result.message);
        return;
      }

      setName("");
      setSlug("");
      setMessage(result.message);
      router.refresh();
    } catch (error) {
      console.error("Không thể tạo loại sản phẩm:", error);
      setErrorMessage("Không thể tạo loại sản phẩm lúc này. Vui lòng thử lại sau.");
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
        <p className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Thêm loại sản phẩm</p>
        <h2 className="text-xl font-normal tracking-[0.4px] text-slate-900">Tạo loại mới</h2>
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

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Tên loại sản phẩm</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-[var(--foreground)]"
          placeholder="Ví dụ: Gạch ốp lát"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-slate-900">Slug (tùy chọn)</span>
        <input
          type="text"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="w-full border border-[var(--border)] bg-white px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-900 outline-none transition-all duration-300 ease-in-out placeholder:text-slate-400 focus:border-[var(--foreground)]"
          placeholder="Ví dụ: gach-op-lat"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Đang tạo..." : "Tạo loại sản phẩm"}
      </button>
    </form>
  );
}
