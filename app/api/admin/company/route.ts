import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type CompanyPayload = {
  companyName?: string;
  aboutUs?: string;
  mission?: string;
  vision?: string;
};

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as CompanyPayload | null;
  const companyName = body?.companyName?.trim() || "";
  const aboutUs = body?.aboutUs?.trim() || "";
  const mission = body?.mission?.trim() || "";
  const vision = body?.vision?.trim() || "";

  if (!companyName || !aboutUs || !mission || !vision) {
    return NextResponse.json(
      { success: false, message: "Vui lòng nhập đầy đủ thông tin doanh nghiệp." },
      { status: 400 },
    );
  }

  const existing = await prisma.companyInfo.findUnique({
    where: { id: 1 },
  });

  await prisma.companyInfo.upsert({
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
  });

  return NextResponse.json({
    success: true,
    message: "Đã cập nhật thông tin doanh nghiệp.",
  });
}
