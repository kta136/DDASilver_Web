"use client";

import {
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import Image from "next/image";
import {
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import type { CatalogImage } from "@/types/catalog";

type ProductGalleryProps = {
  images: CatalogImage[];
  containImages?: boolean;
  highPriority?: boolean;
};

const pointerZoomScale = 1.4;

export function ProductGallery({
  images,
  containImages = false,
  highPriority = false,
}: ProductGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const zoomedImageRef = useRef<HTMLImageElement>(null);
  const zoomBoundsRef = useRef<DOMRect>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = images.length > 1;

  function resetZoom() {
    const image = zoomedImageRef.current;

    if (image) {
      image.style.transform = "";
      image.style.transformOrigin = "";
      image.style.willChange = "";
    }

    zoomedImageRef.current = null;
    zoomBoundsRef.current = null;
  }

  function updateZoom(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") {
      return;
    }

    const image = zoomedImageRef.current;
    const bounds = zoomBoundsRef.current;

    if (!image || !bounds || bounds.width === 0 || bounds.height === 0) {
      return;
    }

    const x = Math.min(
      Math.max(((event.clientX - bounds.left) / bounds.width) * 100, 0),
      100,
    );
    const y = Math.min(
      Math.max(((event.clientY - bounds.top) / bounds.height) * 100, 0),
      100,
    );

    image.style.transformOrigin = `${x}% ${y}%`;
    image.style.transform = `scale(${pointerZoomScale})`;
  }

  function startZoom(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") {
      return;
    }

    zoomedImageRef.current =
      event.currentTarget.querySelector<HTMLImageElement>("img");
    zoomBoundsRef.current = event.currentTarget.getBoundingClientRect();

    if (zoomedImageRef.current) {
      zoomedImageRef.current.style.willChange = "transform";
    }
  }

  function showImage(index: number) {
    const nextIndex = Math.min(Math.max(index, 0), images.length - 1);
    const scroller = scrollerRef.current;

    resetZoom();
    setActiveIndex(nextIndex);
    scroller?.scrollTo({
      left: nextIndex * scroller.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative min-w-0 bg-[#ebe7e2] lg:h-full">
      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] lg:h-full [&::-webkit-scrollbar]:hidden"
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
            className="relative aspect-[4/5] min-w-full cursor-zoom-in snap-center snap-always overflow-hidden sm:aspect-[16/13] lg:h-full lg:min-h-0 lg:aspect-auto"
            onPointerEnter={startZoom}
            onPointerMove={updateZoom}
            onPointerLeave={resetZoom}
            onPointerCancel={resetZoom}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              fetchPriority={highPriority && index === 0 ? "high" : undefined}
              sizes="(max-width: 1024px) 100vw, 58vw"
              className={clsx(
                containImages ? "object-contain" : "object-cover",
                "transition-transform duration-150 ease-out motion-reduce:transition-none",
              )}
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
