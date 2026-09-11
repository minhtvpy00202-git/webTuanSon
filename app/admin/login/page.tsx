import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session?.role === "admin") {
    redirect("/admin/products");
  }

  return (
    <section className="mx-auto max-w-xl space-y-6 py-8">
      <div className="mhv-card p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-[var(--primary)]">Khu vực quản trị</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
            Đăng nhập để quản lý catalogue
          </h1>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">
            Sau khi đăng nhập bằng username quản trị, bạn có thể tạo loại sản phẩm mới,
            thêm sản phẩm và upload ảnh trực tiếp lên Supabase Storage bucket{" "}
            <span className="font-semibold">Product</span>.
          </p>
        </div>
      </div>

      <AdminLoginForm />
    </section>
  );
}
