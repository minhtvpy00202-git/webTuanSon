import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

import { FloatingContactButton } from "@/components/layout/floating-contact-button";
import { SiteHeader } from "@/components/layout/site-header";
import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Vật liệu xây dựng Tuấn Sơn",
  description: "Catalogue điện tử Vật liệu xây dựng Tuấn Sơn - gạch men, ngói, thiết bị vệ sinh và vật liệu xây dựng chất lượng cao.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon.svg" }],
  },
};

export const dynamic = "force-dynamic";

type RootLayoutProps = {
  children: ReactNode;
};

type FeaturedCategoryProduct = {
    categoryId: number;
    categoryName: string;
    categorySlug: string;
    productId: number;
    productName: string;
    productImageUrl: string | null;
  };

export default async function RootLayout({ children }: RootLayoutProps) {
  let companyInfo: Awaited<ReturnType<typeof prisma.companyInfo.findUnique>> | null = null;
  let session: Awaited<ReturnType<typeof getAdminSession>> | null = null;
  let categories: Array<{ id: number; name: string; slug: string }> = [];
  let featuredCategoryProducts: FeaturedCategoryProduct[] = [];

  try {
    const [companyInfoResult, sessionResult, categoriesResult] = await Promise.all([
      prisma.companyInfo.findUnique({
        where: { id: 1 },
      }),
      getAdminSession(),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: [{ name: "asc" }, { id: "asc" }],
      }),
    ]);
    companyInfo = companyInfoResult;
    session = sessionResult;
    categories = categoriesResult;

    const shuffled = [...categories].sort(() => Math.random() - 0.5);
    const pickedCategories = shuffled.slice(0, Math.min(3, shuffled.length));
    const allProductsForPicked = await Promise.all(
      pickedCategories.map((cat) =>
        prisma.product.findMany({
          where: { categoryId: cat.id },
          select: { id: true, name: true, imageUrl: true },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 5,
        }),
      ),
    );
    const featuredRows = pickedCategories.map((cat, idx) => {
      const list = allProductsForPicked[idx] ?? [];
      const withImage = list.find((p) => Boolean(p.imageUrl));
      return { category: cat, product: withImage ?? list[0] ?? null };
    });
    featuredCategoryProducts = featuredRows
      .filter((fr): fr is { category: (typeof categories)[number]; product: NonNullable<(typeof featuredRows)[number]["product"]> } => Boolean(fr.product))
      .map((fr) => ({
        categoryId: fr.category.id,
        categoryName: fr.category.name,
        categorySlug: fr.category.slug,
        productId: fr.product.id,
        productName: fr.product.name,
        productImageUrl: fr.product.imageUrl,
      }));
    if (featuredCategoryProducts.length < 3) {
      const fallback = await Promise.all(
        pickedCategories.slice(featuredCategoryProducts.length).map(async (cat) => {
          const p = await prisma.product.findFirst({
            where: { categoryId: cat.id },
            select: { id: true, name: true, imageUrl: true },
            orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          });
          if (!p) return null;
          return {
            categoryId: cat.id,
            categoryName: cat.name,
            categorySlug: cat.slug,
            productId: p.id,
            productName: p.name,
            productImageUrl: p.imageUrl,
          };
        }),
      );
      for (const fb of fallback) {
        if (!fb) continue;
        if (featuredCategoryProducts.length >= 3) break;
        featuredCategoryProducts.push(fb);
      }
    }
  } catch (error) {
    console.error("Failed to load layout data:", error);
  }

  return (
    <html lang="vi">
      <body className="antialiased">
        <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-normal tracking-[0.4px]">
          <SiteHeader
            companyName={companyInfo?.companyName}
            session={session}
            categories={categories}
            featuredCategoryProducts={featuredCategoryProducts}
          />
          <main className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
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
