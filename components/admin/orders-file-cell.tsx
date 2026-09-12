"use client";

import Link from "next/link";
import { useState } from "react";

type Props = {
  pdfPublicUrl: string;
};

async function triggerPdfDownload(
  publicPdfUrl: string,
  opts: {
    setLoading: (b: boolean) => void;
    setError: (s: string | null) => void;
  },
) {
  try {
    opts.setLoading(true);
    opts.setError(null);
    const resp = await fetch(publicPdfUrl, { method: "GET", mode: "cors" });
    if (!resp.ok) {
      throw new Error(`Không thể tải file (HTTP ${resp.status}).`);
    }
    const blob = await resp.blob();
    const urlObj = URL.createObjectURL(blob);
    try {
      const fallback = `don-dat-hang-${Date.now()}.pdf`;
      let suggested = fallback;
      try {
        const u = new URL(publicPdfUrl);
        const seg = u.pathname.split("/").filter(Boolean).pop();
        if (seg) {
          const dec = decodeURIComponent(seg);
          if (dec && /\.pdf$/i.test(dec)) suggested = dec;
          else if (dec) suggested = dec + ".pdf";
        }
      } catch {}
      const a = document.createElement("a");
      a.href = urlObj;
      a.download = suggested;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setTimeout(() => {
        try {
          URL.revokeObjectURL(urlObj);
        } catch {}
      }, 4000);
    }
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Không thể tải file PDF đơn hàng.";
    opts.setError(msg);
    try {
      window.open(publicPdfUrl, "_blank", "noopener,noreferrer");
    } catch {}
  } finally {
    opts.setLoading(false);
  }
}

export function OrdersFileCell({ pdfPublicUrl }: Props) {
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  return (
    <div className="flex items-center gap-2 whitespace-nowrap">
      <Link
        href={pdfPublicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mhv-btn-secondary inline-flex h-[38px] w-[116px] shrink-0 items-center justify-center gap-1.5 px-3 py-2 text-xs font-normal tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70"
        title="Mở PDF đơn hàng trong tab mới"
      >
        <span className="inline-flex text-base leading-none" aria-hidden>
          👁
        </span>
        <span>Xem trước</span>
      </Link>
      <button
        type="button"
        onClick={() =>
          triggerPdfDownload(pdfPublicUrl, { setLoading, setError })
        }
        disabled={loading}
        className="mhv-btn-primary inline-flex h-[38px] w-[116px] shrink-0 items-center justify-center gap-1.5 px-3 py-2 text-xs font-normal tracking-[0.4px] transition-opacity duration-300 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          backgroundColor: "#F27025",
          borderColor: "#F27025",
          color: "#ffffff",
        }}
        title="Tải file PDF đơn hàng về máy (không mở tab mới)"
      >
        <span className="inline-flex text-base leading-none" aria-hidden>
          {loading ? "…" : "⬇"}
        </span>
        <span>{loading ? "Đang tải..." : "Tải PDF"}</span>
      </button>
    </div>
  );
}
