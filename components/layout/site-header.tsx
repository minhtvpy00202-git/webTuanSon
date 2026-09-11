"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoTS from "@/components/logo/LogoTS";

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
        strokeWidth="1.5"
        strokeLinecap="butt"
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
        strokeWidth="1.5"
        strokeLinecap="butt"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 20c1.5-3.5 4.5-5.5 8-5.5s6.5 2 8 5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
      />
    </svg>
  );
}

export function SiteHeader({ companyName, session }: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const isAdmin = session?.role === "admin";
  const hasSession = Boolean(session);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  async function handleLogout() {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    setIsMenuOpen(false);
    setIsUserOpen(false);
    router.refresh();
  }

  function isNavItemActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const displayName = (companyName || "Digital Catalogue")
    .toUpperCase()
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="w-full border-b border-[var(--border)] px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
            aria-label="Mở menu"
            aria-expanded={isMenuOpen}
          >
            <HamburgerIcon />
            <span className="ml-2 hidden text-sm font-normal tracking-[0.4px] sm:inline">
              Menu
            </span>
          </button>

          <Link href="/" className="flex flex-1 items-center justify-center transition-all duration-300 ease-in-out hover:opacity-70">
            <LogoTS className="h-10 w-auto text-[var(--foreground)] sm:h-12 lg:h-14" />
            <span className="sr-only">{displayName}</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="hidden h-11 w-11 items-center justify-center text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70 sm:inline-flex"
              aria-label="Tìm kiếm"
            >
              <SearchIcon />
            </Link>

            {!hasSession ? (
              <Link
                href="/admin/login"
                className="inline-flex h-11 items-center gap-2 px-3 text-sm font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
              >
                <UserIcon />
                <span className="hidden sm:inline">Đăng nhập</span>
              </Link>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserOpen((value) => !value)}
                  className="inline-flex h-11 items-center gap-2 px-3 text-sm font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
                >
                  <UserIcon />
                  <span className="hidden sm:inline">{session?.username}</span>
                </button>

                {isUserOpen ? (
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 border border-[var(--border)] bg-[var(--card)] shadow-none lv-fade-in">
                    <div className="flex flex-col">
                      <div className="border-b border-[var(--border)] px-4 py-3 text-sm font-normal tracking-[0.4px] text-[var(--muted)]">
                        {session?.username}
                      </div>
                      {isAdmin ? (
                        <Link
                          href="/admin/products"
                          onClick={() => setIsUserOpen(false)}
                          className="px-4 py-3 text-sm font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70 hover:bg-[var(--surface-muted)]"
                        >
                          Trang quản trị
                        </Link>
                      ) : (
                        <div className="px-4 py-3 text-sm font-normal tracking-[0.4px] text-[var(--muted)]">
                          Guest
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="px-4 py-3 text-left text-sm font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70 hover:bg-[var(--surface-muted)]"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--border)] px-4 py-3 sm:px-6 lg:px-8 lg:hidden">
        <Link
          href="/products"
          className="flex items-center gap-3 border border-[var(--border)] px-4 py-2.5 text-sm font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
        >
          <SearchIcon />
          <span>Tìm sản phẩm...</span>
        </Link>
      </div>

      {isMenuOpen ? (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:bg-black/40"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed z-[51] bg-[var(--background)] border-[var(--border)] left-0 right-0 top-0 max-h-[85vh] w-full overflow-y-auto border-b lv-menu-slide-enter lg:left-0 lg:right-auto lg:top-0 lg:h-full lg:max-h-none lg:w-[380px] lg:max-w-[85vw] lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="inline-flex h-11 items-center gap-2 text-sm font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
                aria-label="Đóng menu"
              >
                <CloseIcon />
                <span className="ml-2">Đóng</span>
              </button>
              <Link href="/" onClick={() => setIsMenuOpen(false)} className="transition-all duration-300 ease-in-out hover:opacity-70">
                <LogoTS className="h-8 w-auto text-[var(--foreground)] sm:h-10" />
                <span className="sr-only">{displayName}</span>
              </Link>
              <div className="w-16" />
            </div>

            <nav className="flex flex-col px-4 py-4 sm:px-6">
              {navItems.map((item) => {
                const isActive = isNavItemActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`border-b border-[var(--border)] py-4 text-base font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 ${
                      isActive
                        ? "text-[var(--foreground)]"
                        : "text-[var(--foreground)]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-[var(--border)] px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3">
                <p className="text-sm font-normal tracking-[0.4px] text-[var(--muted)]">
                  Hỗ trợ khách hàng
                </p>
                {!hasSession ? (
                  <Link
                    href="/admin/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="lv-solid-primary px-4 py-3 text-center text-sm font-normal tracking-[0.4px]"
                  >
                    Đăng nhập
                  </Link>
                ) : (
                  <>
                    {isAdmin ? (
                      <Link
                        href="/admin/products"
                        onClick={() => setIsMenuOpen(false)}
                        className="lv-solid-primary px-4 py-3 text-center text-sm font-normal tracking-[0.4px]"
                      >
                        Trang quản trị
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mhv-btn-secondary px-4 py-3 text-center text-sm font-normal tracking-[0.4px]"
                    >
                      Đăng xuất
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
