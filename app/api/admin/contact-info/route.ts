import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type ContactInfoPayload = {
  phone?: string;
  email?: string;
  zaloLink?: string;
  address?: string;
};

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as ContactInfoPayload | null;
  const phone = body?.phone?.trim() || "";
  const email = body?.email?.trim() || "";
  const zaloLink = body?.zaloLink?.trim() || null;
  const address = body?.address?.trim() || "";

  if (!phone || !email || !address) {
    return NextResponse.json(
      { success: false, message: "Vui lòng nhập đầy đủ thông tin liên hệ chính." },
      { status: 400 },
    );
  }

  const existing = await prisma.companyInfo.findUnique({
    where: { id: 1 },
  });

  await prisma.companyInfo.upsert({
    where: { id: 1 },
    update: {
      phone,
      email,
      zaloLink,
      address,
    },
    create: {
      id: 1,
      companyName: existing?.companyName || "Doanh nghiệp đang cập nhật",
      aboutUs: existing?.aboutUs || "Nội dung giới thiệu đang được cập nhật.",
      mission: existing?.mission || "Nội dung nhiệm vụ đang được cập nhật.",
      vision: existing?.vision || "Nội dung sứ mệnh đang được cập nhật.",
      phone,
      email,
      zaloLink,
      address,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Đã cập nhật thông tin liên hệ.",
  });
}
