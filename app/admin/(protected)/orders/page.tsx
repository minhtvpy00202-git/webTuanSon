import Link from "next/link";

import { OrderDeleteButton } from "@/components/admin/order-delete-button";
import { OrdersFileCell } from "@/components/admin/orders-file-cell";
import { formatCurrency } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SortColumn = "customerName" | "customerPhone" | "orderKind" | "totalAmount" | "createdAt";
type SortDir = "asc" | "desc";

const VALID_SORT: Record<string, SortColumn> = {
  customerName: "customerName",
  customerPhone: "customerPhone",
  orderKind: "orderKind",
  totalAmount: "totalAmount",
  createdAt: "createdAt",
};

const SORT_LABELS: Record<SortColumn, string> & { id: never } = {
  customerName: "Họ tên",
  customerPhone: "Số điện thoại",
  orderKind: "Loại đơn",
  totalAmount: "Tổng tiền",
  createdAt: "Thời gian",
} as const;

const KIND_OPTIONS = [
  { value: "all", label: "Tất cả loại đơn" },
  { value: "cart", label: "Đặt từ giỏ hàng" },
  { value: "single", label: "Đặt nhanh 1 sản phẩm" },
] as const;

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

function buildSearchUrl(params: {
  q?: string | null;
  kind?: string | null;
  sort?: string | null;
  dir?: string | null;
}) {
  const sp = new URLSearchParams();
  const q = (params.q ?? "").trim();
  if (q) sp.set("q", q);
  if (params.kind && params.kind !== "all") sp.set("kind", params.kind);
  const sort = VALID_SORT[params.sort ?? ""] ? (params.sort as SortColumn) : "createdAt";
  const dir: SortDir = params.dir === "asc" ? "asc" : "desc";
  sp.set("sort", sort);
  sp.set("dir", dir);
  const qs = sp.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { q?: string; kind?: string; sort?: string; dir?: string };
}) {
  const rawQ = (searchParams?.q ?? "").trim();
  const rawKind = searchParams?.kind === "single" || searchParams?.kind === "cart" ? searchParams.kind : "all";
  const sort: SortColumn = VALID_SORT[searchParams?.sort ?? ""]
    ? (searchParams!.sort as SortColumn)
    : "createdAt";
  const dir: SortDir = searchParams?.dir === "asc" ? "asc" : "desc";

  const where: any = { AND: [] as any[] };
  if (rawQ) {
    const q = rawQ.toLowerCase();
    where.AND.push({
      OR: [
        { customerName: { contains: rawQ, mode: "insensitive" as const } },
        { customerPhone: { contains: rawQ, mode: "insensitive" as const } },
        { note: { contains: rawQ, mode: "insensitive" as const } },
      ],
    });
    void q;
  }
  if (rawKind !== "all") {
    where.AND.push({ orderKind: rawKind });
  }
  if (where.AND.length === 0) delete where.AND;

  const orders = await prisma.customerOrder.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: [
      { [sort]: dir },
      { id: dir },
    ] as any,
  });

  const totalOrders = await prisma.customerOrder.count();
  const filteredCount = orders.length;

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
        <div className="flex flex-wrap items-center gap-2 text-sm tracking-[0.4px] text-[var(--muted)]">
          <span className="inline-flex h-9 items-center border border-[var(--border)] bg-[var(--card)] px-3">
            Tổng đơn:&nbsp;
            <strong className="font-normal text-[var(--foreground)]">{totalOrders}</strong>
          </span>
          {rawQ || rawKind !== "all" ? (
            <span className="inline-flex h-9 items-center border px-3" style={{ borderColor: "#F27025" }}>
              Kết quả lọc:&nbsp;
              <strong className="font-normal" style={{ color: "#F27025" }}>
                {filteredCount}
              </strong>
            </span>
          ) : null}
        </div>
      </div>

      <form
        action="/admin/orders"
        method="get"
        className="mhv-card grid grid-cols-1 gap-3 p-5 sm:grid-cols-12 sm:items-end"
      >
        <div className="space-y-2 sm:col-span-6">
          <label
            htmlFor="admin-orders-q"
            className="block text-xs font-normal uppercase tracking-[0.4px] text-[var(--muted)]"
          >
            Tìm kiếm
          </label>
          <div className="relative w-full">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 inline-flex w-9 items-center justify-center text-sm leading-none text-[var(--muted)]"
            >
              🔍
            </span>
            <input
              id="admin-orders-q"
              name="q"
              type="search"
              defaultValue={rawQ}
              placeholder="Tên khách, SĐT, nội dung ghi chú..."
              className="mhv-input h-10 w-full pl-10 pr-20 text-sm tracking-[0.4px] text-[var(--foreground)] placeholder:text-[var(--muted)]"
            />
            {rawQ ? (
              <Link
                href={buildSearchUrl({ q: null, kind: rawKind, sort, dir })}
                className="absolute inset-y-0 right-0 inline-flex items-center pr-3 text-xs tracking-[0.4px] underline underline-offset-4 transition-opacity duration-300 hover:opacity-80"
                style={{ color: "#F27025" }}
                title="Xóa từ khóa"
              >
                Xóa
              </Link>
            ) : null}
          </div>
        </div>
        <div className="space-y-2 sm:col-span-3">
          <label
            htmlFor="admin-orders-kind"
            className="block text-xs font-normal uppercase tracking-[0.4px] text-[var(--muted)]"
          >
            Bộ lọc
          </label>
          <div className="relative w-full min-w-[180px]">
            <select
              id="admin-orders-kind"
              name="kind"
              defaultValue={rawKind}
              className="mhv-input h-10 w-full appearance-none truncate bg-[var(--background)] pl-3 pr-10 text-sm tracking-[0.4px] text-[var(--foreground)]"
            >
              {KIND_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="truncate">
                  {o.label}
                </option>
              ))}
            </select>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 inline-flex w-9 items-center justify-center text-[var(--muted)]"
            >
              ▾
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-2 sm:col-span-3 sm:justify-end">
          <button
            type="submit"
            className="mhv-btn-primary inline-flex h-10 items-center justify-center px-5 text-sm tracking-[0.4px] transition-opacity duration-300 hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: "#F27025", borderColor: "#F27025", color: "#ffffff" }}
          >
            Áp dụng
          </button>
          <Link
            href="/admin/orders"
            className="mhv-btn-secondary inline-flex h-10 items-center justify-center px-5 text-sm tracking-[0.4px] transition-opacity duration-300 hover:opacity-85"
            title="Bỏ bộ lọc / tìm kiếm / sắp xếp"
          >
            Đặt lại
          </Link>
        </div>
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
      </form>

      <div className="mhv-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border)] table-fixed">
            <colgroup>
              <col style={{ width: "56px" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "170px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "260px", minWidth: "260px" }} />
              <col style={{ width: "360px", minWidth: "360px" }} />
            </colgroup>
            <thead className="bg-[var(--surface-muted)]">
              <tr>
                {([
                  { key: "_stt", label: "STT", sortable: false, align: "left" },
                  { key: "customerName", label: "Họ tên", sortable: true, align: "left" },
                  { key: "customerPhone", label: "Số điện thoại", sortable: true, align: "left" },
                  { key: "orderKind", label: "Loại đơn", sortable: true, align: "left" },
                  { key: "totalAmount", label: "Tổng tiền", sortable: true, align: "right" },
                  { key: "createdAt", label: "Thời gian", sortable: true, align: "left" },
                  { key: "_file", label: "File đơn hàng", sortable: false, align: "left" },
                  { key: "_actions", label: "Thao tác", sortable: false, align: "left" },
                ] as Array<{
                  key: string;
                  label: string;
                  sortable: boolean;
                  align: "left" | "right";
                }>).map((col) => {
                  if (!col.sortable) {
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        className={`px-5 py-4 text-xs font-normal uppercase tracking-[0.4px] text-[var(--muted)] ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {col.label}
                      </th>
                    );
                  }
                  const sc = col.key as SortColumn;
                  const active = sort === sc;
                  const nextDir: SortDir = active && dir === "desc" ? "asc" : "desc";
                  const href = buildSearchUrl({
                    q: rawQ,
                    kind: rawKind,
                    sort: sc,
                    dir: nextDir,
                  });
                  const arrow = active ? (dir === "asc" ? "▲" : "▼") : "↕";
                  return (
                    <th
                      key={col.key}
                      scope="col"
                      className={`px-5 py-4 text-xs font-normal uppercase tracking-[0.4px] ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      <Link
                        href={href}
                        className="group inline-flex max-w-full items-center gap-2 whitespace-nowrap transition-colors duration-300 hover:text-[var(--foreground)]"
                        title={`Sắp xếp theo ${SORT_LABELS[sc]} ${nextDir === "asc" ? "(A→Z, nhỏ→lớn)" : "(Z→A, lớn→nhỏ)"}`}
                        style={{
                          color: active ? "#F27025" : "var(--muted)",
                        }}
                      >
                        <span>{col.label}</span>
                        <span
                          aria-hidden
                          className={`inline-flex h-5 w-5 items-center justify-center border text-[10px] transition-all duration-300 ${
                            active
                              ? "group-hover:bg-[#F27025] group-hover:text-white"
                              : "group-hover:border-[#F27025] group-hover:text-[#F27025]"
                          }`}
                          style={{
                            borderColor: active ? "#F27025" : "var(--border)",
                            color: active ? "#F27025" : "var(--muted)",
                          }}
                        >
                          {arrow}
                        </span>
                      </Link>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] bg-[var(--background)]">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-14 text-center text-sm text-[var(--muted)] tracking-[0.4px]"
                  >
                    {rawQ || rawKind !== "all"
                      ? "Không tìm thấy đơn hàng phù hợp với bộ lọc / từ khóa."
                      : "Chưa có đơn đặt hàng nào."}
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="transition-opacity duration-300 ease-in-out hover:opacity-90"
                  >
                    <td className="px-5 py-4 text-sm font-normal text-[var(--muted)] tracking-[0.4px] align-top">
                      {idx + 1}
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-[var(--foreground)] tracking-[0.4px] align-top">
                      <div className="flex max-w-full flex-col gap-1.5">
                        <span
                          className="block max-w-full truncate font-medium"
                          title={order.customerName}
                        >
                          {order.customerName}
                        </span>
                        {order.note ? (
                          <span
                            className="block max-w-full truncate text-xs tracking-[0.4px] text-[var(--muted)]"
                            title={`Ghi chú: ${order.note}`}
                          >
                            Ghi chú: {order.note}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-normal tracking-[0.4px] align-top">
                      <a
                        href={`tel:${order.customerPhone}`}
                        className="underline underline-offset-4 transition-opacity duration-300 hover:opacity-80"
                        style={{ color: "#F27025" }}
                        title={`Gọi nhanh ${order.customerPhone}`}
                      >
                        {order.customerPhone}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-sm font-normal tracking-[0.4px] align-top">
                      <span className="inline-flex items-center border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-xs tracking-[0.4px] text-[var(--foreground)]">
                        {orderKindLabel(order.orderKind)}
                      </span>
                    </td>
                    <td
                      className="px-5 py-4 text-right text-sm font-normal tracking-[0.4px] align-top tabular-nums"
                      style={{ color: "#F27025" }}
                    >
                      {formatCurrency(order.totalAmount.toString())}
                    </td>
                    <td className="px-5 py-4 text-sm font-normal text-[var(--muted)] tracking-[0.4px] align-top tabular-nums">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <OrdersFileCell pdfPublicUrl={order.pdfPublicUrl} />
                    </td>
                    <td className="px-5 py-4 align-top">
                      <OrderDeleteButton
                        orderId={order.id}
                        customerName={order.customerName}
                      />
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
