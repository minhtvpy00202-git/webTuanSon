"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ConfirmModal } from "@/components/admin/confirm-modal";

type HeroSlideUploadResult = { path: string; publicUrl: string };

async function uploadImagesViaServer(files: File[]): Promise<HeroSlideUploadResult[]> {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  const res = await fetch("/api/admin/storage/upload-product", {
    method: "POST",
    body,
  });
  const data = (await res.json()) as {
    success: boolean;
    message: string;
    images?: HeroSlideUploadResult[];
  };
  if (!res.ok || !data.success || !data.images) {
    throw new Error(data.message || "Không thể upload ảnh slide.");
  }
  return data.images;
}

type HeroSlideFormState = {
  id?: number;
  imageUrl: string;
  storagePath: string | null;
  sortOrder: number;
  heading: string;
  subheading: string;
  ctaText: string;
  ctaLink: string;
  file?: File;
  isRemoved?: boolean;
};

type CompanyInfoFormProps = {
  initialValues: {
    companyName: string;
    aboutUs: string;
    mission: string;
    vision: string;
    heroSlides: HeroSlideFormState[];
  };
};

export function CompanyInfoForm({ initialValues }: CompanyInfoFormProps) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(initialValues.companyName);
  const [aboutUs, setAboutUs] = useState(initialValues.aboutUs);
  const [mission, setMission] = useState(initialValues.mission);
  const [vision, setVision] = useState(initialValues.vision);
  const [heroSlides, setHeroSlides] = useState<HeroSlideFormState[]>(
    initialValues.heroSlides.map((slide, idx) => ({ ...slide, sortOrder: slide.sortOrder ?? idx })),
  );
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);

  function handlePickSlideFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const nextSlides = [...heroSlides];
    const baseSortOrder = nextSlides.length > 0 ? Math.max(...nextSlides.map((s) => s.sortOrder)) + 1 : 0;
    Array.from(files).forEach((file, idx) => {
      nextSlides.push({
        imageUrl: URL.createObjectURL(file),
        storagePath: null,
        sortOrder: baseSortOrder + idx,
        heading: "",
        subheading: "",
        ctaText: "",
        ctaLink: "",
        file,
      });
    });
    setHeroSlides(nextSlides);
  }

  function updateSlide(index: number, patch: Partial<HeroSlideFormState>) {
    const nextSlides = [...heroSlides];
    nextSlides[index] = { ...nextSlides[index], ...patch };
    setHeroSlides(nextSlides);
  }

  function moveSlide(index: number, delta: -1 | 1) {
    const other = index + delta;
    if (other < 0 || other >= heroSlides.length) return;
    const nextSlides = [...heroSlides];
    const a = nextSlides[index];
    const b = nextSlides[other];
    nextSlides[index] = { ...b, sortOrder: a.sortOrder };
    nextSlides[other] = { ...a, sortOrder: b.sortOrder };
    setHeroSlides(nextSlides);
  }

  function confirmDeleteSlide(index: number) {
    setPendingDeleteIndex(index);
  }

  function doDeleteSlide() {
    if (pendingDeleteIndex === null) return;
    const index = pendingDeleteIndex;
    setHeroSlides((prev) =>
      prev
        .map((s, i) => (i === index ? { ...s, isRemoved: true } : s))
        .filter((s) => !s.isRemoved || s.id),
    );
    setPendingDeleteIndex(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const activeSlides = heroSlides
        .map((s) => ({ ...s }))
        .filter((s) => !s.isRemoved);

      const payload = new FormData();
      payload.append("companyName", companyName);
      payload.append("aboutUs", aboutUs);
      payload.append("mission", mission);
      payload.append("vision", vision);

      const uploadedSlides: typeof activeSlides = [];
      const removedStoragePaths: string[] = [];
      for (const slide of heroSlides) {
        if (slide.isRemoved && slide.storagePath) {
          removedStoragePaths.push(slide.storagePath);
        }
      }

      let slideIndex = 0;
      const slidesWithNewFiles = activeSlides.filter((s) => s.file);
      const uploadedFileResults =
        slidesWithNewFiles.length > 0
          ? await uploadImagesViaServer(slidesWithNewFiles.map((s) => s.file as File))
          : [];
      let uploadedCursor = 0;

      for (const slide of activeSlides) {
        let imageUrl = slide.imageUrl;
        let storagePath = slide.storagePath;
        if (slide.file) {
          const result = uploadedFileResults[uploadedCursor++] ?? {
            path: "",
            publicUrl: "",
          };
          imageUrl = result.publicUrl;
          storagePath = result.path;
        }
        uploadedSlides.push({
          ...slide,
          imageUrl,
          storagePath,
          sortOrder: slideIndex,
          file: undefined,
        });
        slideIndex += 1;
      }

      payload.append(
        "heroSlides",
        JSON.stringify(
          uploadedSlides.map((slide) => ({
            id: slide.id,
            imageUrl: slide.imageUrl,
            storagePath: slide.storagePath,
            sortOrder: slide.sortOrder,
            heading: slide.heading?.trim() ?? "",
            subheading: slide.subheading?.trim() ?? "",
            ctaText: slide.ctaText?.trim() ?? "",
            ctaLink: slide.ctaLink?.trim() ?? "",
          })),
        ),
      );
      payload.append("removedSlideStoragePaths", JSON.stringify(removedStoragePaths));

      const response = await fetch("/api/admin/company", {
        method: "POST",
        body: payload,
      });

      const result = (await response.json()) as {
        success: boolean;
        message: string;
      };

      if (!response.ok || !result.success) {
        setErrorMessage(result.message);
        return;
      }

      router.refresh();
      setMessage(result.message);
    } catch (error) {
      console.error("Không thể cập nhật thông tin doanh nghiệp:", error);
      setErrorMessage("Không thể cập nhật lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleSlides = heroSlides.filter((s) => !s.isRemoved);

  return (
    <form className="mhv-card space-y-6 p-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <p className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Thông tin doanh nghiệp</p>
        <h2 className="text-xl font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
          Cập nhật nội dung giới thiệu
        </h2>
      </div>

      {message ? (
        <div className="mhv-alert-success p-4 text-sm tracking-[0.4px]">
          {message}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mhv-alert-danger p-4 text-sm tracking-[0.4px]">
          {errorMessage}
        </div>
      ) : null}

      <div className="space-y-4">
        <label className="space-y-2 block">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
            Tên doanh nghiệp
          </span>
          <input
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className="mhv-input text-sm tracking-[0.4px]"
            required
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
            Giới thiệu doanh nghiệp
          </span>
          <textarea
            value={aboutUs}
            onChange={(event) => setAboutUs(event.target.value)}
            className="mhv-input min-h-32 text-sm tracking-[0.4px]"
            required
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 block">
            <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
              Nhiệm vụ
            </span>
            <textarea
              value={mission}
              onChange={(event) => setMission(event.target.value)}
              className="mhv-input min-h-28 text-sm tracking-[0.4px]"
              required
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-sm font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
              Sứ mệnh
            </span>
            <textarea
              value={vision}
              onChange={(event) => setVision(event.target.value)}
              className="mhv-input min-h-28 text-sm tracking-[0.4px]"
              required
            />
          </label>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-normal tracking-[0.4px] text-[var(--foreground)]">Ảnh slide trang chủ</p>
            <h3 className="text-xl font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
              Carousel banner trang chủ
            </h3>
            <p className="text-sm leading-6 tracking-[0.4px] text-slate-600 dark:text-slate-400">
              Tải lên ảnh định dạng ngang (tỉ lệ 16:9 hoặc 21:9). Sắp xếp thứ tự hiển thị bằng các nút mũi tên. Slide đầu tiên là slide mặc định.
            </p>
          </div>
          <label className="mhv-btn-primary inline-flex cursor-pointer items-center justify-center gap-2 px-5 py-3 text-sm font-normal tracking-[0.4px] hover:opacity-70">
            <span>+ Thêm ảnh slide</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => handlePickSlideFiles(event.target.files)}
            />
          </label>
        </div>

        {visibleSlides.length === 0 ? (
          <div className="mhv-card border-dashed p-8 text-center space-y-2">
            <p className="text-sm tracking-[0.4px] text-[var(--muted)]">
              Chưa có ảnh slide nào. Banner mặc định sẽ hiển thị thay thế.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleSlides.map((slide, index) => (
              <div key={slide.id ?? slide.imageUrl} className="mhv-card space-y-3 p-3 sm:p-4">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--surface-muted)]">
                  <Image
                    src={slide.imageUrl}
                    alt={slide.heading || `Slide ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  {slide.sortOrder === 0 ? (
                    <span className="absolute left-2 top-2 lv-solid-primary px-3 py-1 text-xs tracking-[0.4px]">
                      Slide chính
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveSlide(index, -1)}
                      disabled={index === 0}
                      className="mhv-btn-secondary inline-flex h-9 w-9 items-center justify-center text-sm disabled:opacity-40"
                      aria-label="Đưa slide lên trước"
                    >
                      ‹
                    </button>
                    <span className="text-xs tracking-[0.4px] text-[var(--muted)]">
                      {index + 1} / {visibleSlides.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveSlide(index, 1)}
                      disabled={index === visibleSlides.length - 1}
                      className="mhv-btn-secondary inline-flex h-9 w-9 items-center justify-center text-sm disabled:opacity-40"
                      aria-label="Đưa slide ra sau"
                    >
                      ›
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => confirmDeleteSlide(index)}
                    className="mhv-btn-secondary inline-flex h-9 items-center justify-center px-3 text-sm hover:opacity-70"
                  >
                    Xóa
                  </button>
                </div>

                <label className="space-y-1 block">
                  <span className="text-xs font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
                    Tiêu đề lớn (heading)
                  </span>
                  <input
                    type="text"
                    value={slide.heading}
                    onChange={(event) => updateSlide(index, { heading: event.target.value })}
                    placeholder="Ví dụ: Vật liệu xây dựng chất lượng"
                    className="mhv-input text-sm tracking-[0.4px]"
                  />
                </label>

                <label className="space-y-1 block">
                  <span className="text-xs font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
                    Phụ đề (subheading)
                  </span>
                  <input
                    type="text"
                    value={slide.subheading}
                    onChange={(event) => updateSlide(index, { subheading: event.target.value })}
                    placeholder="Mô tả ngắn gọn xuất hiện dưới tiêu đề"
                    className="mhv-input text-sm tracking-[0.4px]"
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 block">
                    <span className="text-xs font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
                      Nút CTA — Text
                    </span>
                    <input
                      type="text"
                      value={slide.ctaText}
                      onChange={(event) => updateSlide(index, { ctaText: event.target.value })}
                      placeholder="Ví dụ: Xem ngay"
                      className="mhv-input text-sm tracking-[0.4px]"
                    />
                  </label>
                  <label className="space-y-1 block">
                    <span className="text-xs font-normal tracking-[0.4px] text-slate-900 dark:text-slate-100">
                      Nút CTA — Link
                    </span>
                    <input
                      type="text"
                      value={slide.ctaLink}
                      onChange={(event) => updateSlide(index, { ctaLink: event.target.value })}
                      placeholder="Ví dụ: /products"
                      className="mhv-input text-sm tracking-[0.4px]"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="mhv-btn-primary inline-flex px-5 py-3 text-sm font-normal tracking-[0.4px] transition-all duration-300 ease-in-out hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Đang lưu..." : "Lưu thông tin doanh nghiệp"}
        </button>
      </div>

      <ConfirmModal
        open={pendingDeleteIndex !== null}
        title="Xóa slide?"
        description={
          pendingDeleteIndex !== null
            ? `Slide "${visibleSlides[pendingDeleteIndex]?.heading || `thứ ${pendingDeleteIndex + 1}`}" sẽ bị xóa khỏi carousel. Tiếp tục?`
            : ""
        }
        confirmLabel="Xóa"
        onClose={() => setPendingDeleteIndex(null)}
        onConfirm={doDeleteSlide}
      />
    </form>
  );
}
