import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("q") ?? "").trim();
    const limitRaw = Number(searchParams.get("limit") ?? "8");
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 12) : 8;

    if (!query) {
      return NextResponse.json({ items: [] });
    }

    const likeValue = `%${query}%`;

    const items = await prisma.product.findMany({
      take: limit,
      where: {
        OR: [
          { name: { contains: likeValue, mode: "insensitive" } },
          { productCode: { contains: likeValue, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        productCode: true,
        name: true,
        imageUrl: true,
        price: true,
        discountPrice: true,
        isPromotion: true,
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ isPromotion: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      items: items.map((p) => ({
        id: p.id,
        productCode: p.productCode,
        name: p.name,
        imageUrl: p.imageUrl,
        categoryId: p.category?.id ?? null,
        categoryName: p.category?.name ?? null,
        categorySlug: p.category?.slug ?? null,
        price: p.price ? Number(p.price) : null,
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        isPromotion: p.isPromotion ?? false,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Không thể tìm kiếm sản phẩm", detail: message },
      { status: 500 }
    );
  }
}
