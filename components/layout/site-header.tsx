"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/promotions", label: "Khuyến mãi" },
  { href: "/contact", label: "Liên hệ" },
];

type SiteHeaderProps = {
  companyName?: string | null;
  session?: {
    role: string;
    username: string;
  } | null;
};

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader({ companyName, session }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdmin = session?.role === "admin";
  const hasSession = Boolean(session);

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    setIsMobileMenuOpen(false);
    router.refresh();
  }

  function isNavItemActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const desktopNav = (
    <nav className="hidden items-center gap-2 text-sm font-medium text-slate-600 lg:flex dark:text-slate-300">
      {navItems.map((item) => {
        const isActive = isNavItemActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full border px-4 py-2.5 transition-all duration-200 ease-in-out ${
              isActive
                ? "border-2 border-[#F27025] bg-[#fef0ea] text-[#F27025] shadow-sm dark:border-[#F27025] dark:bg-[#fef0ea] dark:text-[#F27025]"
                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[color:color-mix(in_srgb,var(--primary)_35%,white)] hover:text-[var(--primary)] hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:hover:border-[color:color-mix(in_srgb,var(--primary)_35%,black)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[color:color-mix(in_srgb,var(--card)_92%,transparent)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--card)_86%,transparent)] dark:border-slate-800/80">
      <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-4 py-4 sm:px-6 lg:gap-6 lg:px-8">
        <div className="flex-1 space-y-1 lg:max-w-[28rem] xl:max-w-[30rem]">
          <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--primary)_25%,white)] bg-[color:color-mix(in_srgb,var(--primary)_10%,white)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Vật liệu xây dựng
          </span>
          <Link
            href="/"
            className="block text-xl font-bold tracking-tight text-slate-900 transition-all duration-200 ease-in-out hover:text-[var(--primary)] sm:text-2xl dark:text-slate-100"
          >
            {companyName || "Digital Catalogue"}
          </Link>
          <p className="max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Catalogue điện tử hiện đại cho gạch men, ngói và thiết bị vệ sinh với trải
            nghiệm tra cứu rõ ràng, tin cậy.
          </p>
        </div>

        <div className="hidden shrink-0 lg:flex lg:flex-col lg:items-end lg:gap-3 xl:flex-row xl:items-center xl:gap-2">
          {desktopNav}

          {!hasSession ? (
            <Link
              href="/admin/login"
              className="mhv-btn-primary rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-sm"
            >
              Đăng nhập
            </Link>
          ) : (
            <div className="group relative">
              <button
                type="button"
                className="mhv-btn-secondary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-sm"
              >
                <span>{session?.username}</span>
                <ChevronDownIcon />
              </button>

              <div className="invisible absolute right-0 top-[calc(100%+0.75rem)] z-50 w-56 translate-y-2 opacity-0 transition-all duration-200 ease-in-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div className="mhv-card overflow-hidden p-2">
                  {isAdmin ? (
                    <Link
                      href="/admin/products"
                      className="flex rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 ease-in-out hover:bg-[#fef0ea] hover:text-[#F27025] dark:text-slate-200 dark:hover:bg-orange-500/10 dark:hover:text-[#F27025]"
                    >
                      Trang quản trị
                    </Link>
                  ) : (
                    <div className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                      Guest
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-600 transition-all duration-200 ease-in-out hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
          className="mhv-btn-secondary inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl lg:hidden"
          aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 sm:px-6 lg:hidden dark:border-slate-800">
          <div className="mx-auto flex max-w-7xl flex-col gap-3">
            <nav className="grid gap-3">
              {navItems.map((item) => {
                const isActive = isNavItemActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-200 ease-in-out ${
                      isActive
                        ? "border-2 border-[#F27025] bg-[#fef0ea] text-[#F27025] shadow-sm dark:border-[#F27025] dark:bg-[#fef0ea] dark:text-[#F27025]"
                        : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {!hasSession ? (
              <Link
                href="/admin/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mhv-btn-primary inline-flex w-full justify-center rounded-2xl px-4 py-3 text-sm font-semibold"
              >
                Đăng nhập
              </Link>
            ) : (
              <div className="mhv-card space-y-2 p-3">
                <div className="rounded-xl bg-[#fef0ea] px-4 py-3 text-sm font-semibold text-[#F27025]">
                  {session?.username}
                </div>

                {isAdmin ? (
                  <Link
                    href="/admin/products"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mhv-btn-secondary inline-flex w-full justify-center rounded-2xl px-4 py-3 text-sm font-semibold"
                  >
                    Trang quản trị
                  </Link>
                ) : (
                  <div className="mhv-btn-secondary inline-flex w-full justify-center rounded-2xl px-4 py-3 text-sm font-semibold">
                    Guest
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex w-full justify-center rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-600 transition-all duration-200 ease-in-out hover:bg-rose-50 dark:border-rose-500/20 dark:bg-slate-900 dark:hover:bg-rose-500/10"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
