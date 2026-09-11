import { BranchDeleteButton } from "@/components/admin/branch-delete-button";
import { BranchForm } from "@/components/admin/branch-form";
import { ContactInfoForm } from "@/components/admin/contact-info-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminContactInfoPage() {
  const companyInfo = await prisma.companyInfo.findUnique({
    where: { id: 1 },
    include: {
      branches: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return (
    <section className="space-y-6">
      <div className="mhv-card p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--primary)]">Liên hệ & chi nhánh</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Quản lý thông tin liên hệ và nhiều địa chỉ showroom
          </h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Bạn có thể cập nhật liên hệ chính và thêm nhiều chi nhánh/showroom để hiển
            thị trên website.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <ContactInfoForm
            initialValues={{
              phone: companyInfo?.phone || "",
              email: companyInfo?.email || "",
              zaloLink: companyInfo?.zaloLink || "",
              address: companyInfo?.address || "",
            }}
          />

          <BranchForm />
        </div>

        <div className="mhv-card p-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--primary)]">Danh sách địa chỉ</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {companyInfo?.branches.length ?? 0} chi nhánh / showroom
            </h3>
          </div>

          <div className="mt-6 space-y-4">
            {companyInfo?.branches.length ? (
              companyInfo.branches.map((branch) => (
                <article
                  key={branch.id}
                  className="rounded-2xl border border-slate-200 p-4 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-sm dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {branch.name}
                        </h4>
                        <span className="mhv-chip px-3 py-1 text-xs font-semibold">
                          {branch.isShowroom ? "Showroom" : "Chi nhánh"}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                        {branch.address}
                      </p>
                    </div>

                    <BranchDeleteButton branchId={branch.id} />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="mhv-muted-surface p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Điện thoại
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {branch.phone || "Đang cập nhật"}
                      </p>
                    </div>

                    <div className="mhv-muted-surface p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Email
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {branch.email || "Đang cập nhật"}
                      </p>
                    </div>

                    <div className="mhv-muted-surface p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Thứ tự
                      </p>
                      <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                        {branch.sortOrder}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
                Chưa có chi nhánh hoặc showroom nào được thêm.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
