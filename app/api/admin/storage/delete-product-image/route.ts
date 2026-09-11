import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { deleteProductImageByPath } from "@/lib/supabase-storage";

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
    const body = (await request.json().catch(() => null)) as
      | { paths?: string[] }
      | null;
    const rawPaths = Array.isArray(body?.paths) ? body!.paths : [];
    const paths = rawPaths.filter((p) => typeof p === "string" && !!p.trim());

    if (paths.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Không có đường dẫn ảnh nào cần xóa.",
      });
    }

    await Promise.all(paths.map((p) => deleteProductImageByPath(p)));

    return NextResponse.json({
      success: true,
      message: `Đã xóa ${paths.length} ảnh khỏi storage.`,
    });
  } catch (error) {
    console.error("Xóa ảnh sản phẩm lỗi:", error);
    const message = error instanceof Error ? error.message : "Không thể xóa ảnh lúc này.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}
