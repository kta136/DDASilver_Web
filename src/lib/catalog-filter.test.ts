import { describe, expect, it } from "vitest";

import { fallbackProducts } from "@/data/catalog";
import { filterProducts } from "@/lib/catalog-filter";

describe("catalog filtering", () => {
  it("searches title and description case-insensitively", () => {
    const results = filterProducts(fallbackProducts, { query: "BRACELET" });
    expect(results.map((product) => product.slug)).toContain(
      "braided-silver-bracelet",
    );
  });

  it("matches word prefixes without false substring matches", () => {
    const results = filterProducts(fallbackProducts, { query: "ring" });
    expect(results.map((product) => product.slug)).toEqual([
      "engraved-silver-ring",
    ]);
  });

  it("combines category and collection filters", () => {
    const results = filterProducts(fallbackProducts, {
      category: "jewellery",
      collection: "celebration-edit",
    });
    expect(results).toHaveLength(2);
    expect(results.every((product) => product.categorySlug === "jewellery")).toBe(
      true,
    );
  });

  it("filters by purity", () => {
    const results = filterProducts(fallbackProducts, { purity: "99.80" });
    expect(results.map((product) => product.slug)).toEqual([
      "classic-silver-coin",
    ]);
  });

  it("filters idol construction within the idols category", () => {
    const results = filterProducts(fallbackProducts, {
      category: "idols",
      idolConstruction: "semi-solid",
    });
    expect(results.map((product) => product.slug)).toEqual([
      "silver-diya-lamp",
    ]);
  });

  it("filters coin shape within the coin category", () => {
    const results = filterProducts(fallbackProducts, {
      category: "coin",
      coinShape: "round",
    });
    expect(results.map((product) => product.slug)).toEqual([
      "classic-silver-coin",
    ]);
  });

  it("preserves editorial display order", () => {
    const results = filterProducts(fallbackProducts.toReversed(), {});
    expect(results[0]?.displayOrder).toBe(1);
  });
});
