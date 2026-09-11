import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import {
  createAdminSessionToken,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type LoginRequestBody = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as LoginRequestBody | null;

  if (!body?.username || !body?.password) {
    return NextResponse.json(
      {
        success: false,
        message: "Vui lòng nhập username và mật khẩu.",
      },
      { status: 400 },
    );
  }

  const username = body.username.trim();
  const password = body.password;

  const user = await prisma.user.findUnique({
    where: { username },
    include: { role: true },
  });

  if (!user || user.role.name !== "admin") {
    return NextResponse.json(
      {
        success: false,
        message: "Tài khoản không tồn tại hoặc không có quyền quản trị.",
      },
      { status: 401 },
    );
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    return NextResponse.json(
      {
        success: false,
        message: "Username hoặc mật khẩu không chính xác.",
      },
      { status: 401 },
    );
  }

  const token = await createAdminSessionToken({
    userId: user.id,
    username: user.username,
    role: user.role.name,
  });

  await setAdminSessionCookie(token);

  return NextResponse.json({
    success: true,
    message: "Đăng nhập thành công.",
  });
}
