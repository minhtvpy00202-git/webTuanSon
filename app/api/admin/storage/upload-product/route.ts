import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import {
  deleteProductImageByPath,
  uploadProductImages,
} from "@/lib/supabase-storage";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files");
    const validFiles: File[] = files.filter(
      (entry): entry is File => entry instanceof File && entry.size > 0,
    );

    if (validFiles.length === 0) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy tệp ảnh để upload." },
        { status: 400 },
      );
    }

    const uploaded = await uploadProductImages(validFiles);
    return NextResponse.json({
      success: true,
      message: `Đã upload ${uploaded.length} ảnh thành công.`,
      images: uploaded.map((item) => ({ path: item.path, publicUrl: item.publicUrl })),
    });
  } catch (error) {
    console.error("Upload ảnh sản phẩm lỗi:", error);
    const message = error instanceof Error ? error.message : "Không thể upload ảnh lúc này.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}
