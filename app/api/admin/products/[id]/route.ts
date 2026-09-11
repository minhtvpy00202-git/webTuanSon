import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { uploadProductImage } from "@/lib/supabase-storage";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type UnitPricePayload = {
  categoryUnitId: string | number;
  label?: string;
  price: string;
  discountPrice?: string;
};

type ParsedUnitPrice = {
  categoryUnitId: number | null;
  label: string;
  price: number | null;
  discountPrice: number | null;
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

function parseUnitPrices(rawValue: FormDataEntryValue | null): ParsedUnitPrice[] {
  if (typeof rawValue !== "string" || !rawValue.trim()) {
    return [];
  }

  const parsed = JSON.parse(rawValue) as UnitPricePayload[];

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((item) => {
      const numericId = Number(item.categoryUnitId);
      return {
        categoryUnitId: Number.isFinite(numericId) ? numericId : null,
        label: String(item.label ?? "").trim(),
        price: parseCurrency(item.price),
        discountPrice: parseCurrency(item.discountPrice),
      };
    })
    .filter((item) => item.price !== null);
}

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
  const productId = Number(id);

  if (!Number.isFinite(productId)) {
    return NextResponse.json(
      { success: false, message: "Mã sản phẩm không hợp lệ." },
      { status: 400 },
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

  let images: Array<{
    id?: number;
    imageUrl: string;
    storagePath?: string | null;
    isMain: boolean;
    sortOrder: number;
  }> = [];

  try {
    const rawImages = formData.get("images");
    if (typeof rawImages === "string" && rawImages.trim()) {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) {
        images = parsed.filter(
          (x) => x && typeof x.imageUrl === "string",
        );
      }
    }
  } catch {
    images = [];
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy sản phẩm." },
        { status: 404 },
      );
    }

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

    for (let i = 0; i < unitPrices.length; i++) {
      const item = unitPrices[i];

      if (item.categoryUnitId !== null && allowedUnitIds.has(item.categoryUnitId)) {
        continue;
      }

      if (!item.label) {
        return NextResponse.json(
          {
            success: false,
            message: "Có đơn vị tính tùy chỉnh thiếu tên.",
          },
          { status: 400 },
        );
      }

      let matchedUnit = category.units.find(
        (unit) => unit.label.toLowerCase() === item.label.toLowerCase(),
      );

      if (!matchedUnit) {
        matchedUnit = await prisma.categoryUnit.create({
          data: {
            categoryId,
            label: item.label,
            sortOrder: 9999,
            isDefault: false,
          },
        });
        category.units.push(matchedUnit);
        allowedUnitIds.add(matchedUnit.id);
      }

      unitPrices[i] = {
        ...item,
        categoryUnitId: matchedUnit.id,
      };
    }

    if (unitPrices.some((item) => item.categoryUnitId === null || !allowedUnitIds.has(item.categoryUnitId))) {
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

    let imageUrl = existingProduct.imageUrl;
    let fallbackStoragePath: string | null = null;

    if (imageFile instanceof File && imageFile.size > 0) {
      const uploadedImage = await uploadProductImage(imageFile);
      imageUrl = uploadedImage.publicUrl;
      fallbackStoragePath = uploadedImage.path;
    }

    if (images.length === 0 && imageUrl) {
      images = [
        {
          imageUrl,
          storagePath: fallbackStoragePath,
          isMain: true,
          sortOrder: 0,
        },
      ];
    }

    if (images.length && !images.some((x) => x.isMain)) {
      images[0].isMain = true;
    }

    const mainImage = images.length
      ? images.find((x) => x.isMain) ?? images[0]
      : null;
    const finalImageUrl = mainImage ? mainImage.imageUrl : imageUrl;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        productCode,
        name,
        description,
        specs: specs || null,
        price: primaryUnitPrice.price!,
        discountPrice: primaryUnitPrice.discountPrice,
        isPromotion,
        imageUrl: finalImageUrl,
        categoryId,
        unitPrices: {
          deleteMany: {},
          create: unitPrices.map((item) => ({
            categoryUnitId: item.categoryUnitId as number,
            price: item.price!,
            discountPrice: item.discountPrice,
          })),
        },
        images: images.length
          ? {
              deleteMany: {},
              create: images.map((img, idx) => ({
                imageUrl: img.imageUrl,
                storagePath: img.storagePath ?? null,
                isMain: !!img.isMain,
                sortOrder: Number.isFinite(img.sortOrder) ? img.sortOrder : idx,
              })),
            }
          : undefined,
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

    return NextResponse.json({
      success: true,
      message: "Đã cập nhật sản phẩm.",
      product,
    });
  } catch (error) {
    console.error("Không thể cập nhật sản phẩm:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật sản phẩm lúc này. Vui lòng thử lại sau.",
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
  const productId = Number(id);

  if (!Number.isFinite(productId)) {
    return NextResponse.json(
      { success: false, message: "Mã sản phẩm không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa sản phẩm.",
    });
  } catch (error) {
    console.error("Không thể xóa sản phẩm:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Không thể xóa sản phẩm lúc này. Vui lòng thử lại sau.",
      },
      { status: 500 },
    );
  }
}
