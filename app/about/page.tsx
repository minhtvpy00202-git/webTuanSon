import { AboutTabs } from "@/components/about/about-tabs";
import { prisma } from "@/lib/prisma";

export default async function AboutPage() {
  const companyInfo = await prisma.companyInfo.findUnique({
    where: { id: 1 },
  });

  return (
    <section className="space-y-8">
      <div className="mhv-card p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">Thông tin doanh nghiệp</p>
          <h1 className="text-3xl font-normal text-slate-900 sm:text-4xl dark:text-slate-100 tracking-[0.4px]">
            Đồng hành cùng công trình bằng giải pháp vật liệu phù hợp
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400 tracking-[0.4px]">
            Tìm hiểu thêm về doanh nghiệp, định hướng hoạt động và giá trị mà chúng tôi
            mang đến cho khách hàng qua từng dự án.
          </p>
        </div>
      </div>

      <AboutTabs
        companyName={companyInfo?.companyName ?? "Doanh nghiệp đang cập nhật"}
        aboutUs={companyInfo?.aboutUs ?? "Nội dung giới thiệu đang được cập nhật."}
        mission={companyInfo?.mission ?? "Nội dung nhiệm vụ đang được cập nhật."}
        vision={companyInfo?.vision ?? "Nội dung sứ mệnh đang được cập nhật."}
      />
    </section>
  );
}
