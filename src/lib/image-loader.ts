"use client";

import { getResponsiveSanityImageUrl } from "@/lib/sanity-image";

type ImageLoaderOptions = {
  src: string;
  width: number;
  quality?: number;
};

const brandMarkSource = "/brand/dda-family-mark-v1.webp";
const brandMarkWidths = [64, 96, 128, 192, 256] as const;

function getBrandMarkUrl(width: number) {
  const targetWidth =
    brandMarkWidths.find((candidate) => candidate >= width) ??
    brandMarkWidths.at(-1);
  return `/brand/dda-family-mark-v1-${targetWidth}w.webp`;
}

export default function imageLoader(options: ImageLoaderOptions) {
  if (options.src === "/images/design/homepage-b-editorial.png") {
    const width =
      [480, 768, 1024, 1536].find((value) => value >= options.width) ?? 1536;
    return `/images/design/homepage-b-editorial-${width}w.webp`;
  }
  if (options.src === brandMarkSource) {
    return getBrandMarkUrl(options.width);
  }
  return getResponsiveSanityImageUrl(options);
}
