import { AboutTabs } from "@/components/about/about-tabs";
import { prisma } from "@/lib/prisma";

export default async function AboutPage() {
  const companyInfo = await prisma.companyInfo.findUnique({
    where: { id: 1 },
  });

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-600">Thông tin doanh nghiệp</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Đồng hành cùng công trình bằng giải pháp vật liệu phù hợp
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Tìm hiểu thêm về doanh nghiệp, định hướng hoạt động và giá trị mà chúng tôi
            mang đến cho khách hàng qua từng dự án.
          </p>
        </div>
      </div>

      <AboutTabs
        aboutUs={companyInfo?.aboutUs ?? "Nội dung giới thiệu đang được cập nhật."}
        mission={companyInfo?.mission ?? "Nội dung nhiệm vụ và sứ mệnh đang được cập nhật."}
      />
    </section>
  );
}
