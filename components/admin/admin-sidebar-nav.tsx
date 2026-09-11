"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
      {items.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ease-in-out ${
              active
                ? "border-2 border-[#F27025] bg-[#fef0ea] text-[#F27025] shadow-sm dark:border-[#F27025] dark:bg-[#fef0ea] dark:text-[#F27025]"
                : "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-orange-300 hover:text-[var(--primary)] hover:shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
