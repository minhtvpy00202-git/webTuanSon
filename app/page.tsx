import Link from "next/link";

const quickLinks = [
  {
    href: "/about",
    title: "Trang giới thiệu",
    description: "Sẽ hiển thị CompanyInfo với giao diện tabs ở bước tiếp theo.",
  },
  {
    href: "/products",
    title: "Trang sản phẩm",
    description: "Nơi sẽ có bộ lọc danh mục và lưới sản phẩm responsive.",
  },
  {
    href: "/promotions",
    title: "Trang khuyến mãi",
    description: "Layout giống trang sản phẩm và chỉ hiển thị sản phẩm khuyến mãi.",
  },
  {
    href: "/contact",
    title: "Trang liên hệ",
    description: "Hiển thị thông tin công ty và form liên hệ cơ bản.",
  },
];

export default function HomePage() {
  return (
    <section className="space-y-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
          Next.js + Prisma + Supabase
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Khởi tạo thành công bộ khung cho website Digital Catalogue.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Các bảng dữ liệu đã được tạo trên Supabase. Tiếp theo chúng ta sẽ lần lượt
          xây dựng giao diện giới thiệu, danh sách sản phẩm, chi tiết sản phẩm, trang
          khuyến mãi và liên hệ.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
