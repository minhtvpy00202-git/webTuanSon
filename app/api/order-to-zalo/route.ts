import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { Prisma } from "@prisma/client";

import { getSupabaseStorageAdminClient } from "@/lib/supabase-storage";
import { prisma } from "@/lib/prisma";

function staticPdfkitDataPath(
  sub: "public-static" | "node_modules",
  fileName: string,
): string {
  const root = process.cwd();
  if (sub === "public-static") {
    return (
      root +
      (root.endsWith("/") || root.endsWith("\\") ? "" : path.sep) +
      "public" +
      path.sep +
      "static" +
      path.sep +
      "pdfkit-data" +
      path.sep +
      fileName
    );
  }
  return (
    root +
    (root.endsWith("/") || root.endsWith("\\") ? "" : path.sep) +
    "node_modules" +
    path.sep +
    "pdfkit" +
    path.sep +
    "js" +
    path.sep +
    "data" +
    path.sep +
    fileName
  );
}

const STATIC_PROBE = staticPdfkitDataPath(
  "public-static",
  "Helvetica.afm",
  /*turbopackIgnore: true*/
);
const PREFERRED_DIR: "public-static" | "node_modules" = fs.existsSync(
  STATIC_PROBE,
  /*turbopackIgnore: true*/
)
  ? "public-static"
  : "node_modules";

function dataFile(fileName: string): string {
  return staticPdfkitDataPath(PREFERRED_DIR, fileName);
}

function tryReadUtf8(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, "utf8", /*turbopackIgnore: true*/);
  } catch {
    return null;
  }
}
function tryReadBuffer(filePath: string): Buffer | null {
  try {
    return fs.readFileSync(filePath, /*turbopackIgnore: true*/);
  } catch {
    return null;
  }
}

const AFM_FILES = [
  "Courier.afm",
  "Courier-Bold.afm",
  "Courier-Oblique.afm",
  "Courier-BoldOblique.afm",
  "Helvetica.afm",
  "Helvetica-Bold.afm",
  "Helvetica-Oblique.afm",
  "Helvetica-BoldOblique.afm",
  "Times-Roman.afm",
  "Times-Bold.afm",
  "Times-Italic.afm",
  "Times-BoldItalic.afm",
  "Symbol.afm",
  "ZapfDingbats.afm",
] as const;

const STANDARD_FONT_DATA: Record<string, string> = {};
for (const name of AFM_FILES) {
  const content = tryReadUtf8(dataFile(name));
  if (content) STANDARD_FONT_DATA[name] = content;
}

const SRGB_ICC_BUF = tryReadBuffer(
  dataFile("sRGB_IEC61966_2_1.icc"),
  /*turbopackIgnore: true*/
);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fsNode = require("node:fs") as typeof import("node:fs");
const origReadFileSync = fsNode.readFileSync;
function patchedReadFileSync(
  this: any,
  pathArg: string | Buffer | URL,
  options?: any,
): any {
  if (typeof pathArg === "string") {
    const m = pathArg.match(/[\\/]([^\\/]+?\.(?:afm|icc))$/i);
    if (m) {
      const fn = m[1];
      if (fn.toLowerCase().endsWith(".afm")) {
        if (STANDARD_FONT_DATA[fn]) {
          const enc =
            (typeof options === "string" && options) ||
            (options && typeof options === "object" && (options as any).encoding) ||
            null;
          return enc === "utf8" || enc === "utf-8"
            ? STANDARD_FONT_DATA[fn]
            : Buffer.from(STANDARD_FONT_DATA[fn], "utf8");
        }
      } else if (fn.toLowerCase() === "srgb_iec61966_2_1.icc") {
        if (SRGB_ICC_BUF) return SRGB_ICC_BUF;
      }
    }
  }
  return origReadFileSync.apply(this, arguments as any);
}
(fsNode as any).readFileSync = patchedReadFileSync as any;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const PDFKit = require("pdfkit");
const PDFDocumentCtor: typeof import("pdfkit") =
  (PDFKit && (PDFKit as any).default) || PDFKit;
const PDFDocument = PDFDocumentCtor as any;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type OrderLinePayload = {
  productId?: number;
  productCode?: string;
  name?: string;
  quantity?: number;
  unitLabel?: string;
  unitPrice?: number;
  amount?: number;
};

type OrderToZaloPayload = {
  customerName?: string;
  customerPhone?: string;
  orderKind?: "cart" | "single" | string;
  note?: string;
  lines?: OrderLinePayload[];
  totalAmount?: number;
};

