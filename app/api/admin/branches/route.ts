import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type BranchPayload = {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  mapsLink?: string;
  sortOrder?: number;
  isShowroom?: boolean;
};

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as BranchPayload | null;
  const name = body?.name?.trim() || "";
  const address = body?.address?.trim() || "";
  const phone = body?.phone?.trim() || null;
  const email = body?.email?.trim() || null;
  const mapsLink = body?.mapsLink?.trim() || null;
  const sortOrder = Number(body?.sortOrder ?? 0);
  const isShowroom = Boolean(body?.isShowroom);

  if (!name || !address) {
    return NextResponse.json(
      { success: false, message: "Vui lòng nhập tên chi nhánh và địa chỉ." },
      { status: 400 },
    );
  }

  await prisma.companyInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      companyName: "Doanh nghiệp đang cập nhật",
      aboutUs: "Nội dung giới thiệu đang được cập nhật.",
      mission: "Nội dung nhiệm vụ đang được cập nhật.",
      vision: "Nội dung sứ mệnh đang được cập nhật.",
      phone: "Đang cập nhật",
      email: "contact@example.com",
      zaloLink: null,
      address: "Đang cập nhật",
    },
  });

  await prisma.companyBranch.create({
    data: {
      companyInfoId: 1,
      name,
      address,
      phone,
      email,
      mapsLink,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      isShowroom,
    },
  });

  return NextResponse.json({
    success: true,
    message: "Đã thêm chi nhánh/showroom.",
  });
}
