"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BranchForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [mapsLink, setMapsLink] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isShowroom, setIsShowroom] = useState(true);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          address,
          phone,
          email,
          mapsLink,
          sortOrder: Number(sortOrder),
          isShowroom,
        }),
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
      setAddress("");
      setPhone("");
      setEmail("");
      setMapsLink("");
      setSortOrder("0");
      setIsShowroom(true);
      setMessage(result.message);
      router.refresh();
    } catch (error) {
      console.error("Không thể thêm chi nhánh:", error);
      setErrorMessage("Không thể thêm chi nhánh lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="mhv-card space-y-4 p-6"
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <p className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Chi nhánh & showroom</p>
        <h2 className="text-xl font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
          Thêm địa chỉ mới
        </h2>
      </div>

      {message ? (
        <div className="mhv-alert-success p-4 text-sm tracking-[0.4px]">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mhv-alert-danger p-4 text-sm tracking-[0.4px]">
          {errorMessage}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
          Tên chi nhánh / showroom
        </span>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mhv-input text-sm tracking-[0.4px]"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
          Địa chỉ
        </span>
        <textarea
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="mhv-input min-h-24 text-sm tracking-[0.4px]"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
            Số điện thoại
          </span>
          <input
            type="text"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
            Link bản đồ
          </span>
          <input
            type="url"
            value={mapsLink}
            onChange={(event) => setMapsLink(event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
            Thứ tự hiển thị
          </span>
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
          />
        </label>
      </div>

      <label className="mhv-muted-surface flex items-center gap-3 px-4 py-3 text-sm font-normal tracking-[0.4px] text-slate-700 dark:text-slate-300">
        <input
          type="checkbox"
          checked={isShowroom}
          onChange={(event) => setIsShowroom(event.target.checked)}
          className="mhv-checkbox h-4 w-4 border-slate-300"
        />
        Đánh dấu đây là showroom
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Đang thêm..." : "Thêm chi nhánh"}
      </button>
    </form>
  );
}
