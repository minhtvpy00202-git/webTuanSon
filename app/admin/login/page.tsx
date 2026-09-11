import { redirect } from "next/navigation";
import Image from "next/image";

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
          <div className="mb-3 flex justify-center">
            <Image
              src="/icon.svg"
              alt="Logo Vật liệu xây dựng Tuấn Sơn"
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 mx-auto"
            />
          </div>
          <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px] text-center">Khu vực quản trị</p>
          <h1 className="text-3xl font-normal text-[var(--foreground)] tracking-[0.4px]">
            Đăng nhập để quản lý catalogue
          </h1>
          <p className="text-sm font-normal leading-7 text-[var(--muted)] tracking-[0.4px]">
            Sau khi đăng nhập bằng username quản trị, bạn có thể tạo loại sản phẩm mới,
            thêm sản phẩm và upload ảnh trực tiếp lên Supabase Storage bucket{" "}
            <span className="font-normal tracking-[0.4px]">Product</span>.
          </p>
        </div>
      </div>

      <AdminLoginForm />
    </section>
  );
}
