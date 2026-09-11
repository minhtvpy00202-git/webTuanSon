import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { parseUnitLabels } from "@/lib/product-pricing";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/string";

type CategoryPayload = {
  name?: string;
  slug?: string;
  units?: string[];
  defaultUnit?: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

async function requireAdmin() {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }

  return null;
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const categoryId = Number(id);
  const body = (await request.json().catch(() => null)) as CategoryPayload | null;
  const name = body?.name?.trim() || "";
  const slug = slugify(body?.slug?.trim() || name);
  const units = parseUnitLabels(Array.isArray(body?.units) ? body!.units.join("\n") : "");
  const defaultUnit = body?.defaultUnit?.trim() || units[0] || "";

  if (!Number.isFinite(categoryId)) {
    return NextResponse.json(
      { success: false, message: "Mã loại sản phẩm không hợp lệ." },
      { status: 400 },
    );
  }

  if (name.length < 2 || !slug) {
    return NextResponse.json(
      { success: false, message: "Vui lòng nhập tên và slug hợp lệ." },
      { status: 400 },
    );
  }

  if (units.length === 0) {
    return NextResponse.json(
      { success: false, message: "Vui lòng nhập ít nhất một đơn vị tính hợp lệ." },
      { status: 400 },
    );
  }

  if (!units.includes(defaultUnit)) {
    return NextResponse.json(
      { success: false, message: "Đơn vị mặc định không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const category = await prisma.$transaction(async (tx) => {
      const existingCategory = await tx.category.findUnique({
        where: { id: categoryId },
        include: {
          units: true,
        },
      });

      if (!existingCategory) {
        throw new Error("Không tìm thấy loại sản phẩm.");
      }

      const existingUnitsByLabel = new Map(
        existingCategory.units.map((unit) => [unit.label, unit]),
      );

      for (const [index, unitLabel] of units.entries()) {
        const existingUnit = existingUnitsByLabel.get(unitLabel);

        if (existingUnit) {
          await tx.categoryUnit.update({
            where: { id: existingUnit.id },
            data: {
              sortOrder: index,
              isDefault: unitLabel === defaultUnit,
            },
          });
        } else {
          await tx.categoryUnit.create({
            data: {
              categoryId,
              label: unitLabel,
              sortOrder: index,
              isDefault: unitLabel === defaultUnit,
            },
          });
        }
      }

      const removableUnitIds = existingCategory.units
        .filter((unit) => !units.includes(unit.label))
        .map((unit) => unit.id);

      if (removableUnitIds.length) {
        await tx.categoryUnit.deleteMany({
          where: {
            id: {
              in: removableUnitIds,
            },
          },
        });
      }

      return tx.category.update({
        where: { id: categoryId },
        data: { name, slug },
        include: {
          units: {
            orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật loại sản phẩm.",
      category,
    });
  } catch (error) {
    console.error("Không thể cập nhật loại sản phẩm:", error);

    if (error instanceof Error && error.message === "Không tìm thấy loại sản phẩm.") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Không thể cập nhật loại sản phẩm. Vui lòng kiểm tra slug có bị trùng không.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdmin();

  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  const categoryId = Number(id);

  if (!Number.isFinite(categoryId)) {
    return NextResponse.json(
      { success: false, message: "Mã loại sản phẩm không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa loại sản phẩm.",
    });
  } catch (error) {
    console.error("Không thể xóa loại sản phẩm:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể xóa loại sản phẩm đang được sử dụng bởi sản phẩm.",
      },
      { status: 500 },
    );
  }
}
