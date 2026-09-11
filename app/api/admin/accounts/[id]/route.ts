import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type UpdateAccountPayload = {
  username?: string;
  email?: string;
  password?: string;
  roleName?: string;
};

const ALLOWED_ROLES = new Set(["admin", "guest"]);

function parseId(param: unknown) {
  if (typeof param !== "string") return null;
  const id = Number(param);
  if (!Number.isFinite(id) || id <= 0) return null;
  return id;
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }
  const params = await ctx.params;
  const accountId = parseId(params.id);
  if (!accountId) {
    return NextResponse.json(
      { success: false, message: "ID tài khoản không hợp lệ." },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => null)) as UpdateAccountPayload | null;
  const usernameRaw = body?.username;
  const emailRaw = body?.email;
  const password = typeof body?.password === "string" ? body.password : "";
  const roleNameRaw = body?.roleName;

  if (usernameRaw !== undefined && !String(usernameRaw).trim()) {
    return NextResponse.json(
      { success: false, message: "Tên đăng nhập không được bỏ trống." },
      { status: 400 },
    );
  }
  if (emailRaw !== undefined && !String(emailRaw).trim()) {
    return NextResponse.json(
      { success: false, message: "Email không được bỏ trống." },
      { status: 400 },
    );
  }
  if (roleNameRaw && !ALLOWED_ROLES.has(String(roleNameRaw))) {
    return NextResponse.json(
      { success: false, message: "Quyền không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: accountId },
      include: { role: { select: { name: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Tài khoản không tồn tại." },
        { status: 404 },
      );
    }

    if (
      accountId === session.userId &&
      roleNameRaw &&
      String(roleNameRaw) !== "admin"
    ) {
      return NextResponse.json(
        { success: false, message: "Không thể tự hủy quyền admin của chính mình." },
        { status: 400 },
      );
    }

    const updateData: {
      username?: string;
      email?: string;
      passwordHash?: string;
      roleId?: number;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (usernameRaw !== undefined) updateData.username = String(usernameRaw).trim();
    if (emailRaw !== undefined) updateData.email = String(emailRaw).trim();
    if (password.trim()) updateData.passwordHash = await bcrypt.hash(password.trim(), 10);
    if (roleNameRaw) {
      const role = await prisma.role.upsert({
        where: { name: String(roleNameRaw) },
        update: {},
        create: { name: String(roleNameRaw) },
      });
      updateData.roleId = role.id;
    }

    const updated = await prisma.user.update({
      where: { id: accountId },
      data: updateData,
      include: { role: { select: { name: true } } },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật tài khoản thành công.",
      account: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        role: updated.role.name,
        createdAt: updated.createdAt.toISOString(),
        lastLoginAt: updated.lastLoginAt ? updated.lastLoginAt.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("Cập nhật tài khoản lỗi:", error);
    const message =
      error instanceof Error && /Unique constraint failed/.test(error.message)
        ? "Tên đăng nhập hoặc email đã tồn tại."
        : "Không thể cập nhật tài khoản lúc này.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Bạn không có quyền thực hiện thao tác này." },
      { status: 401 },
    );
  }
  const params = await ctx.params;
  const accountId = parseId(params.id);
  if (!accountId) {
    return NextResponse.json(
      { success: false, message: "ID tài khoản không hợp lệ." },
      { status: 400 },
    );
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: accountId },
      include: { role: { select: { name: true } } },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Tài khoản không tồn tại." },
        { status: 404 },
      );
    }
    if (existing.id === session.userId) {
      return NextResponse.json(
        { success: false, message: "Không thể xóa tài khoản đang đăng nhập." },
        { status: 400 },
      );
    }
    if (existing.role.name === "admin") {
      const adminCount = await prisma.user.count({
        where: { role: { name: "admin" }, id: { not: existing.id } },
      });
      if (adminCount === 0) {
        return NextResponse.json(
          { success: false, message: "Phải giữ lại ít nhất 1 tài khoản admin." },
          { status: 400 },
        );
      }
    }
    await prisma.user.delete({ where: { id: accountId } });
    return NextResponse.json({
      success: true,
      message: "Xóa tài khoản thành công.",
    });
  } catch (error) {
    console.error("Xóa tài khoản lỗi:", error);
    const message = error instanceof Error ? error.message : "Không thể xóa tài khoản lúc này.";
    return NextResponse.json(
      { success: false, message },
      { status: 500 },
    );
  }
}
