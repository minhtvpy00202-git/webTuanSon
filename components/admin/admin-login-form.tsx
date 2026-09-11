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
        <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">Đăng nhập quản trị</p>
        <h1 className="text-2xl font-normal text-[var(--foreground)] tracking-[0.4px]">
          Truy cập khu vực admin
        </h1>
        <p className="text-sm font-normal leading-6 text-[var(--muted)] tracking-[0.4px]">
          Đăng nhập bằng tài khoản quản trị để thêm loại sản phẩm và sản phẩm mới.
        </p>
      </div>

      {errorMessage ? (
        <div className="mhv-alert-danger p-4 text-sm tracking-[0.4px]">
          {errorMessage}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
          Username admin
        </span>
        <input
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="mhv-input text-sm tracking-[0.4px]"
          placeholder="admin"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
          Mật khẩu
        </span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mhv-input text-sm tracking-[0.4px]"
          placeholder="Nhập mật khẩu admin"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal transition-all duration-200 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-70 tracking-[0.4px]"
      >
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
