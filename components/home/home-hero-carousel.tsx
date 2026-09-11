"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type HeroSlide = {
  id: number;
  imageUrl: string;
  heading: string | null;
  subheading: string | null;
  ctaText: string | null;
  ctaLink: string | null;
};

type HomeHeroCarouselProps = {
  slides: HeroSlide[];
  fallback: {
    companyName: string;
    aboutUs: string;
  };
};

const AUTOPLAY_MS = 5000;

export function HomeHeroCarousel({ slides, fallback }: HomeHeroCarouselProps) {
  const hasSlides = slides.length > 0;
  const total = hasSlides ? slides.length : 1;
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const goTo = useCallback(
    (next: number) => {
      const idx = ((next % total) + total) % total;
      setActiveIndex(idx);
    },
    [total],
  );

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = () => {
    clearTimer();
    if (total > 1) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % total);
      }, AUTOPLAY_MS);
    }
  };

  useEffect(() => {
    startTimer();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const pauseOnHover = () => hasSlides && total > 1 && clearTimer();
  const resumeOnLeave = () => hasSlides && total > 1 && startTimer();

  if (!hasSlides) {
    return (
      <div
        className="lv-hero-stage aspect-[16/9] w-full overflow-hidden lg:aspect-[21/9]"
        ref={containerRef}
      >
        <div className="lv-fade-in flex h-full w-full items-center justify-center p-6 sm:p-10 lg:p-16">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <span className="lv-hero-pill inline-flex px-4 py-1.5 text-sm font-normal tracking-[0.4px]">
              {fallback.companyName || "Digital Catalogue vật liệu xây dựng"}
            </span>
            <div className="space-y-4">
              <h1 className="text-3xl font-normal tracking-[0.4px] sm:text-4xl lg:text-5xl">
                Vật liệu xây dựng chất lượng cho công trình bền vững và hiện đại
              </h1>
              <p className="mx-auto max-w-3xl text-sm leading-7 opacity-80 tracking-[0.4px] sm:text-base">
                {fallback.aboutUs ||
                  "Chúng tôi cung cấp catalogue điện tử cho gạch ốp lát, ngói và thiết bị vệ sinh với nội dung đang được cập nhật."}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
              <Link
                href="/products"
                className="lv-solid-primary inline-flex w-full items-center justify-center px-6 py-3 text-sm font-normal tracking-[0.4px] sm:w-auto hover:opacity-70"
              >
                Xem danh mục sản phẩm
              </Link>
              <Link
                href="/contact"
                className="lv-hero-btn-outline inline-flex w-full items-center justify-center px-6 py-3 text-sm font-normal tracking-[0.4px] sm:w-auto hover:opacity-70"
              >
                Gửi yêu cầu tư vấn
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--surface-muted)] lg:aspect-[21/9]"
      ref={containerRef}
      onMouseEnter={pauseOnHover}
      onMouseLeave={resumeOnLeave}
      onFocus={pauseOnHover}
      onBlur={resumeOnLeave}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        return (
          <div
            key={slide.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.imageUrl}
              alt={slide.heading || `Banner ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative flex h-full w-full items-center justify-center p-6 sm:p-10 lg:p-16">
              <div className="mx-auto max-w-4xl space-y-6 text-center text-white">
                <span className="lv-hero-pill inline-flex px-4 py-1.5 text-sm font-normal tracking-[0.4px]">
                  {fallback.companyName || "Digital Catalogue vật liệu xây dựng"}
                </span>
                <div className="space-y-4">
                  <h1 className="text-3xl font-normal tracking-[0.4px] sm:text-4xl lg:text-5xl">
                    {slide.heading ||
                      "Vật liệu xây dựng chất lượng cho công trình bền vững và hiện đại"}
                  </h1>
                  <p className="mx-auto max-w-3xl text-sm leading-7 opacity-90 tracking-[0.4px] sm:text-base">
                    {slide.subheading ||
                      fallback.aboutUs ||
                      "Chúng tôi cung cấp catalogue điện tử cho gạch ốp lát, ngói và thiết bị vệ sinh với nội dung đang được cập nhật."}
                  </p>
                </div>
                <div className="flex flex-col items-center justify-center gap-4 pt-2 sm:flex-row">
                  <Link
                    href={slide.ctaLink || "/products"}
                    className="lv-solid-primary inline-flex w-full items-center justify-center px-6 py-3 text-sm font-normal tracking-[0.4px] sm:w-auto hover:opacity-70"
                  >
                    {slide.ctaText || "Xem danh mục sản phẩm"}
                  </Link>
                  <Link
                    href="/contact"
                    className="lv-hero-btn-outline inline-flex w-full items-center justify-center px-6 py-3 text-sm font-normal tracking-[0.4px] sm:w-auto hover:opacity-70"
                  >
                    Gửi yêu cầu tư vấn
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {total > 1 ? (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Slide trước"
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/50 bg-black/30 text-white transition-opacity duration-300 ease-in-out hover:bg-black/50 hover:opacity-70 sm:left-4 sm:h-12 sm:w-12"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Slide sau"
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/50 bg-black/30 text-white transition-opacity duration-300 ease-in-out hover:bg-black/50 hover:opacity-70 sm:right-4 sm:h-12 sm:w-12"
          >
            ›
          </button>

          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-6 sm:gap-3">
            {slides.map((slide, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={`dot-${slide.id}`}
                  type="button"
                  onClick={() => goTo(idx)}
                  aria-label={`Hiển thị slide ${idx + 1}`}
                  className={`h-2 border transition-all duration-300 ease-in-out ${
                    isActive
                      ? "w-8 border-white bg-white"
                      : "w-2 border-white/60 bg-transparent hover:opacity-70"
                  }`}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
