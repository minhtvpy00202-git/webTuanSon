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
    <div className="mhv-card space-y-6 p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">Biểu mẫu liên hệ</p>
        <h2 className="text-2xl font-normal text-[var(--foreground)] tracking-[0.4px]">
          Gửi thông tin cho chúng tôi
        </h2>
        <p className="text-sm leading-6 text-[var(--muted)] tracking-[0.4px]">
          Điền nhanh nhu cầu của bạn, đội ngũ tư vấn sẽ liên hệ lại trong thời gian sớm
          nhất.
        </p>
      </div>

      {isSubmitted && submitMessage ? (
        <div className="mhv-alert-success p-4 text-sm leading-6 tracking-[0.4px]">
          {submitMessage} Chúng tôi sẽ liên hệ lại sớm nhất có thể.
        </div>
      ) : null}

      {submitError ? (
        <div className="mhv-alert-danger p-4 text-sm leading-6 tracking-[0.4px]">
          {submitError}
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
              Họ và tên
            </span>
            <input
              type="text"
              value={formData.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              className="mhv-input text-sm tracking-[0.4px]"
              placeholder="Nhập họ và tên"
              required
            />
            {errors.fullName ? (
              <p className="text-sm text-red-600 tracking-[0.4px]">{errors.fullName}</p>
            ) : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
              Số điện thoại
            </span>
            <input
              type="tel"
              value={formData.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className="mhv-input text-sm tracking-[0.4px]"
              placeholder="Nhập số điện thoại"
              required
            />
            {errors.phone ? <p className="text-sm text-red-600 tracking-[0.4px]">{errors.phone}</p> : null}
          </label>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
              Email
            </span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="mhv-input text-sm tracking-[0.4px]"
              placeholder="Nhập địa chỉ email"
              required
            />
            {errors.email ? <p className="text-sm text-red-600 tracking-[0.4px]">{errors.email}</p> : null}
          </label>

          <label className="space-y-2">
            <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
              Sản phẩm quan tâm
            </span>
            <input
              type="text"
              value={formData.productInterest}
              onChange={(event) => updateField("productInterest", event.target.value)}
              className="mhv-input text-sm tracking-[0.4px]"
              placeholder="Ví dụ: Gạch ốp lát 600x600"
            />
            {errors.productInterest ? (
              <p className="text-sm text-red-600 tracking-[0.4px]">{errors.productInterest}</p>
            ) : null}
          </label>
        </div>

        <label className="space-y-2">
          <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
            Nội dung cần tư vấn
          </span>
          <textarea
            value={formData.message}
            onChange={(event) => updateField("message", event.target.value)}
            className="mhv-input min-h-32 text-sm tracking-[0.4px]"
            placeholder="Mô tả nhu cầu của bạn để chúng tôi tư vấn chính xác hơn"
            required
          />
          {errors.message ? <p className="text-sm text-red-600 tracking-[0.4px]">{errors.message}</p> : null}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal transition-all duration-300 ease-in-out hover:opacity-70 tracking-[0.4px]"
        >
          {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu tư vấn"}
        </button>
      </form>
    </div>
  );
}
