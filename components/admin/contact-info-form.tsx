"use client";

import { useState } from "react";

type ContactInfoFormProps = {
  initialValues: {
    phone: string;
    email: string;
    zaloLink: string;
    address: string;
  };
};

export function ContactInfoForm({ initialValues }: ContactInfoFormProps) {
  const [phone, setPhone] = useState(initialValues.phone);
  const [email, setEmail] = useState(initialValues.email);
  const [zaloLink, setZaloLink] = useState(initialValues.zaloLink);
  const [address, setAddress] = useState(initialValues.address);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/contact-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, email, zaloLink, address }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !result.success) {
        setErrorMessage(result.message);
        return;
      }

      setMessage(result.message);
    } catch (error) {
      console.error("Không thể cập nhật thông tin liên hệ:", error);
      setErrorMessage("Không thể cập nhật lúc này. Vui lòng thử lại sau.");
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
        <p className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Liên hệ chính</p>
        <h2 className="text-xl font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
          Cập nhật số điện thoại, email và địa chỉ chính
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
            required
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
            required
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">Zalo</span>
        <input
          type="url"
          value={zaloLink}
          onChange={(event) => setZaloLink(event.target.value)}
          className="mhv-input text-sm tracking-[0.4px]"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
          Địa chỉ chính
        </span>
        <textarea
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="mhv-input min-h-28 text-sm tracking-[0.4px]"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Đang lưu..." : "Lưu thông tin liên hệ"}
      </button>
    </form>
  );
}
