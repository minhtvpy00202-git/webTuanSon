"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminModal } from "@/components/admin/admin-modal";
import { CategoryModalForm } from "@/components/admin/category-modal-form";
import { ConfirmModal } from "@/components/admin/confirm-modal";

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  units: Array<{
    id: number;
    label: string;
    isDefault: boolean;
  }>;
  productCount: number;
};

type CategoryManagementProps = {
  categories: CategoryRow[];
};

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
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
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
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

export function CategoryManagement({ categories }: CategoryManagementProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryRow | null>(null);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return categories;
    }

    return categories.filter((category) =>
      [category.name, category.slug].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [categories, search]);

  async function handleDeleteCategory() {
    if (!deletingCategory) {
      return;
    }

    const response = await fetch(`/api/admin/categories/${deletingCategory.id}`, {
      method: "DELETE",
    });

    const result = (await response.json().catch(() => null)) as
      | { success?: boolean; message?: string }
      | null;

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || "Không thể xóa loại sản phẩm.");
    }

    router.refresh();
    setDeletingCategory(null);
  }

  return (
    <section className="space-y-6">
      <div className="mhv-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--primary)]">
              Quản lý loại sản phẩm
            </p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Danh sách loại sản phẩm
            </h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Theo dõi danh mục hiện có, tìm kiếm nhanh và thao tác trực tiếp bằng
              modal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="mhv-btn-primary inline-flex rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ease-in-out"
          >
            + Thêm loại sản phẩm
          </button>
        </div>
      </div>

      <div className="mhv-card p-4">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên loại hoặc slug"
          className="mhv-input text-sm"
        />
      </div>

      <div className="mhv-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Danh sách loại sản phẩm
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hiển thị {filteredCategories.length} / {categories.length} loại sản phẩm
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-left text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 font-semibold">Tên loại</th>
                <th className="px-6 py-4 font-semibold">Slug</th>
                <th className="px-6 py-4 font-semibold">Đơn vị tính</th>
                <th className="px-6 py-4 font-semibold">Số sản phẩm</th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950/40">
              {filteredCategories.length ? (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition-colors duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/60"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      <div className="flex flex-wrap gap-2">
                        {category.units.length ? (
                          category.units.map((unit) => (
                            <span
                              key={unit.id}
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                unit.isDefault
                                  ? "mhv-chip"
                                  : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                              }`}
                            >
                              {unit.label}
                              {unit.isDefault ? " (mặc định)" : ""}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">Chưa cấu hình</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {category.productCount} sản phẩm
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(category)}
                          className="mhv-btn-secondary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200 ease-in-out"
                        >
                          <PencilIcon />
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(category)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition-all duration-200 ease-in-out hover:bg-red-50"
                        >
                          <TrashIcon />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    Không tìm thấy loại sản phẩm phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        open={isCreateOpen}
        title="Thêm loại sản phẩm"
        description="Điền thông tin loại sản phẩm mới. Form này sẽ lưu trực tiếp khi bạn bấm xác nhận."
        onClose={() => setIsCreateOpen(false)}
        maxWidthClassName="max-w-xl"
      >
        <CategoryModalForm onSuccess={() => setIsCreateOpen(false)} />
      </AdminModal>

      <AdminModal
        open={Boolean(editingCategory)}
        title="Chỉnh sửa loại sản phẩm"
        description="Cập nhật tên hiển thị và slug của loại sản phẩm."
        onClose={() => setEditingCategory(null)}
        maxWidthClassName="max-w-xl"
      >
        {editingCategory ? (
          <CategoryModalForm
            category={editingCategory}
            onSuccess={() => setEditingCategory(null)}
          />
        ) : null}
      </AdminModal>

      <ConfirmModal
        open={Boolean(deletingCategory)}
        title="Xóa loại sản phẩm"
        description={`Bạn có chắc muốn xóa "${deletingCategory?.name ?? ""}"? Nếu loại này còn sản phẩm liên kết, hệ thống sẽ từ chối thao tác.`}
        confirmLabel="Xóa loại"
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
      />
    </section>
  );
}
