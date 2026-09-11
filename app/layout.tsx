import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { FloatingContactButton } from "@/components/layout/floating-contact-button";
import { SiteHeader } from "@/components/layout/site-header";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Digital Catalogue",
  description: "Catalogue điện tử cho vật liệu xây dựng và thiết bị vệ sinh.",
};

export const dynamic = "force-dynamic";

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  let companyInfo: Awaited<ReturnType<typeof prisma.companyInfo.findUnique>> | null = null;

  try {
    companyInfo = await prisma.companyInfo.findUnique({
      where: { id: 1 },
    });
  } catch (error) {
    console.error("Failed to load company info for layout:", error);
  }

  return (
    <html lang="vi">
      <body>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <SiteHeader />
          <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
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
