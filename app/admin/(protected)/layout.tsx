import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { AdminLogoutButton } from "@/components/admin/admin-logout-button";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { getAdminSession } from "@/lib/admin-auth";

const navItems = [
  { href: "/admin/products", label: "Quản lý sản phẩm" },
  { href: "/admin/categories", label: "Quản lý loại sản phẩm" },
  { href: "/admin/company", label: "Thông tin doanh nghiệp" },
  { href: "/admin/contact-info", label: "Liên hệ & chi nhánh" },
];

export const dynamic = "force-dynamic";

type AdminProtectedLayoutProps = {
  children: ReactNode;
};

export default async function AdminProtectedLayout({
  children,
}: AdminProtectedLayoutProps) {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <section className="relative left-1/2 w-screen max-w-none -translate-x-1/2 space-y-6 px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="mhv-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--primary)]">Trang quản trị</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Xin chào, {session.username}
            </h1>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
              Quản lý loại sản phẩm và sản phẩm trực tiếp từ dashboard admin.
            </p>
          </div>

          <AdminLogoutButton />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="mhv-card p-4">
          <AdminSidebarNav items={navItems} />
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
