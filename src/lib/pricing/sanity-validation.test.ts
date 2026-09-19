// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  auditPricingCoverage,
  preparePricingWrites,
  validatePricingWrite,
} from "./sanity-validation";
type Client = Parameters<typeof validatePricingWrite>[0];
const product = {
  _id: "product-a",
  _type: "product",
  title: "Silver item",
  weightGrams: 20,
  category: { _ref: "category-a" },
  categoryMakingChargePerGram: 10,
};
describe("pricing coverage safeguards", () => {
  it("prevents a category edit from removing inherited making charges", async () => {
    const fetcher = vi.fn(async (query: string) =>
      query.includes("[0].enabled") ? true : [product],
    );
    const client = { fetch: fetcher } as unknown as Client;
    expect(
      await validatePricingWrite(client, {
        _id: "drafts.category-a",
        _type: "category",
      }),
    ).toContain("products need pricing");
    expect(
      await validatePricingWrite(client, {
        _id: "category-a",
        _type: "category",
        makingChargePerGram: 0,
      }),
    ).toBe(true);
    expect(
      await validatePricingWrite(client, {
        _id: "category-a",
        _type: "category",
        pricingDeferred: true,
      }),
    ).toBe(true);
  });
  it("blocks activation for bad weights and invalid pricing without discarding audit rows", async () => {
    const client = {
      fetch: vi.fn().mockResolvedValue([
        { ...product, weightGrams: 0 },
        { ...product, _id: "product-b", sizeVariants: "broken" },
      ]),
    } as unknown as Client;
    expect((await auditPricingCoverage(client)).failures).toHaveLength(2);
    expect(
      await validatePricingWrite(client, {
        _id: "gallery-pricing",
        _type: "galleryPricing",
        enabled: true,
      }),
    ).toContain("2 products");
  });
  it("preserves manual totals through replacement imports and rejects incomplete new products", async () => {
    const pricing = {
      mode: "manual",
      reviewedAt: "2026-09-01T00:00:00Z",
      reviewDueAt: "2026-10-01T00:00:00Z",
      manualTotalInr: 1000,
    };
    const client = {
      fetch: vi.fn(async (query: string) => {
        if (query.includes("$ids")) return [{ _id: product._id, pricing }];
        if (query.includes("[0].enabled")) return true;
        return {};
      }),
    } as unknown as Client;
    const documents = [{ ...product }];
    await preparePricingWrites(client, documents);
    expect(documents[0]).toHaveProperty("pricing", pricing);
    await expect(
      preparePricingWrites(client, [{ ...product, _id: "new-product" }]),
    ).rejects.toThrow("making charge");
  });
});
