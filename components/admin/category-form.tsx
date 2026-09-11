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
      className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-blue-600">Thêm loại sản phẩm</p>
        <h2 className="text-xl font-semibold text-slate-900">Tạo loại mới</h2>
      </div>

      {message ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900">Tên loại sản phẩm</span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 ease-in-out placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          placeholder="Ví dụ: Gạch ốp lát"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900">Slug (tùy chọn)</span>
        <input
          type="text"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 ease-in-out placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
          placeholder="Ví dụ: gach-op-lat"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Đang tạo..." : "Tạo loại sản phẩm"}
      </button>
    </form>
  );
}
