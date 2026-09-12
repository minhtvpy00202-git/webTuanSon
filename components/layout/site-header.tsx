"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-context";
import { GlobalSearchClient } from "@/components/layout/global-search-client";

const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/about", label: "Giới thiệu" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/promotions", label: "Khuyến mãi" },
  { href: "/contact", label: "Liên hệ" },
];

type CategoryNavItem = { id: number; name: string; slug: string; children: CategoryNavItem[] };
type FeaturedCategoryProduct = {
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  productId: number;
  productName: string;
  productImageUrl: string | null;
};

type SiteHeaderProps = {
  companyName?: string | null;
  session?: {
    role: string;
    username: string;
  } | null;
  categories?: CategoryNavItem[];
  featuredCategoryProducts?: FeaturedCategoryProduct[];
};

type MenuView = "main" | "categories";

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

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M4 6h2.5l2.2 11.3A2 2 0 0 0 10.7 19h7.6a2 2 0 0 0 2-1.7L21.5 9H6.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
        strokeLinejoin="miter"
      />
      <circle cx="10" cy="21" r="1.2" fill="currentColor" />
      <circle cx="18" cy="21" r="1.2" fill="currentColor" />
    </svg>
  );
}

function ChevronLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 ${className}`}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="m15 18-6-6 6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader({
  companyName,
  session,
  categories = [],
  featuredCategoryProducts = [],
}: SiteHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [view, setView] = useState<MenuView>("main");
  const [categoriesPhase, setCategoriesPhase] = useState<0 | 1 | 2 | 3>(0);
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const { totalItems } = useCart();
  const isAdmin = session?.role === "admin";
  const hasSession = Boolean(session);

  function toggleExpand(id: number) {
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  useEffect(() => {
    if (view !== "categories") {
      setCategoriesPhase(0);
      return;
    }
    setCategoriesPhase(1);
    const t2 = window.setTimeout(() => setCategoriesPhase(2), 900);
    const t3 = window.setTimeout(() => setCategoriesPhase(3), 1800);
    return () => {
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [view]);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setView("main");
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

  const selectedCategorySlugs = useMemo(() => {
    const raw = searchParams.get("categories") ?? searchParams.get("category");
    if (!raw) return new Set<string>();
    return new Set(
      raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    );
  }, [searchParams]);

  const displayName = (companyName || "Digital Catalogue")
    .toUpperCase()
    .split(" ")
    .filter(Boolean)
    .slice(0, 3)
    .join(" ");

  function openCategories() {
    setView("categories");
  }

  function backToMain() {
    setView("main");
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

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

          <Link href="/" className="flex flex-1 items-center justify-center gap-3 sm:gap-4 transition-all duration-300 ease-in-out hover:opacity-70">
            <Image
              src="/icon.svg"
              alt="Logo Vật liệu xây dựng Tuấn Sơn"
              width={56}
              height={56}
              className="h-10 w-10 shrink-0 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
              priority
            />
            <span
              className="hidden select-none text-[var(--foreground)] sm:block"
              style={{
                fontWeight: 700,
                letterSpacing: "2.5px",
                fontFamily:
                  "Inter, 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              <span className="block whitespace-nowrap text-[11px] leading-none tracking-[3px] sm:text-[13px] sm:tracking-[3.6px] md:text-[15px] md:tracking-[4px] lg:text-[18px] lg:tracking-[5px]">
                Vật liệu xây dựng Tuấn Sơn
              </span>
            </span>
            <span className="sr-only">{displayName}</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <GlobalSearchClient variant="topbar" />
            </div>

            <Link
              href="/cart"
              aria-label={`Giỏ hàng, ${totalItems} sản phẩm`}
              className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
            >
              <CartIcon className="h-5 w-5" />
              {totalItems > 0 ? (
                <span
                  className="absolute right-1 top-1 z-10 inline-flex min-w-[20px] h-[20px] items-center justify-center px-1 text-[11px] font-medium text-white shadow-none"
                  style={{ backgroundColor: "#F27025" }}
                >
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              ) : null}
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
        <GlobalSearchClient variant="mobile-bar" />
      </div>

      {isMenuOpen ? (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:bg-black/40"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div
            className={`fixed z-[51] bg-[var(--background)] border-[var(--border)] left-0 right-0 top-0 h-[85vh] w-full max-h-[100vh] overflow-hidden border-b lv-menu-slide-enter lg:left-0 lg:right-auto lg:top-0 lg:h-full lg:max-h-none lg:border-b-0 lg:border-r transition-[width,max-width] duration-[850ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
              view === "categories" && categoriesPhase >= 2
                ? "lg:max-w-[calc(380px+1px+((100vh-260px)/3))] lg:w-[calc(380px+1px+((100vh-260px)/3))]"
                : "lg:w-[380px] lg:max-w-[380px]"
            }`}
          >
            <div className="relative flex h-full w-full flex-col">
              <div
                className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 py-4 transition-all duration-700 ease-[cubic-bezier(.22,.61,.36,1)] sm:px-6 ${
                  view === "main"
                    ? "opacity-100 translate-y-0"
                    : "pointer-events-none opacity-0 -translate-y-3"
                }`}
                aria-hidden={view !== "main"}
              >
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex h-11 items-center gap-2 text-sm font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
                  aria-label="Đóng menu"
                >
                  <CloseIcon />
                  <span className="ml-2">Đóng</span>
                </button>
                <Link href="/" onClick={closeMenu} className="transition-all duration-300 ease-in-out hover:opacity-70">
                  <Image
                    src="/icon.svg"
                    alt="Logo Vật liệu xây dựng Tuấn Sơn"
                    width={40}
                    height={40}
                    className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
                  />
                  <span className="sr-only">{displayName}</span>
                </Link>
                <div className="w-16" />
              </div>

              <div
                className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4 py-4 transition-all duration-700 ease-[cubic-bezier(.22,.61,.36,1)] sm:px-6 ${
                  view === "categories"
                    ? "opacity-100 translate-y-0"
                    : "pointer-events-none opacity-0 translate-y-3"
                }`}
                aria-hidden={view !== "categories"}
              >
                <button
                  type="button"
                  onClick={backToMain}
                  className="inline-flex h-11 items-center gap-3 text-lg font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                  <span className="lv-underline-item">Thể loại</span>
                </button>
                <Link href="/" onClick={closeMenu} className="transition-all duration-300 ease-in-out hover:opacity-70">
                  <Image
                    src="/icon.svg"
                    alt="Logo Vật liệu xây dựng Tuấn Sơn"
                    width={40}
                    height={40}
                    className="h-8 w-8 shrink-0 sm:h-10 sm:w-10"
                  />
                  <span className="sr-only">{displayName}</span>
                </Link>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="inline-flex h-11 w-11 items-center justify-center text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
                  aria-label="Đóng menu"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="relative flex-1 overflow-hidden pt-[73px]">
                <div
                  className={`absolute inset-0 overflow-y-auto pt-[73px] transition-all duration-[850ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
                    view === "main"
                      ? "translate-x-0 opacity-100"
                      : "-translate-x-full opacity-0 pointer-events-none"
                  }`}
                >
                  <nav className="flex flex-col px-4 py-4 sm:px-6">
                    {navItems.slice(0, 3).map((item) => {
                      const isActive = isNavItemActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className={`border-b border-[var(--border)] py-4 text-base font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 ${
                            isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
                          }`}
                        >
                          <span className="lv-underline-item">{item.label}</span>
                        </Link>
                      );
                    })}

                    <button
                      type="button"
                      onClick={openCategories}
                      className={`flex w-full items-center justify-between border-b border-[var(--border)] py-4 text-base font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70`}
                    >
                      <span className="lv-underline-item">Thể loại</span>
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 shrink-0 opacity-60"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="m9 18 6-6-6-6"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>

                    {navItems.slice(3).map((item) => {
                      const isActive = isNavItemActive(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMenu}
                          className={`border-b border-[var(--border)] py-4 text-base font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 ${
                            isActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
                          }`}
                        >
                          <span className="lv-underline-item">{item.label}</span>
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
                          onClick={closeMenu}
                          className="lv-solid-primary px-4 py-3 text-center text-sm font-normal tracking-[0.4px]"
                        >
                          Đăng nhập
                        </Link>
                      ) : (
                        <>
                          {isAdmin ? (
                            <Link
                              href="/admin/products"
                              onClick={closeMenu}
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

                <div
                  className={`absolute inset-0 overflow-y-auto pt-[73px] transition-all duration-[850ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
                    view === "categories"
                      ? "translate-x-0 opacity-100"
                      : "translate-x-full opacity-0 pointer-events-none"
                  }`}
                >
                  <div
                    className={`grid h-full min-h-full w-full gap-0 transition-[grid-template-columns] duration-[850ms] ease-[cubic-bezier(.22,.61,.36,1)] grid-cols-1 lg:grid-cols-[380px_0fr] ${
                      categoriesPhase >= 2
                        ? "lg:grid-cols-[380px_minmax(0,1fr)]"
                        : "lg:grid-cols-[380px_0fr]"
                    }`}
                  >
                    <div className="min-h-0 w-full border-b border-[var(--border)] px-4 py-4 sm:px-6 lg:border-b-0 lg:border-r lg:py-5 lg:w-[380px] lg:min-w-[380px] lg:max-w-[380px]">
                      <div className="flex flex-col">
                        {categories.length === 0 ? (
                          <div className="px-2 py-8 text-sm font-normal tracking-[0.4px] text-[var(--muted)]">
                            Chưa có thể loại nào.
                          </div>
                        ) : null}
                        {categories.map((cat) => {
                          const hasChildren = cat.children && cat.children.length > 0;
                          const isExpanded = expandedParents.has(cat.id);
                          const isCatActive = selectedCategorySlugs.has(cat.slug);
                          return (
                            <div key={cat.id} className="flex flex-col">
                              <div className="flex items-stretch">
                                {hasChildren ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      toggleExpand(cat.id);
                                    }}
                                    aria-expanded={isExpanded}
                                    aria-label={isExpanded ? `Thu gọn ${cat.name}` : `Mở rộng ${cat.name}`}
                                    className={`flex flex-1 items-center justify-between px-2 py-3 text-left text-base font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 ${
                                      isCatActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
                                    }`}
                                  >
                                    <span className="lv-underline-item">{cat.name}</span>
                                    <svg
                                      viewBox="0 0 24 24"
                                      className={`ml-3 h-4 w-4 shrink-0 opacity-70 transition-transform duration-[850ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
                                        isExpanded ? "rotate-90" : ""
                                      }`}
                                      fill="none"
                                      aria-hidden="true"
                                    >
                                      <path
                                        d="m9 18 6-6-6-6"
                                        stroke="currentColor"
                                        strokeWidth="1.6"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                ) : (
                                  <Link
                                    href={`/products?categories=${encodeURIComponent(cat.slug)}`}
                                    onClick={closeMenu}
                                    className={`flex-1 px-2 py-3 text-base font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 ${
                                      isCatActive ? "text-[var(--foreground)]" : "text-[var(--foreground)]"
                                    }`}
                                  >
                                    <span className="lv-underline-item">{cat.name}</span>
                                  </Link>
                                )}
                              </div>
                              {hasChildren ? (
                                <div
                                  className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
                                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                  }`}
                                >
                                  <div className="min-h-0">
                                    <div className="flex flex-col border-l border-[var(--border)] ml-2 pl-2 pb-2">
                                      {cat.children.map((child) => {
                                        const childHasChildren =
                                          child.children && child.children.length > 0;
                                        const childExpanded = expandedParents.has(child.id);
                                        const isChildActive = selectedCategorySlugs.has(child.slug);
                                        return (
                                          <div key={child.id} className="flex flex-col">
                                            <div className="flex items-stretch">
                                              {childHasChildren ? (
                                                <button
                                                  type="button"
                                                  onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    toggleExpand(child.id);
                                                  }}
                                                  aria-expanded={childExpanded}
                                                  aria-label={
                                                    childExpanded
                                                      ? `Thu gọn ${child.name}`
                                                      : `Mở rộng ${child.name}`
                                                  }
                                                  className={`flex flex-1 items-center justify-between px-2 py-2 text-left text-sm font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 ${
                                                    isChildActive
                                                      ? "text-[var(--foreground)]"
                                                      : "text-[var(--foreground)]"
                                                  }`}
                                                >
                                                  <span className="lv-underline-item">
                                                    {child.name}
                                                  </span>
                                                  <svg
                                                    viewBox="0 0 24 24"
                                                    className={`ml-3 h-3.5 w-3.5 shrink-0 opacity-70 transition-transform duration-[850ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
                                                      childExpanded ? "rotate-90" : ""
                                                    }`}
                                                    fill="none"
                                                    aria-hidden="true"
                                                  >
                                                    <path
                                                      d="m9 18 6-6-6-6"
                                                      stroke="currentColor"
                                                      strokeWidth="1.6"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                    />
                                                  </svg>
                                                </button>
                                              ) : (
                                                <Link
                                                  href={`/products?categories=${encodeURIComponent(
                                                    child.slug,
                                                  )}`}
                                                  onClick={closeMenu}
                                                  className={`flex-1 px-2 py-2 text-sm font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 ${
                                                    isChildActive
                                                      ? "text-[var(--foreground)]"
                                                      : "text-[var(--foreground)]"
                                                  }`}
                                                >
                                                  <span className="lv-underline-item">
                                                    {child.name}
                                                  </span>
                                                </Link>
                                              )}
                                            </div>
                                            {childHasChildren ? (
                                              <div
                                                className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-[900ms] ease-[cubic-bezier(.22,.61,.36,1)] ${
                                                  childExpanded
                                                    ? "grid-rows-[1fr] opacity-100"
                                                    : "grid-rows-[0fr] opacity-0"
                                                }`}
                                              >
                                                <div className="min-h-0">
                                                  <div className="flex flex-col border-l border-[var(--border)] ml-3 pl-2 pb-1">
                                                    {child.children.map((grandChild) => {
                                                      const isGrandActive =
                                                        selectedCategorySlugs.has(grandChild.slug);
                                                      return (
                                                        <Link
                                                          key={grandChild.id}
                                                          href={`/products?categories=${encodeURIComponent(
                                                            grandChild.slug,
                                                          )}`}
                                                          onClick={closeMenu}
                                                          className={`px-2 py-1.5 text-xs font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 ${
                                                            isGrandActive
                                                              ? "text-[var(--foreground)]"
                                                              : "text-[var(--foreground)]"
                                                          }`}
                                                        >
                                                          <span className="lv-underline-item">
                                                            {grandChild.name}
                                                          </span>
                                                        </Link>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div
                      className={`relative min-h-0 w-full overflow-hidden px-4 py-4 transition-[width,opacity,min-width] duration-[850ms] ease-[cubic-bezier(.22,.61,.36,1)] sm:px-6 lg:px-6 lg:py-5 ${
                        categoriesPhase >= 2
                          ? "opacity-100 lg:min-w-0"
                          : "pointer-events-none opacity-0 lg:w-0 lg:min-w-0 lg:px-0 lg:py-0"
                      }`}
                    >
                      <div
                        className="mx-auto grid h-full w-full grid-cols-3 gap-3 lg:grid-rows-3 lg:grid-cols-1 lg:gap-3 lg:max-w-[calc((100vh-260px)/3)]"
                        style={{
                          height: "100%",
                          minHeight: 0,
                        }}
                      >
                        {featuredCategoryProducts.length > 0
                          ? featuredCategoryProducts.map((fp, idx) => (
                              <Link
                                key={`${fp.categoryId}-${fp.productId}`}
                                href={`/products/${fp.productId}`}
                                onClick={closeMenu}
                                className="group flex min-h-0 flex-col gap-1.5 transition-all duration-900 ease-[cubic-bezier(.22,.61,.36,1)]"
                                style={{
                                  transitionDelay:
                                    categoriesPhase >= 3 ? `${200 + idx * 200}ms` : "0ms",
                                  transform:
                                    categoriesPhase >= 3
                                      ? "translateY(0) scale(1)"
                                      : "translateY(40px) scale(0.96)",
                                  opacity: categoriesPhase >= 3 ? 1 : 0,
                                }}
                              >
                                <div
                                  className="relative w-full overflow-hidden border border-[var(--border)] bg-[var(--surface-muted)]"
                                  style={{
                                    height: "auto",
                                    maxHeight:
                                      typeof window === "undefined"
                                        ? "240px"
                                        : "calc((100vh - 260px) / 3)",
                                    flexShrink: 1,
                                    minHeight: 0,
                                    aspectRatio: "1 / 1",
                                  }}
                                >
                                  {fp.productImageUrl ? (
                                    <Image
                                      src={fp.productImageUrl}
                                      alt={fp.productName}
                                      fill
                                      sizes="(max-width: 1024px) 30vw, calc((100vh - 260px) / 3)"
                                      className="object-contain transition-all duration-900 ease-[cubic-bezier(.22,.61,.36,1)] group-hover:scale-[1.03]"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                                      <svg
                                        viewBox="0 0 24 24"
                                        className="h-8 w-8 opacity-50"
                                        fill="none"
                                        aria-hidden="true"
                                      >
                                        <rect
                                          x="3"
                                          y="4"
                                          width="18"
                                          height="16"
                                          stroke="currentColor"
                                          strokeWidth="1.2"
                                        />
                                        <circle
                                          cx="9"
                                          cy="10"
                                          r="1.5"
                                          stroke="currentColor"
                                          strokeWidth="1.2"
                                        />
                                        <path
                                          d="m4 18 5-5 3 3 4-4 4 4"
                                          stroke="currentColor"
                                          strokeWidth="1.2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <p className="line-clamp-1 text-xs font-normal tracking-[0.4px] text-[var(--foreground)]">
                                  {fp.productName}
                                </p>
                              </Link>
                            ))
                          : Array.from({ length: 3 }).map((_, idx) => (
                              <div
                                key={`placeholder-${idx}`}
                                className="flex min-h-0 flex-col gap-1.5"
                                style={{
                                  transitionDelay:
                                    categoriesPhase >= 3 ? `${200 + idx * 200}ms` : "0ms",
                                  transitionProperty: "transform, opacity",
                                  transitionDuration: "900ms",
                                  transitionTimingFunction:
                                    "cubic-bezier(0.22, 0.61, 0.36, 1)",
                                  transform:
                                    categoriesPhase >= 3
                                      ? "translateY(0) scale(1)"
                                      : "translateY(40px) scale(0.96)",
                                  opacity: categoriesPhase >= 3 ? 1 : 0,
                                }}
                              >
                                <div
                                  className="relative w-full border border-[var(--border)] bg-[var(--surface-muted)]"
                                  style={{
                                    maxHeight:
                                      typeof window === "undefined"
                                        ? "240px"
                                        : "calc((100vh - 260px) / 3)",
                                    aspectRatio: "1 / 1",
                                  }}
                                />
                                <p className="h-4 w-3/4 bg-[var(--surface-muted)]" />
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
