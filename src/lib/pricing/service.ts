import { cache } from "react";
import { after, connection } from "next/server";
import { join } from "node:path";
import { z } from "zod";
import { isSanityConfigured } from "@/sanity/env";
import { sanityClient } from "@/sanity/lib/client";
import { createSanityReader } from "@/sanity/lib/read";
import type { Product } from "@/types/catalog";
import { calculateEstimate } from "./model";
import { GalleryRateStore } from "./store";
import { fetchGalleryReference } from "./upstream";

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

const getPricingContext = cache(async () => {
  // Always opt these pages into request-time composition, even before activation.
  // Enabling pricing later must not turn a previously static route dynamic during ISR.
  await connection();
  const settings = await getGalleryPricingSettings();
  if (!settings.enabled) return null;
  const store = getGalleryRateStore();
  const stored = store
    ? await store.read()
    : { record: null, recovery: "missing" };
  if (
    store &&
    (!stored.record || stored.record.refresh.nextAttemptAt <= Date.now())
  )
    after(() => store.refresh(fetchGalleryReference).then(() => undefined));
  if (!stored.record?.reference || stored.recovery === "backup")
    console.warn(
      `[gallery-pricing] Reference ${stored.recovery}; product content remains available.`,
    );
  return {
    reference: stored.record?.reference ?? null,
    lastAvailable: stored.record?.refresh.outcome !== "accepted",
  };
});

export async function withGalleryPrices(
  products: Product[],
): Promise<Product[]> {
  const context = await getPricingContext();
  if (!context) return products;
  return products.map((product) => ({
    ...product,
    estimate: calculateEstimate(
      product,
      context.reference,
      context.lastAvailable,
    ),
  }));
}

export async function galleryPricingHealth() {
  const store = getGalleryRateStore();
  const state = store
    ? await store.read()
    : { record: null, recovery: "missing" };
  const reference = state.record?.reference;
  const age = reference
    ? Math.max(
        0,
        Math.floor((Date.now() - Date.parse(reference.snapshotAsOf)) / 1_000),
      )
    : null;
  return {
    status: !reference
      ? "unavailable"
      : state.record!.refresh.outcome !== "accepted" ||
          state.recovery === "backup" ||
          age! > 390
        ? "degraded"
        : "ok",
    snapshotAsOf: reference?.snapshotAsOf ?? null,
    referenceAgeSeconds: age,
    nextAttemptAt: state.record?.refresh.nextAttemptAt ?? null,
  };
}
