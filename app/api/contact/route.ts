import { NextResponse } from "next/server";

import {
  type ContactApiResponse,
  type ContactFormValues,
  normalizeContactForm,
  validateContactForm,
} from "@/lib/contact";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  let body: ContactFormValues;

  try {
    body = (await request.json()) as ContactFormValues;
  } catch {
    return NextResponse.json<ContactApiResponse>(
      {
        success: false,
        message: "Dữ liệu gửi lên không hợp lệ.",
      },
      { status: 400 },
    );
  }

  const normalizedBody = normalizeContactForm(body);
  const errors = validateContactForm(normalizedBody);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json<ContactApiResponse>(
      {
        success: false,
        message: "Vui lòng kiểm tra lại thông tin biểu mẫu.",
        errors,
      },
      { status: 400 },
    );
  }

  try {
    const inquiry = await prisma.contactInquiry.create({
      data: {
        fullName: normalizedBody.fullName,
        phone: normalizedBody.phone,
        email: normalizedBody.email,
        productInterest: normalizedBody.productInterest || null,
        message: normalizedBody.message,
      },
    });

    return NextResponse.json<ContactApiResponse>(
      {
        success: true,
        message: "Đã gửi yêu cầu tư vấn thành công.",
        inquiryId: inquiry.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Không thể lưu yêu cầu liên hệ:", error);

    return NextResponse.json<ContactApiResponse>(
      {
        success: false,
        message: "Không thể gửi yêu cầu lúc này. Vui lòng thử lại sau.",
      },
      { status: 500 },
    );
  }
}
