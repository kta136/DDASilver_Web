import { cache } from "react";
import { join } from "node:path";
import { z } from "zod";
import { isSanityConfigured } from "@/sanity/env";
import { sanityClient } from "@/sanity/lib/client";
import { createSanityReader } from "@/sanity/lib/read";
import { GalleryRateStore } from "./store";

const reader = createSanityReader(sanityClient);
export const getGalleryPricingSettings = cache(async () => {
  if (!isSanityConfigured) return { enabled: false };
  try {
    const result = await reader(
      '*[_type == "galleryPricing" && _id == "gallery-pricing"][0]{enabled}',
      {},
      (raw) => ({
        value:
          raw === null
            ? { enabled: false }
            : z.object({ enabled: z.boolean() }).parse(raw),
      }),
    );
    return result.value;
  } catch {
    console.warn("[gallery-pricing] Settings unavailable.");
    return { enabled: false };
  }
});

export function getGalleryRateStore() {
  // Production activation requires an explicit persistent mount. Local development can use an ignored directory.
  const directory =
    process.env.GALLERY_PRICING_DIR?.trim() ||
    (process.env.NEXT_PUBLIC_SITE_ENV !== "production"
      ? join(process.cwd(), ".gallery-pricing")
      : "");
  return directory ? new GalleryRateStore(directory) : null;
}
