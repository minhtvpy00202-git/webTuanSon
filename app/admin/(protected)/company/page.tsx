import { CompanyInfoForm } from "@/components/admin/company-info-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCompanyPage() {
  const companyInfo = await prisma.companyInfo.findUnique({
    where: { id: 1 },
    include: {
      heroSlides: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return (
    <section className="space-y-6">
      <div className="mhv-card p-6">
        <div className="space-y-2">
          <p className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Quản lý doanh nghiệp</p>
          <h2 className="text-2xl font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
            Cập nhật nội dung giới thiệu, nhiệm vụ và ảnh carousel trang chủ
          </h2>
          <p className="text-sm font-normal leading-6 tracking-[0.4px] text-slate-600 dark:text-slate-400">
            Các nội dung này sẽ hiển thị ở trang chủ và trang giới thiệu của website. Ảnh carousel sẽ được hiển thị thay thế banner đơn hiện tại.
          </p>
        </div>
      </div>

      <CompanyInfoForm
        initialValues={{
          companyName: companyInfo?.companyName || "",
          aboutUs: companyInfo?.aboutUs || "",
          mission: companyInfo?.mission || "",
          vision: companyInfo?.vision || "",
          heroSlides: (companyInfo?.heroSlides ?? []).map((slide) => ({
            id: slide.id,
            imageUrl: slide.imageUrl,
            storagePath: slide.storagePath ?? null,
            sortOrder: slide.sortOrder,
            heading: slide.heading ?? "",
            subheading: slide.subheading ?? "",
            ctaText: slide.ctaText ?? "",
            ctaLink: slide.ctaLink ?? "",
          })),
        }}
      />
    </section>
  );
}
