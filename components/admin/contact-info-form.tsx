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
        <p className="text-sm font-medium text-[var(--primary)]">Liên hệ chính</p>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Cập nhật số điện thoại, email và địa chỉ chính
        </h2>
      </div>

      {message ? (
        <div className="mhv-alert-success rounded-xl p-4 text-sm">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mhv-alert-danger rounded-xl p-4 text-sm">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Số điện thoại
          </span>
          <input
            type="text"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="mhv-input text-sm"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mhv-input text-sm"
            required
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Zalo</span>
        <input
          type="url"
          value={zaloLink}
          onChange={(event) => setZaloLink(event.target.value)}
          className="mhv-input text-sm"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Địa chỉ chính
        </span>
        <textarea
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className="mhv-input min-h-28 text-sm"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mhv-btn-primary inline-flex rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Đang lưu..." : "Lưu thông tin liên hệ"}
      </button>
    </form>
  );
}
