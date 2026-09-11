"use client";

import { useState } from "react";

type CompanyInfoFormProps = {
  initialValues: {
    companyName: string;
    aboutUs: string;
    mission: string;
    vision: string;
  };
};

export function CompanyInfoForm({ initialValues }: CompanyInfoFormProps) {
  const [companyName, setCompanyName] = useState(initialValues.companyName);
  const [aboutUs, setAboutUs] = useState(initialValues.aboutUs);
  const [mission, setMission] = useState(initialValues.mission);
  const [vision, setVision] = useState(initialValues.vision);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/company", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyName, aboutUs, mission, vision }),
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
      console.error("Không thể cập nhật thông tin doanh nghiệp:", error);
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
        <p className="text-sm font-medium text-[var(--primary)]">Thông tin doanh nghiệp</p>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Cập nhật nội dung giới thiệu
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

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Tên doanh nghiệp
        </span>
        <input
          type="text"
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          className="mhv-input text-sm"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Giới thiệu doanh nghiệp
        </span>
        <textarea
          value={aboutUs}
          onChange={(event) => setAboutUs(event.target.value)}
          className="mhv-input min-h-32 text-sm"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Nhiệm vụ
        </span>
        <textarea
          value={mission}
          onChange={(event) => setMission(event.target.value)}
          className="mhv-input min-h-28 text-sm"
          required
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Sứ mệnh
        </span>
        <textarea
          value={vision}
          onChange={(event) => setVision(event.target.value)}
          className="mhv-input min-h-28 text-sm"
          required
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mhv-btn-primary inline-flex rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Đang lưu..." : "Lưu thông tin doanh nghiệp"}
      </button>
    </form>
  );
}
