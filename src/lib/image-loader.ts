"use client";

import { getResponsiveSanityImageUrl } from "@/lib/sanity-image";

type ImageLoaderOptions = {
  src: string;
  width: number;
  quality?: number;
};

export default function imageLoader(options: ImageLoaderOptions) {
  return getResponsiveSanityImageUrl(options);
}
