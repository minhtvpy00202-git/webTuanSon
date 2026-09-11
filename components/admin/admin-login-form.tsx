"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !result.success) {
        setErrorMessage(result.message);
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      console.error("Không thể đăng nhập admin:", error);
      setErrorMessage("Không thể đăng nhập lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="mhv-card space-y-5 p-6 sm:p-8"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--primary)]">Đăng nhập quản trị</p>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Truy cập khu vực admin
        </h1>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          Đăng nhập bằng tài khoản quản trị để thêm loại sản phẩm và sản phẩm mới.
        </p>
      </div>

      {errorMessage ? (
        <div className="mhv-alert-danger rounded-xl p-4 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Username admin
        </span>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mhv-input text-sm"
          placeholder="admin"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Mật khẩu
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mhv-input text-sm"
          placeholder="Nhập mật khẩu admin"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mhv-btn-primary inline-flex rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
