export async function register() {
  // The worker belongs to the persistent Node runtime, never build workers or Edge.
  // An explicit pricing volume opts local servers into the same behaviour.
  if (
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.NEXT_PHASE !== "phase-production-build" &&
    process.env.GALLERY_PRICING_DIR?.trim()
  ) {
    const runtime = globalThis as typeof globalThis & {
      ddaGalleryPricingWorker?: () => void;
    };
    if (!runtime.ddaGalleryPricingWorker) {
      const { startGalleryPricingWorker } = await import("./lib/pricing/background");
      runtime.ddaGalleryPricingWorker ??= startGalleryPricingWorker();
    }
  }
}
