import { ContactForm } from "@/components/contact/contact-form";
import { prisma } from "@/lib/prisma";

type ContactPageProps = {
  searchParams?: Promise<{
    product?: string;
  }>;
};

function ContactInfoCard({
  title,
  value,
  href,
}: {
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-medium text-blue-600">{title}</p>
      <p className="mt-2 text-base leading-7 text-slate-900">{value}</p>
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

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const productInterest = resolvedSearchParams?.product ?? "";

  const companyInfo = await prisma.companyInfo.findUnique({
    where: { id: 1 },
  });

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-medium text-blue-600">Liên hệ & tư vấn</p>
          <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Kết nối nhanh với đội ngũ tư vấn
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            Chúng tôi sẵn sàng hỗ trợ báo giá, gợi ý sản phẩm phù hợp và tư vấn giải
            pháp vật liệu cho từng công trình.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="space-y-2 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-blue-600">Thông tin doanh nghiệp</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Thông tin liên hệ chính thức
            </h2>
            <p className="text-sm leading-6 text-slate-600">
              Bạn có thể gọi điện, gửi email hoặc liên hệ qua Zalo để được hỗ trợ trực
              tiếp.
            </p>
          </div>

          <div className="grid gap-4">
            <ContactInfoCard
              title="Số điện thoại"
              value={companyInfo?.phone ?? "Đang cập nhật"}
              href={companyInfo?.phone ? `tel:${companyInfo.phone.replace(/\s+/g, "")}` : undefined}
            />
            <ContactInfoCard
              title="Email"
              value={companyInfo?.email ?? "Đang cập nhật"}
              href={companyInfo?.email ? `mailto:${companyInfo.email}` : undefined}
            />
            <ContactInfoCard
              title="Địa chỉ"
              value={companyInfo?.address ?? "Đang cập nhật"}
            />
            <ContactInfoCard
              title="Zalo"
              value={companyInfo?.zaloLink ?? "Đang cập nhật"}
              href={companyInfo?.zaloLink ?? undefined}
            />
          </div>
        </div>

        <ContactForm initialProductInterest={productInterest} />
      </div>
    </section>
  );
}
