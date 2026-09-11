"use client";

import { useEffect, useMemo, useState } from "react";

import { PasswordInput } from "@/components/ui/password-input";

type AccountRole = "admin" | "guest";

export type AdminAccountFormState = {
  id: number | null;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleName: AccountRole;
};

type AdminAccountModalFormProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (state: AdminAccountFormState) => Promise<void> | void;
  initialState: AdminAccountFormState | null;
  isSubmitting: boolean;
  errorMessage?: string;
};

function roleLabel(name: AccountRole) {
  return name === "admin" ? "Quản trị viên" : "Nhân viên";
}

const emptyCreateState: AdminAccountFormState = {
  id: null,
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  roleName: "guest",
};

export function AdminAccountModalForm({
  open,
  onClose,
  onSubmit,
  initialState,
  isSubmitting,
  errorMessage,
}: AdminAccountModalFormProps) {
  const [formState, setFormState] = useState<AdminAccountFormState>(
    initialState ?? emptyCreateState,
  );

  useEffect(() => {
    if (!open) return;
    setFormState(initialState ?? emptyCreateState);
  }, [initialState, open]);

  const isEdit = formState.id !== null;

  const passwordOk = useMemo(() => {
    if (!isEdit) {
      return formState.password.length > 0 && formState.password === formState.confirmPassword;
    }
    if (formState.password.length === 0) return true;
    return formState.password === formState.confirmPassword;
  }, [formState.password, formState.confirmPassword, isEdit]);

  const canSubmit =
    !isSubmitting &&
    formState.username.trim().length > 0 &&
    formState.email.trim().length > 0 &&
    passwordOk;

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    await onSubmit({
      ...formState,
      username: formState.username.trim(),
      email: formState.email.trim(),
      password: formState.password,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="mhv-card flex w-full max-w-lg flex-col p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
              {isEdit ? "Sửa tài khoản" : "Thêm tài khoản quản trị"}
            </p>
            <h2 className="mt-1 text-2xl font-normal text-[var(--foreground)] tracking-[0.4px]">
              {isEdit ? `Cập nhật ${formState.username}` : "Tạo tài khoản mới"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center text-[var(--muted)] transition-opacity duration-300 ease-in-out hover:opacity-70"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {errorMessage ? (
          <div className="mhv-alert-danger mb-4 p-4 text-sm tracking-[0.4px]">
            {errorMessage}
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
              Tên đăng nhập<span className="ml-0.5 text-[var(--foreground)]">*</span>
            </span>
            <input
              type="text"
              required
              value={formState.username}
              onChange={(e) => setFormState((f) => ({ ...f, username: e.target.value }))}
              className="mhv-input text-sm tracking-[0.4px]"
              placeholder="admin, nhanvien..."
              disabled={isSubmitting}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
              Email<span className="ml-0.5 text-[var(--foreground)]">*</span>
            </span>
            <input
              type="email"
              required
              value={formState.email}
              onChange={(e) => setFormState((f) => ({ ...f, email: e.target.value }))}
              className="mhv-input text-sm tracking-[0.4px]"
              placeholder="nhanvien@doanhnghiep.vn"
              disabled={isSubmitting}
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
              Vai trò<span className="ml-0.5 text-[var(--foreground)]">*</span>
            </span>
            <select
              value={formState.roleName}
              required
              disabled={isSubmitting}
              onChange={(e) =>
                setFormState((f) => ({
                  ...f,
                  roleName: (e.target.value as AccountRole) ?? "guest",
                }))
              }
              className="mhv-input text-sm tracking-[0.4px]"
            >
              <option value="admin">{roleLabel("admin")}</option>
              <option value="guest">{roleLabel("guest")}</option>
            </select>
          </label>

          <PasswordInput
            label={isEdit ? "Mật khẩu mới (để trống = không đổi)" : "Mật khẩu"}
            required={!isEdit}
            value={formState.password}
            onChange={(e) => setFormState((f) => ({ ...f, password: e.target.value }))}
            placeholder={isEdit ? "Nhập nếu muốn đổi mật khẩu" : "Mật khẩu (độ dài ≥ 8 ký tự)"}
            disabled={isSubmitting}
            autoComplete={isEdit ? "new-password" : "new-password"}
          />

          <PasswordInput
            label={isEdit ? "Xác nhận mật khẩu mới" : "Xác nhận mật khẩu"}
            required={!isEdit || formState.password.length > 0}
            value={formState.confirmPassword}
            onChange={(e) => setFormState((f) => ({ ...f, confirmPassword: e.target.value }))}
            placeholder={
              isEdit ? "Nhập lại mật khẩu mới nếu có" : "Nhập lại mật khẩu đã nhập ở trên"
            }
            disabled={isSubmitting}
            autoComplete="new-password"
          />

          {!passwordOk ? (
            <p className="text-sm text-[var(--muted)] tracking-[0.4px]">
              ⚠️ Mật khẩu xác nhận chưa khớp với mật khẩu.
            </p>
          ) : null}

          <div className="mt-2 flex flex-col gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="mhv-btn-secondary inline-flex items-center justify-center px-5 py-3 text-sm font-normal tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70 disabled:opacity-70"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="mhv-btn-primary inline-flex items-center justify-center px-5 py-3 text-sm font-normal tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? isEdit
                  ? "Đang lưu..."
                  : "Đang tạo..."
                : isEdit
                  ? "Lưu thay đổi"
                  : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
