// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/types/catalog";
const mocks = vi.hoisted(() => ({
  after: vi.fn(),
  connection: vi.fn(),
  read: vi.fn(),
  refresh: vi.fn(),
  enabled: true,
}));
vi.mock("next/server", () => ({
  after: mocks.after,
  connection: mocks.connection,
}));
vi.mock("@/sanity/env", () => ({ isSanityConfigured: true }));
vi.mock("@/sanity/lib/client", () => ({ sanityClient: {} }));
vi.mock("@/sanity/lib/read", () => ({
  createSanityReader: () => async () => ({ value: { enabled: mocks.enabled } }),
}));
vi.mock("./store", () => ({
  GalleryRateStore: class {
    read = mocks.read;
    refresh = mocks.refresh;
  },
}));
vi.mock("./upstream", () => ({ fetchGalleryReference: vi.fn() }));
import { withGalleryPrices, galleryPricingHealth } from "./service";
afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  mocks.enabled = true;
});
describe("request-time price composition", () => {
  it("renders the saved estimate immediately and defers the due network refresh until after the response", async () => {
    vi.stubEnv("GALLERY_PRICING_DIR", "fixture");
    const reference = {
      itemId: "silver",
      unit: "PER_KG",
      value: 100000,
      snapshotAsOf: "2026-01-01T00:00:00Z",
    };
    mocks.read.mockResolvedValue({
      recovery: "primary",
      record: { reference, refresh: { nextAttemptAt: 1, outcome: "failed" } },
    });
    mocks.refresh.mockResolvedValue("accepted");
    const products = [
      { weightGrams: 10, categoryMakingChargePerGram: 5 },
      { weightGrams: 20, categoryMakingChargePerGram: 5 },
    ] as Product[];
    const result = await withGalleryPrices(products);
    expect(mocks.read).toHaveBeenCalledTimes(1);
    expect(mocks.connection).toHaveBeenCalledOnce();
    expect(mocks.refresh).not.toHaveBeenCalled();
    expect(result.map((product) => product.estimate)).toMatchObject([
      { minimum: 1050, asOf: reference.snapshotAsOf, lastAvailable: true },
      { minimum: 2100, asOf: reference.snapshotAsOf },
    ]);
    await mocks.after.mock.calls[0][0]();
    expect(mocks.refresh).toHaveBeenCalledOnce();
    expect((await galleryPricingHealth()).status).toBe("degraded");
  });
  it("still declares dynamic composition while disabled, avoiding static-to-dynamic changes on activation", async () => {
    mocks.enabled = false;
    const products = [] as Product[];
    expect(await withGalleryPrices(products)).toBe(products);
    expect(mocks.connection).toHaveBeenCalledOnce();
    expect(mocks.read).not.toHaveBeenCalled();
  });
});
