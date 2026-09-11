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
    <div className="mhv-card p-6 transition-all duration-300 ease-in-out hover:opacity-70">
      <p className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">{title}</p>
      <p className="mt-2 text-base leading-7 text-slate-900 dark:text-slate-100 tracking-[0.4px]">{value}</p>
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
    include: {
      branches: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  return (
    <section className="space-y-8">
      <div className="mhv-card p-6 sm:p-8">
        <div className="space-y-3">
          <p className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">Liên hệ & tư vấn</p>
          <h1 className="text-3xl font-normal text-slate-900 sm:text-4xl dark:text-slate-100 tracking-[0.4px]">
            Kết nối nhanh với đội ngũ tư vấn
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-400 tracking-[0.4px]">
            Chúng tôi sẵn sàng hỗ trợ báo giá, gợi ý sản phẩm phù hợp và tư vấn giải
            pháp vật liệu cho từng công trình.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <div className="mhv-card space-y-2 p-6">
            <p className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">Thông tin doanh nghiệp</p>
            <h2 className="text-2xl font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
              Thông tin liên hệ chính thức
            </h2>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 tracking-[0.4px]">
              Bạn có thể gọi điện, gửi email hoặc liên hệ qua Zalo để được hỗ trợ trực
              tiếp.
            </p>
          </div>

          <div className="grid gap-6">
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

          <div className="mhv-card space-y-3 p-6">
            <div className="space-y-1">
              <p className="text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">Chi nhánh & showroom</p>
              <h3 className="text-xl font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">
                Hệ thống địa chỉ đang hoạt động
              </h3>
            </div>

            <div className="space-y-3">
              {companyInfo?.branches.length ? (
                companyInfo.branches.map((branch) => (
                  <div key={branch.id} className="mhv-muted-surface p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-normal text-slate-900 dark:text-slate-100 tracking-[0.4px]">{branch.name}</p>
                      <span className="bg-[var(--surface-muted)] px-2.5 py-1 text-xs font-normal text-[var(--foreground)] dark:bg-[var(--surface-muted)] tracking-[0.4px]">
                        {branch.isShowroom ? "Showroom" : "Chi nhánh"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400 tracking-[0.4px]">{branch.address}</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400 tracking-[0.4px]">
                      {branch.phone ? <span>Điện thoại: {branch.phone}</span> : null}
                      {branch.email ? <span>Email: {branch.email}</span> : null}
                      {branch.mapsLink ? (
                        <a
                          href={branch.mapsLink}
                          target="_blank"
                          rel="noreferrer"
                          className="font-normal text-[var(--foreground)] hover:opacity-70 tracking-[0.4px]"
                        >
                          Xem bản đồ
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400 tracking-[0.4px]">
                  Doanh nghiệp chưa cập nhật chi nhánh hoặc showroom.
                </p>
              )}
            </div>
          </div>
        </div>

        <ContactForm initialProductInterest={productInterest} />
      </div>
    </section>
  );
}
