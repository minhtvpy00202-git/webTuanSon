import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getSupabaseStorageAdminClient } from "@/lib/supabase-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BUCKET = "Product";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "Bạn chưa đăng nhập với quyền quản trị." },
        { status: 401 },
      );
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    if (!Number.isFinite(id) || !Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "ID đơn hàng không hợp lệ." },
        { status: 400 },
      );
    }

    const order = await prisma.customerOrder.findUnique({
      where: { id },
      select: { id: true, pdfStoragePath: true },
    });
    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng này (đã bị xóa trước đó)." },
        { status: 404 },
      );
    }

    if (order.pdfStoragePath) {
      try {
        const storage = getSupabaseStorageAdminClient();
        await storage.storage.from(BUCKET).remove([order.pdfStoragePath]);
      } catch (err) {
        console.warn(
          `[admin/orders] Không xóa được file PDF ${order.pdfStoragePath} trên Supabase Storage:`,
          err,
        );
      }
    }

    await prisma.customerOrder.delete({ where: { id } });

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[admin/orders DELETE] Lỗi:", err);
    const msg =
      err instanceof Error ? err.message : "Lỗi hệ thống khi xóa đơn hàng.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
