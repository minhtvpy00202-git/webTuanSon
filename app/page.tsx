import Link from "next/link";

import { getCompanyInfoWithBranches } from "@/lib/company";

const quickLinks = [
  {
    href: "/products",
    title: "Khám phá sản phẩm",
    description: "Xem danh mục gạch ốp lát, ngói và thiết bị vệ sinh đang có sẵn.",
  },
  {
    href: "/promotions",
    title: "Xem khuyến mãi",
    description: "Theo dõi các sản phẩm đang có ưu đãi để tối ưu chi phí công trình.",
  },
  {
    href: "/about",
    title: "Tìm hiểu doanh nghiệp",
    description: "Xem thêm giới thiệu doanh nghiệp và định hướng hoạt động chi tiết.",
  },
  {
    href: "/contact",
    title: "Liên hệ tư vấn",
    description: "Gửi yêu cầu để được hỗ trợ báo giá và chọn sản phẩm phù hợp.",
  },
];

type InfoCardProps = {
  label: string;
  value: string;
  href?: string;
};

function InfoCard({ label, value, href }: InfoCardProps) {
  const content = (
    <div className="mhv-card h-full p-5 transition-all duration-200 ease-in-out hover:-translate-y-0.5">
      <p className="text-sm font-semibold text-[var(--primary)]">{label}</p>
      <p className="mt-2 text-base leading-7 text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
}

export default async function HomePage() {
  const { companyInfo } = await getCompanyInfoWithBranches();

  return (
    <section className="space-y-8">
      <div className="mhv-card overflow-hidden p-6 sm:p-8">
        <div className="space-y-4">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-semibold text-[var(--primary)] dark:border-orange-500/20 dark:bg-orange-500/10">
            {companyInfo?.companyName || "Digital Catalogue vật liệu xây dựng"}
          </span>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
              Vật liệu xây dựng chất lượng cho công trình bền vững và hiện đại
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
              {companyInfo?.aboutUs ??
                "Chúng tôi cung cấp catalogue điện tử cho gạch ốp lát, ngói và thiết bị vệ sinh với nội dung đang được cập nhật."}
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-2">
            <Link
              href="/products"
              className="mhv-btn-primary inline-flex w-full justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-sm"
            >
              Xem danh mục sản phẩm
            </Link>
            <Link
              href="/contact"
              className="mhv-btn-secondary inline-flex w-full justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5"
            >
              Gửi yêu cầu tư vấn
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="mhv-card p-6 sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[var(--primary)]">Nhiệm vụ & Sứ mệnh</p>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Đồng hành cùng khách hàng trong từng quyết định chọn vật liệu
            </h2>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
              {companyInfo?.mission ??
                "Nội dung nhiệm vụ doanh nghiệp đang được cập nhật."}
            </p>
            <p className="whitespace-pre-line text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
              {companyInfo?.vision ??
                "Nội dung sứ mệnh doanh nghiệp đang được cập nhật."}
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          <InfoCard
            label="Số điện thoại"
            value={companyInfo?.phone ?? "Đang cập nhật"}
            href={companyInfo?.phone ? `tel:${companyInfo.phone.replace(/\s+/g, "")}` : undefined}
          />
          <InfoCard
            label="Email"
            value={companyInfo?.email ?? "Đang cập nhật"}
            href={companyInfo?.email ? `mailto:${companyInfo.email}` : undefined}
          />
          <InfoCard label="Địa chỉ" value={companyInfo?.address ?? "Đang cập nhật"} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="mhv-card p-6 transition-all duration-200 ease-in-out hover:-translate-y-1"
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
