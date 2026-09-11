import { AccountManagement } from "@/components/admin/account-management";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminAccountsPage() {
  const session = await getAdminSession();
  const accounts = await prisma.user.findMany({
    include: { role: { select: { name: true } } },
    orderBy: [{ roleId: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-4">
      <div className="mhv-card space-y-3 p-6">
        <p className="text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
          Quản trị viên
        </p>
        <h2 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
          Danh sách tài khoản
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400 tracking-[0.4px]">
          Quản lý các tài khoản có quyền truy cập khu vực quản trị: thêm, sửa thông tin, đặt lại
          mật khẩu và phân quyền quản trị / nhân viên.
        </p>
      </div>

      <AccountManagement
        initialAccounts={accounts.map((user) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role.name === "admin" ? "admin" : "guest",
          createdAt: user.createdAt.toISOString(),
          lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
        }))}
        currentUserId={session?.userId ?? 0}
      />
    </div>
  );
}