function formatCurrencyVN(n: number): string {
  const v = Number.isFinite(n) ? Math.round(n) : 0;
  return v.toLocaleString("vi-VN") + " ₫";
}

function validPhone(p: unknown): boolean {
  return typeof p === "string" && /^\s*(?:\+?84|0)\d{9,10}\s*$/.test(p);
}

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

function formatVnDateTime(d: Date): string {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`;
}

function dejavuFontFile(fileName: string): string {
  const root = process.cwd();
  return (
    root +
    (root.endsWith("/") || root.endsWith("\\") ? "" : path.sep) +
    "node_modules" +
    path.sep +
    "dejavu-fonts-ttf" +
    path.sep +
    "ttf" +
    path.sep +
    fileName
  );
}

const DEJAVU_REGULAR_BUF = tryReadBuffer(
  dejavuFontFile("DejaVuSans.ttf"),
  /*turbopackIgnore: true*/
);
const DEJAVU_BOLD_BUF = tryReadBuffer(
  dejavuFontFile("DejaVuSans-Bold.ttf"),
  /*turbopackIgnore: true*/
);
const HAS_DEJAVU = !!(DEJAVU_REGULAR_BUF && DEJAVU_BOLD_BUF);

function registerFonts(doc: any): { family: string; familyBold: string } {
  if (HAS_DEJAVU && DEJAVU_REGULAR_BUF && DEJAVU_BOLD_BUF) {
    doc.registerFont("DejaVuSans", DEJAVU_REGULAR_BUF);
    doc.registerFont("DejaVuSans-Bold", DEJAVU_BOLD_BUF);
    return { family: "DejaVuSans", familyBold: "DejaVuSans-Bold" };
  }
  return { family: "Helvetica", familyBold: "Helvetica-Bold" };
}

function buildZaloMessage(params: {
  customerName: string;
  customerPhone: string;
  companyName: string;
  lines: OrderLinePayload[];
  totalAmount: number;
  orderKind: string;
  note?: string;
  createdAt: Date;
  pdfUrl?: string;
}): string {
  const { customerName, customerPhone, companyName, lines, totalAmount, orderKind, note, createdAt, pdfUrl } =
    params;
  const head = `[Đơn hàng Zalo - ${companyName}]`;
  const meta: string[] = [];
  meta.push(`Thời gian: ${formatVnDateTime(createdAt)}`);
  meta.push(`Loại đơn: ${orderKind === "single" ? "Đặt nhanh 1 sản phẩm" : "Đặt từ giỏ hàng"}`);
  meta.push(`Khách hàng: ${customerName}`);
  meta.push(`SĐT liên hệ: ${customerPhone}`);

  const items: string[] = [];
  lines.forEach((l, idx) => {
    const qty = Number(l.quantity) || 0;
    const price = Number(l.unitPrice) || 0;
    const amount = Number(l.amount) || 0;
    const name = l.name || "(Tên sản phẩm)";
    const code = l.productCode ? `[${l.productCode}] ` : "";
    const unit = l.unitLabel ? ` ${l.unitLabel}` : "";
    items.push(
      `${idx + 1}. ${code}${name}\n   SL: ${qty}${unit}  Giá: ${formatCurrencyVN(
        price,
      )}  Thành tiền: ${formatCurrencyVN(amount)}`,
    );
  });

  const total = `Tổng tiền (tạm tính): ${formatCurrencyVN(totalAmount)}`;
  const noteLine = note ? `Ghi chú: ${note}` : null;
  const pdfLine = pdfUrl ? `PDF đơn hàng: ${pdfUrl}` : null;
  const footer =
    "---\nĐây là đơn tự động gửi từ website. Vui lòng xác nhận lại giá, số lượng và phí vận chuyển trước khi giao hàng. Cảm ơn quý khách!";

  return [head, meta.join("\n"), "---", "Danh sách sản phẩm:", items.join("\n"), "---", total, pdfLine, noteLine, footer]
    .filter((x): x is string => Boolean(x))
    .join("\n");
}

function collectPdfBuffer(doc: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

async function generateOrderPdf(params: {
  companyName: string;
  companyPhone?: string;
  companyAddress?: string;
  customerName: string;
  customerPhone: string;
  lines: OrderLinePayload[];
  totalAmount: number;
  orderKind: string;
  note?: string;
  createdAt: Date;
}): Promise<Buffer> {
  const {
    companyName,
    companyPhone,
    companyAddress,
    customerName,
    customerPhone,
    lines,
    totalAmount,
    orderKind,
    note,
    createdAt,
  } = params;

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    info: {
      Title: "Đơn đặt hàng - " + customerName,
      Author: companyName,
      Producer: "Web Tuấn Sơn",
      Creator: "Web Tuấn Sơn",
      CreationDate: createdAt,
    },
  });

  const fonts = registerFonts(doc);
  doc.font(fonts.family);

  const PAGE_LEFT = 40;
  const PAGE_RIGHT = doc.page.width - 40;
  const CONTENT_W = PAGE_RIGHT - PAGE_LEFT;

  function heading(txt: string, opts?: { size?: number; color?: string }) {
    doc
      .fillColor(opts?.color ?? "#111827")
      .font(fonts.familyBold)
      .fontSize(opts?.size ?? 18)
      .text(txt, { align: "left", lineGap: 2 });
  }
  function sub(txt: string) {
    doc
      .fillColor("#4b5563")
      .font(fonts.family)
      .fontSize(9.5)
      .text(txt, { align: "left", lineGap: 2 });
  }
  function labelValue(label: string, value: string, opts?: { newline?: boolean }) {
    doc
      .fillColor("#111827")
      .font(fonts.family)
      .fontSize(10.5)
      .text("", { continued: false });
    doc.font(fonts.familyBold).text(label + ": ", {
      continued: true,
      lineGap: 2,
    });
    doc
      .font(fonts.family)
      .fillColor("#1f2937")
      .text(value, { continued: false });
    if (opts?.newline) doc.moveDown(0.25);
  }

  // Header: Company + tiêu đề đơn
  const topY = doc.y;
  heading(companyName, { size: 16, color: "#0f172a" });
  doc.moveUp(1.35);
  doc.fillColor("#F27025").font(fonts.familyBold).fontSize(13).text(
    "ĐƠN ĐẶT HÀNG ONLINE",
    PAGE_LEFT,
    topY,
    { align: "right", width: CONTENT_W, lineGap: 4 },
  );
  doc.moveDown(0.2);
  doc.moveTo(PAGE_LEFT, doc.y).lineWidth(1).strokeColor("#e5e7eb").lineTo(PAGE_RIGHT, doc.y).stroke();
  doc.moveDown(0.3);

  sub(
    [
      "Tạo lúc: " + formatVnDateTime(createdAt),
      "Loại đơn: " + (orderKind === "single" ? "Đặt nhanh 1 sản phẩm" : "Đặt từ giỏ hàng"),
    ].join("   |   "),
  );
  doc.moveDown(0.7);

  heading("THÔNG TIN LIÊN HỆ", { size: 12, color: "#0f172a" });
  doc.moveDown(0.15);
  labelValue("Họ tên KH", customerName, { newline: true });
  labelValue("Số điện thoại", customerPhone, { newline: true });
  if (companyPhone) labelValue("Cửa hàng SĐT", companyPhone, { newline: true });
  if (companyAddress) labelValue("Cửa hàng ĐC", companyAddress, { newline: true });
  if (note) labelValue("Ghi chú", note, { newline: true });
  doc.moveDown(0.6);

  // Items table (simple lines, no grid)
  heading("DANH SÁCH SẢN PHẨM", { size: 12, color: "#0f172a" });
  doc.moveDown(0.25);

  const COL = {
    stt: PAGE_LEFT,
    name: PAGE_LEFT + 28,
    qty: PAGE_RIGHT - 270,
    price: PAGE_RIGHT - 170,
    amount: PAGE_RIGHT - 105,
  };

  // Header row
  const headerY = doc.y;
  doc
    .fillColor("#ffffff")
    .rect(PAGE_LEFT, headerY - 2, CONTENT_W, 22)
    .fill("#F27025");
  doc
    .fillColor("#ffffff")
    .font(fonts.familyBold)
    .fontSize(11);
  doc.text("STT", COL.stt, headerY + 5, { width: 28, align: "center" });
  doc.text("Tên sản phẩm / Mã", COL.name, headerY + 5, {
    width: COL.qty - COL.name - 10,
    align: "left",
  });
  doc.text("SL/ĐV", COL.qty, headerY + 5, {
    width: COL.price - COL.qty - 10,
    align: "left",
  });
  doc.text("Đơn giá", COL.price, headerY + 5, {
    width: COL.amount - COL.price - 10,
    align: "right",
  });
  doc.text("Thành tiền", COL.amount, headerY + 5, {
    width: PAGE_RIGHT - COL.amount,
    align: "right",
  });
  doc.y = headerY + 26;
  doc.fillColor("#111827");

  lines.forEach((l, idx) => {
    if (doc.y > doc.page.height - 160) {
      doc.addPage();
    }
    const rowY = doc.y;
    const qty = Number(l.quantity) || 0;
    const unitPrice = Number(l.unitPrice) || 0;
    const amount = Number(l.amount) || 0;
    const unit = l.unitLabel ? "/" + l.unitLabel : "";
    const nameTxt = l.name || "(Tên sản phẩm)";
    const codeTxt = l.productCode ? "Mã: " + l.productCode : "";

    doc.font(fonts.family).fontSize(11).fillColor("#374151");
    doc.text(String(idx + 1), COL.stt, rowY + 2, { width: 28, align: "center" });

    const nameColX = COL.name;
    const nameColW = COL.qty - COL.name - 10;
    doc.fillColor("#0f172a").font(fonts.familyBold).fontSize(11);
    doc.text(nameTxt, nameColX, rowY + 2, { width: nameColW, align: "left" });
    const afterNameY = doc.y;
    if (codeTxt) {
      doc.fillColor("#6b7280").font(fonts.family).fontSize(9.5);
      doc.text(codeTxt, nameColX, afterNameY, { width: nameColW, align: "left" });
    }

    doc
      .fillColor("#111827")
      .font(fonts.family)
      .fontSize(11)
      .text(qty.toLocaleString("vi-VN") + unit, COL.qty, rowY + 2, {
        width: COL.price - COL.qty - 10,
        align: "left",
      });
    doc.text(formatCurrencyVN(unitPrice), COL.price, rowY + 2, {
      width: COL.amount - COL.price - 10,
      align: "right",
    });
    doc
      .fillColor("#F27025")
      .font(fonts.familyBold)
      .fontSize(11.5)
      .text(formatCurrencyVN(amount), COL.amount, rowY + 2, {
        width: PAGE_RIGHT - COL.amount,
        align: "right",
      });

    const maxY = Math.max(doc.y, rowY + 16);
    doc.y = maxY + 4;
    doc.strokeColor("#f3f4f6").moveTo(PAGE_LEFT, doc.y).lineWidth(0.5).lineTo(PAGE_RIGHT, doc.y).stroke();
    doc.y += 2;
  });

  doc.moveDown(0.6);

  // Total box
  const totalW = Math.min(320, CONTENT_W);
  const totalX = PAGE_RIGHT - totalW;
  const totalBoxY = doc.y;
  doc
    .strokeColor("#F27025")
    .lineWidth(1)
    .rect(totalX, totalBoxY - 4, totalW, 58)
    .stroke();
  doc
    .fillColor("#F97316")
    .opacity(0.08)
    .rect(totalX + 1, totalBoxY - 3, totalW - 2, 56)
    .fill()
    .opacity(1);

  doc
    .fillColor("#374151")
    .font(fonts.family)
    .fontSize(11)
    .text("Tổng tạm tính (chưa VAT & phí vận chuyển):", totalX + 14, totalBoxY + 10, {
      width: totalW - 28,
      align: "left",
    });
  doc
    .fillColor("#F27025")
    .font(fonts.familyBold)
    .fontSize(17)
    .text(formatCurrencyVN(totalAmount), totalX + 14, totalBoxY + 30, {
      width: totalW - 28,
      align: "right",
    });
  doc.y = totalBoxY + 62;

  doc.moveDown(0.5);
  doc
    .fillColor("#4b5563")
    .font(fonts.family)
    .fontSize(9.5)
    .text(
      "Đây là đơn tự động gửi từ website. Cửa hàng sẽ liên hệ lại để xác nhận đơn hàng, giá cả và thời gian giao nhận hàng.",
      { align: "left", lineGap: 3 },
    );

  doc.end();
  return collectPdfBuffer(doc);
}

export async function POST(req: Request) {
  try {
    let body: OrderToZaloPayload;
    try {
      body = (await req.json()) as OrderToZaloPayload;
    } catch {
      return NextResponse.json({ error: "Body không hợp lệ (JSON)." }, { status: 400 });
    }

    const customerName = body.customerName?.trim() ?? "";
    const customerPhone = body.customerPhone?.trim() ?? "";
    const orderKind = body.orderKind === "single" ? "single" : "cart";
    const note = body.note?.trim() || undefined;
    const rawLines = Array.isArray(body.lines) ? body.lines : [];

    if (customerName.length < 2) {
      return NextResponse.json({ error: "Vui lòng nhập họ tên (≥ 2 ký tự)." }, { status: 400 });
    }
    if (!validPhone(customerPhone)) {
      return NextResponse.json(
        { error: "Vui lòng nhập số điện thoại hợp lệ (10-11 ký tự, 0 hoặc +84)." },
        { status: 400 },
      );
    }
    if (rawLines.length === 0) {
      return NextResponse.json({ error: "Đơn hàng chưa có sản phẩm nào." }, { status: 400 });
    }

    const lines: OrderLinePayload[] = rawLines.map((l) => {
      const qty = Math.max(1, Math.round(Number(l.quantity) || 0) || 1);
      const unitPrice = Number(l.unitPrice) || 0;
      const amount =
        Number.isFinite(Number(l.amount)) && Number(l.amount)! > 0
          ? Math.round(Number(l.amount)!)
          : unitPrice * qty;
      return {
        productId: l.productId ? Number(l.productId) : undefined,
        productCode: l.productCode?.toString().trim() || "",
        name: l.name?.toString().trim() || "(Sản phẩm)",
        quantity: qty,
        unitLabel: l.unitLabel?.toString().trim() || "",
        unitPrice: unitPrice,
        amount,
      };
    });

    const totalAmount =
      Number.isFinite(Number(body.totalAmount)) && Number(body.totalAmount)! > 0
        ? Math.round(Number(body.totalAmount)!)
        : lines.reduce((s, l) => s + (Number(l.amount) || 0), 0);

    const companyInfo = await prisma.companyInfo.findUnique({
      where: { id: 1 },
      select: {
        companyName: true,
        phone: true,
        address: true,
        zaloLink: true,
      },
    });

    const companyName = companyInfo?.companyName || "Cửa hàng Tuấn Sơn";
    const companyPhone = companyInfo?.phone || undefined;
    const companyAddress = companyInfo?.address || undefined;
    let zaloLink = companyInfo?.zaloLink?.trim() || "";
    if (zaloLink && !/^https?:\/\//i.test(zaloLink)) {
      zaloLink = "https://" + zaloLink.replace(/^\/\//, "");
    }

    const createdAt = new Date();
    let publicPdfUrl = "";
    try {
      const pdfBuffer = await generateOrderPdf({
        companyName,
        companyPhone,
        companyAddress,
        customerName,
        customerPhone,
        lines,
        totalAmount,
        orderKind,
        note,
        createdAt,
      });
      const fileName =
        "don-" +
        createdAt.toISOString().replace(/[:.]/g, "-") +
        "-" +
        Math.random().toString(36).slice(2, 8) +
        ".pdf";
      const objectPath = `orders/${fileName}`;
      const storage = getSupabaseStorageAdminClient();
      const { error } = await storage.storage.from("Product").upload(objectPath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });
      if (error) throw new Error("Upload PDF thất bại: " + error.message);
      const { data } = storage.storage.from("Product").getPublicUrl(objectPath);
      publicPdfUrl = data.publicUrl;

      try {
        await prisma.customerOrder.create({
          data: {
            customerName,
            customerPhone,
            orderKind,
            note,
            totalAmount: String(totalAmount),
            pdfPublicUrl: publicPdfUrl,
            pdfStoragePath: objectPath,
            linesRaw: lines as unknown as Prisma.InputJsonValue,
          },
        });
      } catch (err) {
        console.error("[order-to-zalo] Lưu DB customer_orders failed:", err);
      }
    } catch (err) {
      console.error("[order-to-zalo] PDF/upload failed:", err);
      return NextResponse.json(
        {
          error:
            "Hệ thống không thể tạo file PDF đơn hàng. Vui lòng thử lại sau (" +
            (err instanceof Error ? err.message : "") +
            ").",
        },
        { status: 500 },
      );
    }

    const zaloMessage = buildZaloMessage({
      customerName,
      customerPhone,
      companyName,
      lines,
      totalAmount,
      orderKind,
      note,
      createdAt,
      pdfUrl: publicPdfUrl,
    });

    return NextResponse.json({
      ok: true as const,
      publicPdfUrl,
      zaloLink: zaloLink || "",
      zaloMessage,
      createdAt: createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[order-to-zalo] Unhandled error:", err);
    return NextResponse.json(
      {
        error: "Có lỗi hệ thống khi gửi đơn. Vui lòng thử lại sau.",
      },
      { status: 500 },
    );
  }
}
