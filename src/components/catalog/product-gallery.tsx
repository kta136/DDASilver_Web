"use client";

import {
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import Image from "next/image";
import { useRef, useState } from "react";

import type { CatalogImage } from "@/types/catalog";

type ProductGalleryProps = {
  images: CatalogImage[];
  containImages?: boolean;
  priority?: boolean;
};

export function ProductGallery({
  images,
  containImages = false,
  priority = false,
}: ProductGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = images.length > 1;

  function showImage(index: number) {
    const nextIndex = Math.min(Math.max(index, 0), images.length - 1);
    const scroller = scrollerRef.current;

    setActiveIndex(nextIndex);
    scroller?.scrollTo({
      left: nextIndex * scroller.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative min-w-0 bg-[#ebe7e2]">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={(event) => {
          const scroller = event.currentTarget;
          if (scroller.clientWidth === 0) {
            return;
          }

          const nextIndex = Math.min(
            Math.round(scroller.scrollLeft / scroller.clientWidth),
            images.length - 1,
          );
          setActiveIndex(nextIndex);
        }}
      >
        {images.map((image, index) => (
          <div
            key={`${image.src}-${index}`}
            className="relative aspect-[4/5] min-w-full snap-center snap-always sm:aspect-[16/13] lg:min-h-[34rem] lg:aspect-auto"
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={priority && index === 0}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className={containImages ? "object-contain" : "object-cover"}
              style={{ objectPosition: image.objectPosition ?? "center" }}
            />
          </div>
        ))}
      </div>

      {hasMultipleImages ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            disabled={activeIndex === 0}
            onClick={() => showImage(activeIndex - 1)}
            className="absolute top-1/2 left-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-ink shadow-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-35"
          >
            <CaretLeftIcon size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            disabled={activeIndex === images.length - 1}
            onClick={() => showImage(activeIndex + 1)}
            className="absolute top-1/2 right-3 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-ink shadow-sm transition hover:bg-white disabled:pointer-events-none disabled:opacity-35"
          >
            <CaretRightIcon size={20} aria-hidden="true" />
          </button>
          <div className="absolute right-4 bottom-4 left-4 flex items-center justify-between gap-4">
            <div className="flex gap-1.5" aria-label="Product photos">
              {images.map((image, index) => (
                <button
                  key={`${image.src}-indicator-${index}`}
                  type="button"
                  aria-label={`Show photo ${index + 1}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                  onClick={() => showImage(index)}
                  className={clsx(
                    "h-1.5 rounded-full transition-[width,background-color]",
                    index === activeIndex
                      ? "w-7 bg-white"
                      : "w-1.5 bg-white/65 hover:bg-white",
                  )}
                />
              ))}
            </div>
            <p
              className="rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-white"
              aria-live="polite"
            >
              Photo {activeIndex + 1} of {images.length}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
