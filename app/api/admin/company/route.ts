import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { deleteProductImageByPath } from "@/lib/supabase-storage";

type HeroSlidePayload = {
  id?: number;
  imageUrl: string;
  storagePath?: string | null;
  sortOrder: number;
  heading?: string | null;
  subheading?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
};

function parseJsonField<T = unknown>(raw: FormDataEntryValue | null, fallback: T): T {
  if (!raw || typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }

  const isMultipart =
    request.headers.get("content-type")?.toLowerCase().includes("multipart/form-data") ?? false;

  let companyName = "";
  let aboutUs = "";
  let mission = "";
  let vision = "";
  let heroSlides: HeroSlidePayload[] = [];
  let removedSlideStoragePaths: string[] = [];

  if (isMultipart) {
    const formData = await request.formData();
    companyName = String(formData.get("companyName") ?? "").trim();
    aboutUs = String(formData.get("aboutUs") ?? "").trim();
    mission = String(formData.get("mission") ?? "").trim();
    vision = String(formData.get("vision") ?? "").trim();
    heroSlides = parseJsonField<HeroSlidePayload[]>(formData.get("heroSlides"), []);
    removedSlideStoragePaths = parseJsonField<string[]>(formData.get("removedSlideStoragePaths"), []);
  } else {
    const body = (await request.json().catch(() => null)) as
      | {
          companyName?: string;
          aboutUs?: string;
          mission?: string;
          vision?: string;
          heroSlides?: HeroSlidePayload[];
          removedSlideStoragePaths?: string[];
        }
      | null;
    companyName = body?.companyName?.trim() || "";
    aboutUs = body?.aboutUs?.trim() || "";
    mission = body?.mission?.trim() || "";
    vision = body?.vision?.trim() || "";
    heroSlides = Array.isArray(body?.heroSlides) ? body!.heroSlides : [];
    removedSlideStoragePaths = Array.isArray(body?.removedSlideStoragePaths)
      ? body!.removedSlideStoragePaths
      : [];
  }

  if (!companyName || !aboutUs || !mission || !vision) {
    return NextResponse.json(
      { success: false, message: "Vui lòng nhập đầy đủ thông tin doanh nghiệp." },
      { status: 400 },
    );
  }

  const normalizedSlides = (Array.isArray(heroSlides) ? heroSlides : [])
    .filter((slide) => !!slide?.imageUrl)
    .map((slide, idx) => ({
      imageUrl: slide.imageUrl,
      storagePath: slide.storagePath ?? null,
      sortOrder: Number.isFinite(slide.sortOrder) ? Number(slide.sortOrder) : idx,
      heading: slide.heading?.trim() || null,
      subheading: slide.subheading?.trim() || null,
      ctaText: slide.ctaText?.trim() || null,
      ctaLink: slide.ctaLink?.trim() || null,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((slide, idx) => ({ ...slide, sortOrder: idx }));

  const existing = await prisma.companyInfo.findUnique({
    where: { id: 1 },
  });

  const currentSlides = await prisma.heroSlide.findMany({
    where: { companyInfoId: 1 },
    select: { id: true, storagePath: true },
  });

  const storagePathsToRemove = new Set<string>();
  const removedPathsFromClient = removedSlideStoragePaths.filter(
    (p): p is string => typeof p === "string" && !!p,
  );
  for (const p of removedPathsFromClient) storagePathsToRemove.add(p);
  for (const slide of currentSlides) {
    if (slide.storagePath) {
      const stillUsed = normalizedSlides.some(
        (incoming) => incoming.storagePath === slide.storagePath,
      );
      if (!stillUsed) storagePathsToRemove.add(slide.storagePath);
    }
  }

  await prisma.$transaction([
    prisma.companyInfo.upsert({
      where: { id: 1 },
      update: {
        companyName,
        aboutUs,
        mission,
        vision,
      },
      create: {
        id: 1,
        companyName,
        aboutUs,
        mission,
        vision,
        phone: existing?.phone || "Đang cập nhật",
        email: existing?.email || "contact@example.com",
        zaloLink: existing?.zaloLink || null,
        address: existing?.address || "Đang cập nhật",
      },
    }),
    prisma.heroSlide.deleteMany({ where: { companyInfoId: 1 } }),
    ...(normalizedSlides.length > 0
      ? [
          prisma.heroSlide.createMany({
            data: normalizedSlides.map((slide) => ({
              ...slide,
              companyInfoId: 1,
            })),
          }),
        ]
      : []),
  ]);

  try {
    await Promise.all(
      Array.from(storagePathsToRemove).map((path) => deleteProductImageByPath(path)),
    );
  } catch (error) {
    console.warn("Không thể xóa một số ảnh hero cũ trên Supabase:", error);
  }

  return NextResponse.json({
    success: true,
    message: "Đã cập nhật thông tin doanh nghiệp và ảnh carousel.",
  });
}

