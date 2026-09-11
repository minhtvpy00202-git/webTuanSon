import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }

  const { id } = await context.params;
  const branchId = Number(id);

  if (!Number.isFinite(branchId)) {
    return NextResponse.json(
      { success: false, message: "Mã chi nhánh không hợp lệ." },
      { status: 400 },
    );
  }

  await prisma.companyBranch.delete({
    where: { id: branchId },
  });

  return NextResponse.json({
    success: true,
    message: "Đã xoá chi nhánh/showroom.",
  });
}
