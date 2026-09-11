"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AdminAccountModalForm,
  type AdminAccountFormState,
} from "@/components/admin/admin-account-modal-form";
import { ConfirmModal } from "@/components/admin/confirm-modal";

type RoleName = "admin" | "guest";

export type AccountRow = {
  id: number;
  username: string;
  email: string;
  role: RoleName;
  createdAt: string;
  lastLoginAt: string | null;
};

type AccountManagementProps = {
  initialAccounts: AccountRow[];
  currentUserId: number;
};

function roleBadgeClass(name: RoleName) {
  if (name === "admin") {
    return "inline-flex items-center border border-[var(--brand)] bg-[var(--brand)] px-2 py-1 text-xs text-[var(--brand-foreground)] tracking-[0.4px]";
  }
  return "inline-flex items-center border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-xs text-[var(--foreground)] tracking-[0.4px]";
}

function roleLabel(name: RoleName) {
  return name === "admin" ? "Quản trị viên" : "Nhân viên";
}

function formatDateTime(iso: string | null) {
  if (!iso) return "Chưa đăng nhập";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("vi-VN", { hour12: false });
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="m4 15.5 8.9-8.9 3.5 3.5-8.9 8.9-4 1 1-4ZM14.7 4.8l1.5-1.5a2 2 0 1 1 2.8 2.8l-1.5 1.5-2.8-2.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M4 7h16M10 11v5M14 11v5M6 7l1 12h10l1-12M9 7V4h6v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AccountManagement({
  initialAccounts,
  currentUserId,
}: AccountManagementProps) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountRow[]>(initialAccounts);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AccountRow | null>(null);
  const [deleting, setDeleting] = useState<AccountRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) =>
      [a.username, a.email, roleLabel(a.role)].some((value) =>
        value.toLowerCase().includes(q),
      ),
    );
  }, [accounts, search]);

  const toFormState = useCallback(
    (row: AccountRow): AdminAccountFormState => ({
      id: row.id,
      username: row.username,
      email: row.email,
      password: "",
      confirmPassword: "",
      roleName: row.role,
    }),
    [],
  );

  const initialCreateState: AdminAccountFormState = {
    id: null,
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    roleName: "guest",
  };

  async function handleCreateOrUpdate(form: AdminAccountFormState) {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const url = form.id ? `/api/admin/accounts/${form.id}` : "/api/admin/accounts";
      const method = form.id ? "PATCH" : "POST";
      const body = {
        username: form.username,
        email: form.email,
        roleName: form.roleName,
        password: form.password || undefined,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as {
        success: boolean;
        message: string;
        account?: AccountRow;
      };
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Không thể lưu tài khoản.");
        return;
      }
      if (!form.id && data.account) {
        setAccounts((rows) => [data.account!, ...rows]);
      } else if (form.id && data.account) {
        setAccounts((rows) => rows.map((r) => (r.id === form.id ? data.account! : r)));
      }
      setIsCreateOpen(false);
      setEditing(null);
      router.refresh();
    } catch (error) {
      console.error("Lưu tài khoản lỗi:", error);
      setErrorMessage("Không thể lưu tài khoản lúc này.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteAccount() {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/accounts/${deleting.id}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { success: boolean; message: string };
      if (!res.ok || !data.success) {
        alert(data.message || "Không thể xóa tài khoản.");
        return;
      }
      setAccounts((rows) => rows.filter((r) => r.id !== deleting.id));
      setDeleting(null);
      router.refresh();
    } catch (error) {
      console.error("Xóa tài khoản lỗi:", error);
      alert("Không thể xóa tài khoản lúc này.");
    }
  }

  const isSelf = (row: AccountRow) => row.id === currentUserId;

  return (
    <div className="space-y-5">
      <div className="mhv-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full flex-1 flex-col gap-2 sm:max-w-md">
          <label className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
            Tìm kiếm tài khoản
          </label>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên đăng nhập, email, vai trò..."
            className="mhv-input text-sm tracking-[0.4px]"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setErrorMessage("");
            setEditing(null);
            setIsCreateOpen(true);
          }}
          className="mhv-btn-primary inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-normal tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70"
        >
          <span className="text-lg leading-none">+</span>
          <span>Thêm tài khoản</span>
        </button>
      </div>

      <div className="mhv-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--surface-muted)]">
              <tr>
                {[
                  "ID",
                  "Tên đăng nhập",
                  "Email",
                  "Vai trò",
                  "Ngày tạo",
                  "Đăng nhập gần nhất",
                  "Thao tác",
                ].map((label) => (
                  <th
                    key={label}
                    className="px-5 py-4 text-left text-xs font-normal uppercase tracking-[0.4px] text-[var(--muted)]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--background)]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-[var(--muted)] tracking-[0.4px]"
                  >
                    Không tìm thấy tài khoản phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="transition-opacity duration-300 ease-in-out hover:opacity-90">
                    <td className="px-5 py-4 text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
                      #{row.id}
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
                      {row.username}
                      {isSelf(row) ? (
                        <span className="ml-2 text-xs text-[var(--muted)] tracking-[0.4px]">
                          (tài khoản bạn đang dùng)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
                      {row.email}
                    </td>
                    <td className="px-5 py-4">
                      <span className={roleBadgeClass(row.role)}>{roleLabel(row.role)}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
                      {formatDateTime(row.lastLoginAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMessage("");
                            setEditing(row);
                            setIsCreateOpen(false);
                          }}
                          className="mhv-btn-secondary inline-flex items-center gap-1 px-3 py-2 text-xs font-normal tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70"
                          aria-label={`Sửa ${row.username}`}
                        >
                          <PencilIcon />
                          <span>Sửa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(row)}
                          disabled={isSelf(row)}
                          className="mhv-btn-primary inline-flex items-center gap-1 px-3 py-2 text-xs font-normal tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={`Xóa ${row.username}`}
                          title={isSelf(row) ? "Không thể xóa chính mình" : undefined}
                        >
                          <TrashIcon />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminAccountModalForm
        open={isCreateOpen || !!editing}
        initialState={editing ? toFormState(editing) : initialCreateState}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        onClose={() => {
          setIsCreateOpen(false);
          setEditing(null);
          setErrorMessage("");
        }}
        onSubmit={handleCreateOrUpdate}
      />

      <ConfirmModal
        open={!!deleting}
        title="Xóa tài khoản"
        description={`Bạn có chắc chắn muốn xóa tài khoản "${deleting?.username}" không? Hành động này không thể hoàn tác.`}
        confirmLabel="Đồng ý xóa"
        onClose={() => setDeleting(null)}
        onConfirm={handleDeleteAccount}
      />
    </div>
  );
}
