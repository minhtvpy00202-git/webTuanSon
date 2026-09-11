import Link from "next/link";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/promotions", label: "Khuyến mãi" },
  { href: "/contact", label: "Liên hệ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <Link
            href="/"
            className="text-xl font-semibold text-slate-900 transition-all duration-200 ease-in-out hover:text-blue-600"
          >
            Digital Catalogue
          </Link>
          <p className="text-sm text-slate-500">
            Catalogue điện tử cho gạch men, ngói và thiết bị vệ sinh.
          </p>
        </div>

        <nav className="flex flex-wrap gap-2 text-sm font-medium text-slate-600">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
