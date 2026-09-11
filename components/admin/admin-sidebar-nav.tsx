"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoTS from "@/components/logo/LogoTS";

type NavItem = {
  href: string;
  label: string;
};

type AdminSidebarNavProps = {
  items: NavItem[];
};

export function AdminSidebarNav({ items }: AdminSidebarNavProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="flex flex-col gap-2">
      <div className="mb-6 flex flex-col items-center gap-2 border-b border-[var(--border)] pb-5">
        <LogoTS className="h-10 w-auto text-[var(--foreground)]" />
        <p className="text-xs font-normal tracking-[0.4px] text-[var(--muted)] text-center">Quản trị nội dung</p>
      </div>
      {items.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-3 text-sm font-normal transition-all duration-200 ease-in-out tracking-[0.4px] ${
              active
                ? "border border-[var(--foreground)] bg-[var(--surface-muted)] text-[var(--foreground)]"
                : "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:opacity-70"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
