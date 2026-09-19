import { cache } from "react";
import { after, connection } from "next/server";
import type { Product } from "@/types/catalog";
import { getGalleryPricingSettings, getGalleryRateStore } from "./configuration";
import { pricingHealth } from "./health";
import { calculateEstimate } from "./model";
import { fetchGalleryReference } from "./upstream";

export { getGalleryPricingSettings, getGalleryRateStore } from "./configuration";

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
    lastAvailable:
      stored.record?.refresh.outcome !== "accepted" &&
      stored.record?.reference?.marketStatus !== "closed",
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
  return pricingHealth(
    store ? await store.read() : { record: null, recovery: "missing" },
  );
}
