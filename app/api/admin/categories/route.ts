import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { parseUnitLabels } from "@/lib/product-pricing";
import { slugify } from "@/lib/string";

type CategoryPayload = {
  name?: string;
  slug?: string;
  units?: string[];
  defaultUnit?: string;
  parentId?: number | string | null;
  sortOrder?: number | string;
};

export async function POST(request: Request) {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        message: "Bạn không có quyền thực hiện thao tác này.",
      },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as CategoryPayload | null;
  const name = body?.name?.trim() || "";
  const slug = slugify(body?.slug?.trim() || name);
  const units = parseUnitLabels(Array.isArray(body?.units) ? body!.units.join("\n") : "");
  const defaultUnit = body?.defaultUnit?.trim() || units[0] || "";
  const parentIdRaw = body?.parentId;
  const parentId =
    parentIdRaw === null || parentIdRaw === undefined || parentIdRaw === ""
      ? null
      : Number(parentIdRaw);
  const sortOrderRaw = body?.sortOrder;
  const sortOrder =
    sortOrderRaw === undefined || sortOrderRaw === null || sortOrderRaw === ""
      ? 0
      : Number(sortOrderRaw);

  if (name.length < 2) {
    return NextResponse.json(
      {
        success: false,
        message: "Tên loại sản phẩm phải có ít nhất 2 ký tự.",
      },
      { status: 400 },
    );
  }

  if (!slug) {
    return NextResponse.json(
      {
        success: false,
        message: "Slug loại sản phẩm không hợp lệ.",
      },
      { status: 400 },
    );
  }

  if (units.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng khai báo ít nhất một đơn vị tính cho loại sản phẩm.",
      },
      { status: 400 },
    );
  }

  if (!units.includes(defaultUnit)) {
    return NextResponse.json(
      {
        success: false,
        message: "Đơn vị mặc định không hợp lệ.",
      },
      { status: 400 },
    );
  }

  if (parentId !== null && (!Number.isFinite(parentId) || parentId <= 0)) {
    return NextResponse.json(
      {
        success: false,
        message: "Nhóm sản phẩm cha không hợp lệ.",
      },
      { status: 400 },
    );
  }

  if (!Number.isFinite(sortOrder)) {
    return NextResponse.json(
      {
        success: false,
        message: "Thứ tự sắp xếp không hợp lệ.",
      },
      { status: 400 },
    );
  }

  try {
    if (parentId !== null) {
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
        select: { id: true },
      });
      if (!parentExists) {
        return NextResponse.json(
          {
            success: false,
            message: "Nhóm sản phẩm cha không tồn tại.",
          },
          { status: 400 },
        );
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        parentId,
        sortOrder,
        units: {
          create: units.map((unit, index) => ({
            label: unit,
            sortOrder: index,
            isDefault: unit === defaultUnit,
          })),
        },
      },
      include: {
        units: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        },
        parent: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đã tạo loại sản phẩm thành công.",
        category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Không thể tạo loại sản phẩm:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể tạo loại sản phẩm. Vui lòng kiểm tra slug có bị trùng không.",
      },
      { status: 500 },
    );
  }
}
