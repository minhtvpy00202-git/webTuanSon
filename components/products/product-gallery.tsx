'use client';

import Image from 'next/image';
import { useState } from 'react';

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

  const defaultImageUrl =
    displayImages.find((im) => im.isMain)?.imageUrl ||
    displayImages[0]?.imageUrl ||
    fallbackImageUrl;

  const [selectedImageUrl, setSelectedImageUrl] = useState(defaultImageUrl);

  return (
    <div className="mhv-card overflow-hidden p-4 sm:p-5 space-y-4">
      <div className="relative aspect-[4/3] bg-[var(--surface-muted)]">
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
              backgroundColor: "#F27025",
              color: "#ffffff",
              border: "1px solid #F27025",
            }}
          >
            Khuyến mãi
          </span>
        ) : null}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {displayImages.map((image, index) => {
          const isSelected = image.imageUrl === selectedImageUrl;
          return (
            <button
              key={`${image.imageUrl}-${index}`}
              type="button"
              onClick={() => setSelectedImageUrl(image.imageUrl)}
              className={`aspect-square w-20 h-20 shrink-0 overflow-hidden border transition-opacity duration-300 ease-in-out ${
                isSelected
                  ? 'border-[var(--foreground)]'
                  : 'border-[var(--border)] hover:opacity-70'
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  fill
                  className="object-cover"
                  src={image.imageUrl}
                  alt={`${name} - thumbnail`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
