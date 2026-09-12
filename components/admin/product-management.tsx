"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminModal } from "@/components/admin/admin-modal";
import { ConfirmModal } from "@/components/admin/confirm-modal";
import { ProductModalForm } from "@/components/admin/product-modal-form";
import { formatCurrencyPerUnit } from "@/lib/format";
import { getPrimaryUnitPrice } from "@/lib/product-pricing";

type CategoryOption = {
  id: number;
  name: string;
  parentId: number | null;
  sortOrder: number;
  units: Array<{
    id: number;
    label: string;
    isDefault: boolean;
    sortOrder: number;
  }>;
};

type ProductRow = {
  id: number;
  productCode: string;
  name: string;
  description: string;
  specs: string;
  isPromotion: boolean;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  unitPrices: Array<{
    categoryUnitId: number;
    label: string;
    isDefault: boolean;
    price: string;
    discountPrice: string | null;
  }>;
  images: Array<{
    id: number;
    imageUrl: string;
    storagePath: string | null;
    isMain: boolean;
    sortOrder: number;
  }>;
};

type ProductManagementProps = {
  categories: CategoryOption[];
  products: ProductRow[];
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Ho_Chi_Minh",
});

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

type PromotionFilter = "all" | "promotion" | "normal";

export function ProductManagement({
  categories,
  products,
}: ProductManagementProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [promotionFilter, setPromotionFilter] = useState<PromotionFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductRow | null>(null);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchKeyword =
        !keyword ||
        [product.name, product.productCode, product.categoryName].some((value) =>
          value.toLowerCase().includes(keyword),
        );
      const matchCategory =
        categoryFilter === "all" || String(product.categoryId) === categoryFilter;
      const matchPromotion =
        promotionFilter === "all" ||
        (promotionFilter === "promotion" ? product.isPromotion : !product.isPromotion);

      return matchKeyword && matchCategory && matchPromotion;
    });
  }, [categoryFilter, products, promotionFilter, search]);

  async function handleDeleteProduct() {
    if (!deletingProduct) {
      return;
    }

    const response = await fetch(`/api/admin/products/${deletingProduct.id}`, {
      method: "DELETE",
    });

    const result = (await response.json().catch(() => null)) as
      | { success?: boolean; message?: string }
      | null;

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || "Không thể xóa sản phẩm.");
    }

    router.refresh();
    setDeletingProduct(null);
  }

  return (
    <section className="space-y-6">
      <div className="mhv-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">Quản lý sản phẩm</p>
            <h2 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
              Danh sách sản phẩm trong catalogue
            </h2>
            <p className="text-sm font-normal leading-6 text-slate-600 dark:text-slate-400 tracking-[0.4px]">
              Tìm kiếm nhanh theo tên hoặc mã sản phẩm, lọc nâng cao và thao tác thêm
              mới, chỉnh sửa bằng modal.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
          >
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="mhv-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm tên sản phẩm, mã sản phẩm hoặc danh mục"
            className="mhv-input text-sm tracking-[0.4px]"
          />

          <button
            type="button"
            onClick={() => setShowAdvancedFilters((value) => !value)}
            className="mhv-btn-secondary inline-flex px-4 py-3 text-sm font-normal transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
          >
            {showAdvancedFilters ? "Ẩn bộ lọc nâng cao" : "Bộ lọc nâng cao"}
          </button>
        </div>

        {showAdvancedFilters ? (
          <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                Lọc theo loại
              </span>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="mhv-input text-sm tracking-[0.4px]"
              >
                <option value="all">Tất cả loại sản phẩm</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                Lọc theo trạng thái khuyến mãi
              </span>
              <select
                value={promotionFilter}
                onChange={(event) =>
                  setPromotionFilter(event.target.value as PromotionFilter)
                }
                className="mhv-input text-sm tracking-[0.4px]"
              >
                <option value="all">Tất cả</option>
                <option value="promotion">Đang khuyến mãi</option>
                <option value="normal">Không khuyến mãi</option>
              </select>
            </label>
          </div>
        ) : null}
      </div>

      <div className="mhv-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-lg font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
              Danh sách sản phẩm
            </p>
            <p className="text-sm font-normal text-slate-500 dark:text-slate-400 tracking-[0.4px]">
              Hiển thị {filteredProducts.length} / {products.length} sản phẩm
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1100px] divide-y divide-slate-200 text-sm dark:divide-slate-800">
            <thead className="bg-[var(--surface-muted)] text-left text-slate-600 dark:bg-slate-900/70 dark:text-slate-300">
              <tr>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Sản phẩm</th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Mã SP</th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Danh mục</th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Giá</th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Khuyến mãi</th>
                <th className="px-6 py-4 font-normal tracking-[0.4px]">Ngày tạo</th>
                <th className="px-6 py-4 font-normal text-right tracking-[0.4px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950/40">
              {filteredProducts.length ? (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="transition-colors duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-900/60"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-14 w-14 overflow-hidden border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                            {product.name}
                          </p>
                          <p className="truncate text-xs font-normal text-slate-500 dark:text-slate-400 tracking-[0.4px]">
                            {product.specs || "Chưa có quy cách"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 tracking-[0.4px]">
                      {product.productCode}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 tracking-[0.4px]">
                      {product.categoryName}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 tracking-[0.4px]">
                      {(() => {
                        const primaryUnitPrice = getPrimaryUnitPrice(product.unitPrices);

                        if (!primaryUnitPrice) {
                          return (
                            <span className="text-xs font-normal text-slate-400 tracking-[0.4px]">
                              Chưa có đơn giá
                            </span>
                          );
                        }

                        return (
                          <>
                            <p className="font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                              {formatCurrencyPerUnit(
                                primaryUnitPrice.price,
                                primaryUnitPrice.label,
                              )}
                            </p>
                            {primaryUnitPrice.discountPrice ? (
                              <p className="text-xs font-normal text-[var(--foreground)] tracking-[0.4px]">
                                KM:{" "}
                                {formatCurrencyPerUnit(
                                  primaryUnitPrice.discountPrice,
                                  primaryUnitPrice.label,
                                )}
                              </p>
                            ) : null}
                          </>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-normal tracking-[0.4px] ${
                          product.isPromotion
                            ? "mhv-chip"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        {product.isPromotion ? "Đang khuyến mãi" : "Bình thường"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 tracking-[0.4px]">
                      {dateFormatter.format(new Date(product.createdAt))}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(product)}
                          className="mhv-btn-secondary inline-flex items-center gap-2 px-3 py-2 text-xs font-normal transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
                        >
                          <PencilIcon />
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(product)}
                          className="inline-flex items-center gap-2 border border-[var(--border)] bg-white px-3 py-2 text-xs font-normal text-red-600 transition-all duration-200 ease-in-out hover:opacity-70 tracking-[0.4px]"
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
                    colSpan={7}
                    className="px-6 py-10 text-center text-sm font-normal text-slate-500 dark:text-slate-400 tracking-[0.4px]"
                  >
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdminModal
        open={isCreateOpen}
        title="Thêm sản phẩm"
        description="Nhập thông tin sản phẩm mới. Ảnh sẽ được upload lên bucket Product trên Supabase Storage."
        onClose={() => setIsCreateOpen(false)}
      >
        <ProductModalForm
          categories={categories}
          onSuccess={() => setIsCreateOpen(false)}
        />
      </AdminModal>

      <AdminModal
        open={Boolean(editingProduct)}
        title="Chỉnh sửa sản phẩm"
        description="Cập nhật thông tin sản phẩm. Nếu không chọn ảnh mới, hệ thống sẽ giữ ảnh hiện tại."
        onClose={() => setEditingProduct(null)}
      >
        {editingProduct ? (
          <ProductModalForm
            categories={categories}
            product={editingProduct}
            onSuccess={() => setEditingProduct(null)}
          />
        ) : null}
      </AdminModal>

      <ConfirmModal
        open={Boolean(deletingProduct)}
        title="Xóa sản phẩm"
        description={`Bạn có chắc muốn xóa "${deletingProduct?.name ?? ""}"? Thao tác này sẽ xóa bản ghi sản phẩm khỏi hệ thống.`}
        confirmLabel="Xóa sản phẩm"
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDeleteProduct}
      />
    </section>
  );
}
