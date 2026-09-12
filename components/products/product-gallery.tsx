'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

type ProductGalleryProps = {
  name: string;
  isPromotion: boolean;
  images: Array<{ imageUrl: string; isMain: boolean }>;
  fallbackImageUrl: string;
};

export function ProductGallery({
  name,
  isPromotion,
  images,
  fallbackImageUrl,
}: ProductGalleryProps) {
  const sortedImages = [...images].sort((a, b) => {
    if (a.isMain !== b.isMain) {
      return a.isMain ? -1 : 1;
    }
    return 0;
  });

  const displayImages = sortedImages.length > 0
    ? sortedImages
    : [{ imageUrl: fallbackImageUrl, isMain: true }];

  const defaultIndex = Math.max(
    0,
    displayImages.findIndex((im) => im.isMain),
  );

  const [selectedIndex, setSelectedIndex] = useState<number>(defaultIndex);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const total = displayImages.length;
  const hasMultiple = total > 1;

  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i + 1) % total);
  }, [total]);

  // Keyboard arrow navigation when user focuses the gallery
  useEffect(() => {
    if (!hasMultiple) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hasMultiple, goPrev, goNext]);

  const selectedImageUrl = displayImages[selectedIndex]?.imageUrl || fallbackImageUrl;

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    touchStartX.current = t.clientX;
    touchDeltaX.current = 0;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const t = e.touches[0];
    if (!t) return;
    touchDeltaX.current = t.clientX - touchStartX.current;
  }
  function onTouchEnd() {
    if (touchStartX.current == null) return;
    const delta = touchDeltaX.current;
    const threshold = 40;
    if (hasMultiple) {
      if (delta >= threshold) {
        goPrev();
      } else if (delta <= -threshold) {
        goNext();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  return (
    <div className="mhv-card overflow-hidden p-4 sm:p-5 space-y-4">
      <div
        className="relative aspect-[4/3] bg-[var(--surface-muted)] select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Image
          fill
          sizes="(max-width:1024px) 100vw,60vw"
          priority
          className="object-cover transition-all duration-300 ease-in-out"
          src={selectedImageUrl}
          alt={name}
        />

        {isPromotion ? (
          <span
            className="lv-promotion-badge absolute top-4 left-4 px-4 py-1.5 text-xs"
            style={{
              backgroundColor: '#F27025',
              color: '#ffffff',
              border: '1px solid #F27025',
            }}
          >
            Khuyến mãi
          </span>
        ) : null}

        {hasMultiple ? (
          <>
            <button
              type="button"
              aria-label="Ảnh trước"
              onClick={goPrev}
              className="hidden sm:inline-flex absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center border border-[var(--border)] bg-white text-lg font-bold text-[var(--foreground)] shadow-sm transition-all duration-300 hover:border-[#F27025] hover:text-[#F27025] active:scale-95"
              style={{ borderRadius: 0 }}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Ảnh sau"
              onClick={goNext}
              className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 items-center justify-center border border-[var(--border)] bg-white text-lg font-bold text-[var(--foreground)] shadow-sm transition-all duration-300 hover:border-[#F27025] hover:text-[#F27025] active:scale-95"
              style={{ borderRadius: 0 }}
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {displayImages.map((_, i) => {
                const active = i === selectedIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Xem ảnh ${i + 1}`}
                    onClick={() => setSelectedIndex(i)}
                    className="h-1.5 transition-all duration-300"
                    style={{
                      width: active ? 20 : 8,
                      backgroundColor: active ? '#F27025' : 'rgba(255,255,255,0.75)',
                      borderRadius: 0,
                      border: 'none',
                    }}
                  />
                );
              })}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {displayImages.map((image, index) => {
          const isSelected = index === selectedIndex;
          return (
            <button
              key={`${image.imageUrl}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`aspect-square w-20 h-20 shrink-0 overflow-hidden border transition-all duration-300 ease-in-out ${
                isSelected
                  ? 'border-[var(--foreground)]'
                  : 'border-[var(--border)] hover:opacity-70'
              }`}
              style={isSelected ? { boxShadow: 'inset 0 0 0 2px #F27025' } : undefined}
            >
              <div className="relative w-full h-full">
                <Image
                  fill
                  className="object-cover"
                  src={image.imageUrl}
                  alt={`${name} - thumbnail ${index + 1}`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
