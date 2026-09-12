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
  parentId: number | null;
  parentName?: string;
  sortOrder: number;
  units: Array<{
    id: number;
    label: string;
    isDefault: boolean;
  }>;
  productCount: number;
};

type ParentOption = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

type CategoryManagementProps = {
  categories: CategoryRow[];
  parentOptions?: ParentOption[];
};

type TreeRow = CategoryRow & {
  level: number;
  hasChildren: boolean;
  isLeaf: boolean;
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

function buildTreeRows(
  flatList: CategoryRow[],
  expanded: Set<number>,
  keyword: string,
): TreeRow[] {
  const result: TreeRow[] = [];
  const byParent = new Map<number | null, CategoryRow[]>();

  for (const c of flatList) {
    const k = c.parentId ?? null;
    if (!byParent.has(k)) byParent.set(k, []);
    byParent.get(k)!.push(c);
  }

  for (const list of byParent.values()) {
    list.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }

  function matchOrDescendantMatch(cat: CategoryRow): boolean {
    if (!keyword) return true;
    const kw = keyword.toLowerCase();
    if (
      cat.name.toLowerCase().includes(kw) ||
      cat.slug.toLowerCase().includes(kw)
    ) {
      return true;
    }
    const children = byParent.get(cat.id) ?? [];
    return children.some(matchOrDescendantMatch);
  }

  function walk(parentId: number | null, level: number) {
    const children = byParent.get(parentId) ?? [];
    for (const child of children) {
      if (keyword && !matchOrDescendantMatch(child)) continue;
      const grandChildren = byParent.get(child.id) ?? [];
      result.push({
        ...child,
        level,
        hasChildren: grandChildren.length > 0,
        isLeaf: grandChildren.length === 0,
      });
      if (grandChildren.length > 0 && (expanded.has(child.id) || keyword)) {
        walk(child.id, level + 1);
      }
    }
  }

  walk(null, 0);
  return result;
}

export function CategoryManagement({
  categories,
  parentOptions = [],
}: CategoryManagementProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryRow | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  function toggleExpand(id: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const filteredTree = useMemo(() => {
    const keyword = search.trim();
    return buildTreeRows(categories, expandedRows, keyword);
  }, [categories, expandedRows, search]);

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
            <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
              Quản lý loại sản phẩm
            </p>
            <h2 className="text-2xl font-normal text-[var(--foreground)] tracking-[0.4px]">
              Danh sách loại sản phẩm
            </h2>
            <p className="text-sm font-normal leading-6 text-[var(--muted)] tracking-[0.4px]">
              Theo dõi danh mục hiện có, tìm kiếm nhanh và thao tác trực tiếp bằng
              modal. Bấm dấu (+) để mở các thể loại con.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
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
          className="mhv-input text-sm tracking-[0.4px]"
        />
      </div>

      <div className="mhv-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-5">
          <div>
            <p className="text-lg font-normal text-[var(--foreground)] tracking-[0.4px]">
              Danh sách loại sản phẩm
            </p>
            <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
              Hiển thị {filteredTree.length} / {categories.length} loại sản phẩm
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)] text-sm">
            <thead className="bg-[var(--surface-muted)] text-left text-[var(--foreground)]">
              <tr>
                <th className="px-6 py-4 font-normal tracking-[0.4px]" style={{ width: "28%" }}>
                  Tên loại
                </th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Slug</th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Nhóm cha</th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Thứ tự</th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Đơn vị tính</th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Số sản phẩm</th>
                <th className="px-6 py-4 font-normal text-right tracking-[0.4px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
              {filteredTree.length ? (
                filteredTree.map((row) => {
                  const isExpanded = expandedRows.has(row.id);
                  return (
                    <tr
                      key={row.id}
                      className="transition-colors duration-200 hover:bg-[var(--surface-muted)]"
                    >
                      <td
                        className="px-6 py-4 font-normal text-[var(--foreground)] tracking-[0.4px]"
                        style={{ paddingLeft: `${16 + row.level * 20}px` }}
                      >
                        <div className="flex items-center gap-2">
                          {row.hasChildren ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(row.id)}
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded
                                  ? `Thu gọn ${row.name}`
                                  : `Mở rộng ${row.name}`
                              }
                              className="flex h-6 w-6 shrink-0 items-center justify-center border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition-all duration-200 ease-in-out hover:bg-[var(--surface-muted)] hover:opacity-70"
                            >
                              <span className="text-sm leading-none font-normal">
                                {isExpanded ? "−" : "+"}
                              </span>
                            </button>
                          ) : (
                            <span className="h-6 w-6 shrink-0" />
                          )}
                          <span
                            className={
                              row.level === 0
                                ? "text-base font-medium"
                                : "font-normal"
                            }
                          >
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)] tracking-[0.4px]">
                        {row.slug}
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)] tracking-[0.4px]">
                        {row.parentName ?? (
                          <span className="inline-flex px-3 py-1 text-xs font-normal tracking-[0.4px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]">
                            Nhóm gốc
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)] tracking-[0.4px]">
                        {row.sortOrder}
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)] tracking-[0.4px]">
                        <div className="flex flex-wrap gap-2">
                          {row.units.length ? (
                            row.units.map((unit) => (
                              <span
                                key={unit.id}
                                className={`inline-flex px-3 py-1 text-xs font-normal tracking-[0.4px] ${
                                  unit.isDefault
                                    ? "mhv-chip"
                                    : "border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]"
                                }`}
                              >
                                {unit.label}
                                {unit.isDefault ? " (mặc định)" : ""}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs font-normal text-[var(--muted)] tracking-[0.4px]">Chưa cấu hình</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted)] tracking-[0.4px]">
                        {row.productCount} sản phẩm
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingCategory(row)}
                            className="mhv-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs font-normal transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
                          >
                            <PencilIcon />
                            Chỉnh sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCategory(row)}
                            className="inline-flex items-center gap-2 border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-normal text-red-600 transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
                          >
                            <TrashIcon />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm font-normal text-[var(--muted)] tracking-[0.4px]"
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
        <CategoryModalForm
          parentOptions={parentOptions}
          onSuccess={() => setIsCreateOpen(false)}
        />
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
            parentOptions={parentOptions}
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
