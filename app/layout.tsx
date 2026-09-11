import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { FloatingContactButton } from "@/components/layout/floating-contact-button";
import { SiteHeader } from "@/components/layout/site-header";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Tuấn Sơn Materials",
  description: "Catalogue điện tử cho vật liệu xây dựng, gạch men, ngói và thiết bị vệ sinh.",
};

export const dynamic = "force-dynamic";

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  let companyInfo: Awaited<ReturnType<typeof prisma.companyInfo.findUnique>> | null = null;
  let session: Awaited<ReturnType<typeof getAdminSession>> | null = null;

  try {
    [companyInfo, session] = await Promise.all([
      prisma.companyInfo.findUnique({
        where: { id: 1 },
      }),
      getAdminSession(),
    ]);
  } catch (error) {
    console.error("Failed to load layout data:", error);
  }

  return (
    <html lang="vi">
      <body className="antialiased">
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
          <SiteHeader companyName={companyInfo?.companyName} session={session} />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
          <FloatingContactButton
            phone={companyInfo?.phone}
            email={companyInfo?.email}
            zaloLink={companyInfo?.zaloLink}
          />
        </div>
      </body>
    </html>
  );
}
