"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type SearchResult = {
  id: number;
  productCode: string;
  name: string;
  imageUrl: string;
  categoryId: number | null;
  categoryName: string | null;
  categorySlug: string | null;
  price: number | null;
  discountPrice: number | null;
  isPromotion: boolean;
};

type GlobalSearchClientProps = {
  /**
   * Placement:
   * - 'topbar': search sits on the right of the header, grows inline; dropdown below the header
   * - 'mobile-bar': full width mobile search; dropdown grows inline below input (no absolute)
   */
  variant?: "topbar" | "mobile-bar";
};

function formatCurrency(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "Liên hệ";
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value.toLocaleString("vi-VN")}₫`;
  }
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m20 20-3.5-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="butt"
      />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="butt"
      />
    </svg>
  );
}

export function GlobalSearchClient({
  variant = "topbar",
}: GlobalSearchClientProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebouncedValue(query, 280);

  useEffect(() => {
    let cancelled = false;
    const keyword = debouncedQuery.trim();

    if (open && keyword.length > 0) {
      setLoading(true);
      const controller = new AbortController();
      (async () => {
        try {
          const url = `/api/products/search?q=${encodeURIComponent(
            keyword,
          )}&limit=8`;
          const res = await fetch(url, {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          });
          if (!res.ok) {
            if (!cancelled) {
              setResults([]);
              setLoading(false);
            }
            return;
          }
          const data = (await res.json()) as { items?: SearchResult[] };
          if (!cancelled) {
            setResults(Array.isArray(data.items) ? data.items : []);
            setLoading(false);
          }
        } catch (e) {
          if (!cancelled && (e as { name?: string })?.name !== "AbortError") {
            setResults([]);
            setLoading(false);
          }
        }
      })();
      return () => {
        cancelled = true;
        controller.abort();
      };
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [debouncedQuery, open]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (wrapperRef.current.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  function handleToggleOpen() {
    setOpen((current) => {
      const next = !current;
      if (next) {
        window.setTimeout(() => {
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 0);
      } else {
        setQuery("");
        setResults([]);
      }
      return next;
    });
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSubmitted(true);
    router.push(`/products?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
    setResults([]);
  }

  const hasKeyword = query.trim().length > 0;
  const showDropdown =
    open && variant === "topbar";
  const showMobileDropdown = open && variant === "mobile-bar";

  return (
    <div
      ref={wrapperRef}
      className={
        variant === "topbar"
          ? "relative inline-flex items-center"
          : "relative w-full"
      }
    >
      {variant === "topbar" ? (
        <div
          className={`flex items-center overflow-hidden border border-transparent bg-transparent transition-all duration-700 ease-[cubic-bezier(.22,.61,.36,1)] ${
            open
              ? "w-[260px] border-[var(--border)] bg-[var(--card)] sm:w-[320px] md:w-[360px]"
              : "w-11"
          }`}
        >
          <button
            type="button"
            onClick={handleToggleOpen}
            className="inline-flex flex-shrink-0 h-11 w-11 items-center justify-center text-[var(--foreground)] transition-all duration-300 ease-in-out hover:opacity-70"
            aria-label={open ? "Đóng tìm kiếm" : "Tìm kiếm"}
          >
            <SearchIcon />
          </button>
          <div className="flex-1 min-w-0">
            <form onSubmit={handleFormSubmit} className="flex">
              <input
                ref={inputRef}
                type="search"
                name="q"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSubmitted(false);
                }}
                placeholder="Tìm theo tên hoặc mã..."
                className="h-11 w-full border-0 bg-transparent pl-0 pr-2 text-sm font-normal tracking-[0.4px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-0"
              />
            </form>
          </div>
          {open && hasKeyword ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="inline-flex h-11 w-8 items-center justify-center text-[var(--muted)] transition-all duration-300 ease-in-out hover:opacity-70"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <ClearIcon />
            </button>
          ) : null}
        </div>
      ) : (
        <form
          onSubmit={handleFormSubmit}
          className="flex w-full items-center gap-3 border border-[var(--border)] bg-[var(--card)] px-3 py-2 transition-all duration-700 ease-[cubic-bezier(.22,.61,.36,1)]"
          onClick={() => {
            if (!open) {
              setOpen(true);
              window.setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
        >
          <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center text-[var(--foreground)]">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSubmitted(false);
              if (!open) setOpen(true);
            }}
            placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
            className="h-9 w-full border-0 bg-transparent text-sm font-normal tracking-[0.4px] text-[var(--foreground)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-0"
          />
          {hasKeyword ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                inputRef.current?.focus();
              }}
              className="inline-flex h-9 w-8 items-center justify-center text-[var(--muted)] transition-all duration-300 ease-in-out hover:opacity-70"
              aria-label="Xóa nội dung tìm kiếm"
            >
              <ClearIcon />
            </button>
          ) : null}
        </form>
      )}

      {showDropdown ? (
        <div
          className={`absolute right-0 top-[calc(100%_-_0px)] z-50 mt-2 w-[320px] origin-top-right border border-[var(--border)] bg-[var(--card)] shadow-[0_1px_0_0_rgba(0,0,0,0.04)] transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] ${
            open
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "pointer-events-none opacity-0 -translate-y-2"
          }`}
          style={{ top: "calc(100% + 10px)" }}
        >
          <div className="max-h-[55vh] min-h-[80px] w-full overflow-y-auto">
            <SearchResultsList
              items={results}
              loading={loading}
              keyword={query.trim()}
              submitted={submitted}
              onPick={() => {
                setOpen(false);
                setQuery("");
                setResults([]);
              }}
              onSubmitSearch={() => {
                const q = query.trim();
                if (!q) return;
                router.push(`/products?q=${encodeURIComponent(q)}`);
                setOpen(false);
                setQuery("");
                setResults([]);
              }}
            />
          </div>
        </div>
      ) : null}

      {showMobileDropdown ? (
        <div className="relative mt-2 w-full overflow-hidden border border-[var(--border)] bg-[var(--card)] transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)]">
          <div className="max-h-[55vh] min-h-[80px] w-full overflow-y-auto">
            <SearchResultsList
              items={results}
              loading={loading}
              keyword={query.trim()}
              submitted={submitted}
              onPick={() => {
                setOpen(false);
                setQuery("");
                setResults([]);
              }}
              onSubmitSearch={() => {
                const q = query.trim();
                if (!q) return;
                router.push(`/products?q=${encodeURIComponent(q)}`);
                setOpen(false);
                setQuery("");
                setResults([]);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SearchResultsList(props: {
  items: SearchResult[];
  loading: boolean;
  keyword: string;
  submitted: boolean;
  onPick: () => void;
  onSubmitSearch: () => void;
}) {
  const { items, loading, keyword, submitted, onPick, onSubmitSearch } = props;

  if (loading && keyword) {
    return (
      <div className="px-4 py-5 text-sm font-normal tracking-[0.4px] text-[var(--muted)]">
        Đang tìm kiếm…
      </div>
    );
  }

  if (!keyword) {
    return (
      <div className="px-4 py-5 text-sm font-normal tracking-[0.4px] text-[var(--muted)]">
        Gõ tên hoặc mã sản phẩm để xem gợi ý
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-4">
        <p className="text-sm font-normal tracking-[0.4px] text-[var(--muted)]">
          Không tìm thấy sản phẩm phù hợp
        </p>
        {submitted ? null : (
          <button
            type="button"
            onClick={onSubmitSearch}
            className="mt-3 inline-flex h-10 items-center px-3 text-sm font-normal tracking-[0.4px] text-[var(--foreground)] underline decoration-1 underline-offset-4 transition-all duration-300 ease-in-out hover:opacity-70"
          >
            Xem tất cả kết quả trên trang Sản phẩm
          </button>
        )}
      </div>
    );
  }

  return (
    <ul className="flex flex-col">
      {items.map((item, idx) => {
        const price = item.discountPrice ?? item.price;
        return (
          <li
            key={item.id}
            className="border-b border-[var(--border)] last:border-b-0"
            style={{
              animation: `lv-fade-in-up 500ms cubic-bezier(.22,.61,.36,1) ${
                idx * 60
              }ms both`,
            }}
          >
            <Link
              href={`/products/${item.id}`}
              onClick={onPick}
              className="flex items-start gap-3 px-3 py-3 transition-all duration-300 ease-in-out hover:bg-[var(--surface-muted)] hover:opacity-100"
            >
              <div className="relative h-16 w-16 shrink-0 border border-[var(--border)] bg-[var(--surface-muted)] overflow-hidden">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover transition-all duration-500 ease-[cubic-bezier(.22,.61,.36,1)] hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[var(--muted)]">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                      <rect x="3" y="4" width="18" height="16" rx="0" stroke="currentColor" strokeWidth="1.5"/>
                      <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
                      <path d="m21 16-5-5-9 9" stroke="currentColor" strokeWidth="1.5"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">
                  {item.name}
                </p>
                <p className="truncate text-[11px] font-normal tracking-[0.4px] text-[var(--muted)]">
                  Mã: <span className="font-mono tracking-[0.2px]">{item.productCode}</span>
                  {item.categoryName ? (
                    <span className="ml-2 before:mr-2 before:content-['·']">
                      {item.categoryName}
                    </span>
                  ) : null}
                </p>
                <p className="text-[12px] font-normal tracking-[0.4px]">
                  {item.isPromotion && item.discountPrice && item.price ? (
                    <>
                      <span className="mr-2 text-[var(--foreground)]">
                        {formatCurrency(Number(item.discountPrice))}
                      </span>
                      <span className="line-through text-[var(--muted)]">
                        {formatCurrency(Number(item.price))}
                      </span>
                    </>
                  ) : (
                    <span className="text-[var(--foreground)]">
                      {formatCurrency(price)}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
      <li className="border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onSubmitSearch}
          className="flex h-11 w-full items-center justify-between px-4 text-left text-sm font-normal tracking-[0.4px] text-[var(--foreground)] transition-all duration-300 ease-in-out hover:bg-[var(--surface-muted)] hover:opacity-100"
        >
          <span>Xem tất cả kết quả “{keyword}”</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="m9 6 6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </li>
    </ul>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

