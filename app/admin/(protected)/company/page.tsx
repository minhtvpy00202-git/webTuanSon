import { CompanyInfoForm } from "@/components/admin/company-info-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCompanyPage() {
  const companyInfo = await prisma.companyInfo.findUnique({
    where: { id: 1 },
  });

  return (
    <section className="space-y-6">
      <div className="mhv-card p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-[var(--primary)]">Quản lý doanh nghiệp</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Cập nhật nội dung giới thiệu, nhiệm vụ và sứ mệnh
          </h2>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
            Các nội dung này sẽ hiển thị ở trang chủ và trang giới thiệu của website.
          </p>
        </div>
      </div>

      <CompanyInfoForm
        initialValues={{
          companyName: companyInfo?.companyName || "",
          aboutUs: companyInfo?.aboutUs || "",
          mission: companyInfo?.mission || "",
          vision: companyInfo?.vision || "",
        }}
      />
    </section>
  );
}
