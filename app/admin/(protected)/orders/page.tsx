import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function orderKindLabel(kind: string) {
  return kind === "single" ? "Đặt nhanh 1 sản phẩm" : "Đặt từ giỏ hàng";
}

function formatDateTime(iso: Date) {
  try {
    return iso.toLocaleString("vi-VN", { hour12: false });
  } catch {
    return String(iso);
  }
}

export default async function AdminOrdersPage() {
  const orders = await prisma.customerOrder.findMany({
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  return (
    <div className="space-y-5">
      <div className="mhv-card flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-normal tracking-[0.4px] text-[var(--foreground)]">
            Quản lý đơn đặt hàng
          </h2>
          <p className="text-sm leading-6 text-[var(--muted)] tracking-[0.4px]">
            Danh sách đơn hàng khách gửi qua Zalo từ website.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm tracking-[0.4px] text-[var(--muted)]">
          <span className="inline-flex h-9 items-center border border-[var(--border)] bg-[var(--card)] px-3">
            Tổng đơn: <strong className="ml-1.5 font-normal text-[var(--foreground)]">{orders.length}</strong>
          </span>
        </div>
      </div>

      <div className="mhv-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)]">
            <thead className="bg-[var(--surface-muted)]">
              <tr>
                {[
                  "STT",
                  "Họ tên",
                  "Số điện thoại",
                  "Loại đơn",
                  "Tổng tiền",
                  "Thời gian",
                  "File đơn hàng",
                ].map((label) => (
                  <th
                    key={label}
                    className="px-5 py-4 text-left text-xs font-normal uppercase tracking-[0.4px] text-[var(--muted)]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--background)]">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-14 text-center text-sm text-[var(--muted)] tracking-[0.4px]"
                  >
                    Chưa có đơn đặt hàng nào.
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="transition-opacity duration-300 ease-in-out hover:opacity-90"
                  >
                    <td className="px-5 py-4 text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
                      <div className="flex flex-col gap-0.5">
                        <span>{order.customerName}</span>
                        {order.note ? (
                          <span className="text-xs text-[var(--muted)] tracking-[0.4px]">
                            Ghi chú: {order.note}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-[var(--foreground)] tracking-[0.4px]">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="underline underline-offset-4 transition-opacity duration-300 hover:opacity-80"
                        style={{ color: "#F27025" }}
                      >
                        {order.customerPhone}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-sm font-normal tracking-[0.4px] text-[var(--muted)]">
                      <span className="inline-flex items-center border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs tracking-[0.4px] text-[var(--foreground)]">
                        {orderKindLabel(order.orderKind)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-normal tracking-[0.4px]" style={{ color: "#F27025" }}>
                      {formatCurrency(order.totalAmount.toString())}
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-[var(--muted)] tracking-[0.4px]">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={order.pdfPublicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mhv-btn-secondary inline-flex min-h-[38px] items-center gap-1.5 px-3 py-2 text-xs font-normal tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70"
                          title="Mở PDF trong tab mới"
                        >
                          <span className="inline-flex text-base leading-none">👁</span>
                          <span>Xem trước</span>
                        </Link>
                        <a
                          href={order.pdfPublicUrl}
                          download
                          className="mhv-btn-primary inline-flex min-h-[38px] items-center gap-1.5 px-3 py-2 text-xs font-normal tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70"
                          style={{ backgroundColor: "#F27025", borderColor: "#F27025", color: "#ffffff" }}
                          title="Tải PDF đơn hàng về máy"
                        >
                          <span className="inline-flex text-base leading-none">⬇</span>
                          <span>Tải PDF</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
