"use client";

import { useState } from "react";

import {
  type ContactApiResponse,
  type ContactFormErrors,
  type ContactFormValues,
} from "@/lib/contact";

type ContactFormProps = {
  initialProductInterest?: string;
};

const initialState: ContactFormValues = {
  fullName: "",
  phone: "",
  email: "",
  productInterest: "",
  message: "",
};

export function ContactForm({ initialProductInterest = "" }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormValues>({
    ...initialState,
    productInterest: initialProductInterest,
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  function updateField<K extends keyof ContactFormValues>(
    key: K,
    value: ContactFormValues[K],
  ) {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
    setErrors((current) => ({
      ...current,
      [key]: undefined,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");
    setErrors({});

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as ContactApiResponse;

      if (!result.success) {
        setIsSubmitted(false);
        setSubmitError(result.message);
        setErrors(result.errors ?? {});
        return;
      }

      if (!response.ok) {
        setIsSubmitted(false);
        setSubmitError("Không thể gửi biểu mẫu lúc này. Vui lòng thử lại sau.");
        return;
      }

      setIsSubmitted(true);
      setSubmitMessage(result.message);
      setFormData({
        ...initialState,
        productInterest: initialProductInterest,
      });
    } catch (error) {
      console.error("Không thể gửi biểu mẫu liên hệ:", error);
      setIsSubmitted(false);
      setSubmitError("Không thể gửi biểu mẫu lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mhv-card space-y-4 p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--primary)]">Biểu mẫu liên hệ</p>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Gửi thông tin cho chúng tôi
        </h2>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          Điền nhanh nhu cầu của bạn, đội ngũ tư vấn sẽ liên hệ lại trong thời gian sớm
          nhất.
        </p>
      </div>

      {isSubmitted && submitMessage ? (
        <div className="mhv-alert-success rounded-xl p-4 text-sm leading-6">
          {submitMessage} Chúng tôi sẽ liên hệ lại sớm nhất có thể.
        </div>
      ) : null}

      {submitError ? (
        <div className="mhv-alert-danger rounded-xl p-4 text-sm leading-6">
          {submitError}
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Họ và tên
            </span>
            <input
              type="text"
              value={formData.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              className="mhv-input text-sm"
              placeholder="Nhập họ và tên"
              required
            />
            {errors.fullName ? (
              <p className="text-sm text-red-600">{errors.fullName}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Số điện thoại
            </span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="mhv-input text-sm"
              placeholder="Nhập số điện thoại"
              required
            />
            {errors.phone ? <p className="text-sm text-red-600">{errors.phone}</p> : null}
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Email
            </span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="mhv-input text-sm"
              placeholder="Nhập địa chỉ email"
              required
            />
            {errors.email ? <p className="text-sm text-red-600">{errors.email}</p> : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              Sản phẩm quan tâm
            </span>
            <input
              type="text"
              value={formData.productInterest}
              onChange={(event) => updateField("productInterest", event.target.value)}
              className="mhv-input text-sm"
              placeholder="Ví dụ: Gạch ốp lát 600x600"
            />
            {errors.productInterest ? (
              <p className="text-sm text-red-600">{errors.productInterest}</p>
            ) : null}
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            Nội dung cần tư vấn
          </span>
          <textarea
            value={formData.message}
            onChange={(event) => updateField("message", event.target.value)}
            className="mhv-input min-h-32 text-sm"
            placeholder="Mô tả nhu cầu của bạn để chúng tôi tư vấn chính xác hơn"
            required
          />
          {errors.message ? <p className="text-sm text-red-600">{errors.message}</p> : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mhv-btn-primary inline-flex rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
        >
          {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu tư vấn"}
        </button>
      </form>
    </div>
  );
}
