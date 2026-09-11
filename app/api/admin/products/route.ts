import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { uploadProductImage } from "@/lib/supabase-storage";

type UnitPricePayload = {
  categoryUnitId: number;
  label?: string;
  price: string;
  discountPrice?: string;
};

function parseCurrency(value: string | null | undefined) {
  const raw = value?.trim() || "";

  if (!raw) {
    return null;
  }

  const normalized = raw.replace(/[^\d.,-]/g, "").replace(/,/g, "");
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}

function parseUnitPrices(rawValue: FormDataEntryValue | null) {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return [];
  }

  const parsed = JSON.parse(rawValue) as UnitPricePayload[];

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => ({
      categoryUnitId: Number(item.categoryUnitId),
      price: parseCurrency(item.price),
      discountPrice: parseCurrency(item.discountPrice),
    }))
    .filter((item) => Number.isFinite(item.categoryUnitId) && item.price !== null);
}

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

  const formData = await request.formData();
  const productCode = String(formData.get("productCode") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const specs = String(formData.get("specs") || "").trim();
  const categoryId = Number(String(formData.get("categoryId") || "").trim());
  const isPromotion = String(formData.get("isPromotion") || "") === "true";
  const imageFile = formData.get("image");

  if (!productCode || !name || !description || !categoryId) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng nhập đầy đủ mã sản phẩm, tên, mô tả và loại sản phẩm.",
      },
      { status: 400 },
    );
  }

  if (!(imageFile instanceof File) || imageFile.size === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng chọn ảnh sản phẩm để upload.",
      },
      { status: 400 },
    );
  }

  let unitPrices: ReturnType<typeof parseUnitPrices> = [];

  try {
    unitPrices = parseUnitPrices(formData.get("unitPrices"));
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Dữ liệu đơn giá theo đơn vị tính không hợp lệ.",
      },
      { status: 400 },
    );
  }

  if (unitPrices.length === 0) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng nhập ít nhất một đơn giá theo đơn vị tính.",
      },
      { status: 400 },
    );
  }

  if (
    unitPrices.some(
      (item) =>
        item.discountPrice !== null &&
        item.price !== null &&
        item.discountPrice > item.price,
    )
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Giá khuyến mãi không được lớn hơn giá gốc ở cùng đơn vị tính.",
      },
      { status: 400 },
    );
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        units: {
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy loại sản phẩm." },
        { status: 404 },
      );
    }

    if (!category.units.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Loại sản phẩm này chưa có đơn vị tính. Vui lòng cập nhật loại trước.",
        },
        { status: 400 },
      );
    }

    const allowedUnitIds = new Set(category.units.map((unit) => unit.id));

    if (unitPrices.some((item) => !allowedUnitIds.has(item.categoryUnitId))) {
      return NextResponse.json(
        {
          success: false,
          message: "Có đơn vị tính không thuộc loại sản phẩm đã chọn.",
        },
        { status: 400 },
      );
    }

    const primaryUnit =
      category.units.find((unit) => unit.isDefault) ??
      category.units.find((unit) =>
        unitPrices.some((item) => item.categoryUnitId === unit.id),
      ) ??
      category.units[0];

    const primaryUnitPrice =
      unitPrices.find((item) => item.categoryUnitId === primaryUnit.id) ?? unitPrices[0];

    const uploadedImage = await uploadProductImage(imageFile);

    const product = await prisma.product.create({
      data: {
        productCode,
        name,
        description,
        specs: specs || null,
        price: primaryUnitPrice.price!,
        discountPrice: primaryUnitPrice.discountPrice,
        isPromotion,
        imageUrl: uploadedImage.publicUrl,
        categoryId,
        unitPrices: {
          create: unitPrices.map((item) => ({
            categoryUnitId: item.categoryUnitId,
            price: item.price!,
            discountPrice: item.discountPrice,
          })),
        },
      },
      include: {
        category: true,
        unitPrices: {
          include: {
            categoryUnit: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Đã tạo sản phẩm thành công.",
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Không thể tạo sản phẩm:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể tạo sản phẩm lúc này. Vui lòng thử lại sau.",
      },
      { status: 500 },
    );
  }
}
