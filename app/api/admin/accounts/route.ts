import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AccountPayload = {
  username?: string;
  email?: string;
  password?: string;
  roleName?: string;
};

const ALLOWED_ROLES = new Set(["admin", "guest"]);

export async function GET() {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }

  try {
    const accounts = await prisma.user.findMany({
      include: { role: { select: { name: true } } },
      orderBy: [{ roleId: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json({
      success: true,
      accounts: accounts.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      })),
    });
  } catch (error) {
    console.error("Load danh sách tài khoản lỗi:", error);
    const message =
      error instanceof Error ? error.message : "Không thể tải danh sách tài khoản.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => null)) as AccountPayload | null;
  const username = String(body?.username ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const password = String(body?.password ?? "");
  const roleName = String(body?.roleName ?? "").trim() || "guest";

  if (!username || !email || !password) {
    return NextResponse.json(
      { success: false, message: "Vui lòng nhập đủ tên đăng nhập, email và mật khẩu." },
      { status: 400 },
    );
  }

  if (!ALLOWED_ROLES.has(roleName)) {
    return NextResponse.json(
      { success: false, message: "Quyền không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        roleId: role.id,
      },
      include: { role: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo tài khoản thành công.",
      account: {
        id: created.id,
        username: created.username,
        email: created.email,
        role: created.role.name,
        createdAt: created.createdAt.toISOString(),
        lastLoginAt: null,
      },
    });
  } catch (error) {
    console.error("Tạo tài khoản lỗi:", error);
    const message =
      error instanceof Error && /Unique constraint failed/.test(error.message)
        ? "Tên đăng nhập hoặc email đã tồn tại."
        : "Không thể tạo tài khoản lúc này.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}
