import { afterEach, describe, expect, it, vi } from "vitest";

import {
  formatGuideProductExample,
  loadPublishedGuideProductExamples,
} from "@/lib/guide-product-examples";
import { fallbackProducts } from "@/data/catalog";

afterEach(() => vi.restoreAllMocks());

describe("published product examples in guides", () => {
  it("formats only published catalog specifications", () => {
    const bottle = {
      ...fallbackProducts[0]!,
      title: "Butterfly Relief Silver Bottle",
      purity: "92.5" as const,
      weightGrams: 340,
      heightInches: 10,
    };
    const plate = {
      ...fallbackProducts[0]!,
      title: "Mini Concentric-Line Silver Plate",
      purity: "99.80" as const,
      weightGrams: 50,
      diameterInches: 4,
    };

    expect(formatGuideProductExample(bottle)).toBe(
      "Butterfly Relief Silver Bottle — 92.5% purity, 340 g, height 10 in",
    );
    expect(formatGuideProductExample(plate)).toBe(
      "Mini Concentric-Line Silver Plate — 99.80% purity, 50 g, diameter 4 in",
    );
  });

  it("omits missing examples and keeps guides available if an optional lookup fails", async () => {
    const product = fallbackProducts[0]!;
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const results = await loadPublishedGuideProductExamples(
      ["published", "unpublished", "temporarily-unavailable"],
      async (slug) => {
        if (slug === "published") return product;
        if (slug === "temporarily-unavailable") throw new Error("offline");
        return undefined;
      },
    );

    expect(results).toEqual([product]);
    expect(warning).toHaveBeenCalledWith(
      "[guides] Optional published product example unavailable: temporarily-unavailable",
    );
  });
});
