// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ catalog: vi.fn(), prices: vi.fn() }));
vi.mock("@/sanity/lib/catalog", () => ({ getPublishedCatalog: mocks.catalog }));
vi.mock("@/lib/pricing/service", () => ({ withGalleryPrices: mocks.prices }));
import { GET } from "./route";
beforeEach(() => vi.clearAllMocks());
describe("published gallery price feed", () => {
  it("returns only identifiers and calculated estimates, never pricing inputs", async () => {
    const products = [
      { _id: "p1", slug: "bowl", pricing: { makingChargePerGram: 10 } },
    ];
    mocks.catalog.mockResolvedValue({ source: "sanity", products });
    mocks.prices.mockResolvedValue([
      { ...products[0], estimate: { status: "unavailable" } },
    ]);
    const response = await GET();
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toMatchObject({
      schemaVersion: 1,
      items: [{ id: "p1", slug: "bowl", estimate: { status: "unavailable" } }],
    });
    expect(mocks.prices).toHaveBeenCalledWith(products);
  });
  it.each(["stale", "fallback"])(
    "does not publish estimates for %s catalog data",
    async (source) => {
      mocks.catalog.mockResolvedValue({ source, products: [] });
      expect((await GET()).status).toBe(503);
      expect(mocks.prices).not.toHaveBeenCalled();
    },
  );
  it("contains upstream errors", async () => {
    mocks.catalog.mockRejectedValue(new Error("private error"));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.text()).not.toContain("private");
  });
});
