import { describe, expect, it } from "vitest";

import { fallbackProducts } from "@/data/catalog";
import {
  filterProducts,
  getCatalogFilterAvailability,
} from "@/lib/catalog-filter";

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

  it("combines category and purity filters", () => {
    const results = filterProducts(fallbackProducts, {
      category: "jewellery",
      purity: "92.5",
    });
    expect(results).toHaveLength(4);
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

  it("filters idols by any referenced deity", () => {
    const idol = fallbackProducts.find(
      (product) => product.categorySlug === "idols",
    )!;
    const products = [
      {
        ...idol,
        title: "Shiva Family",
        slug: "shiva-family",
        deities: [
          { title: "Shiva", slug: "shiva" },
          { title: "Parvati", slug: "parvati" },
        ],
      },
      {
        ...idol,
        title: "Bal Krishna",
        slug: "bal-krishna",
        deities: [{ title: "Krishna", slug: "krishna" }],
      },
    ];

    const results = filterProducts(products, {
      category: "idols",
      deitySlug: "parvati",
    });

    expect(results.map((product) => product.slug)).toEqual(["shiva-family"]);
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

  it("only exposes filter values backed by products in the category", () => {
    const availability = getCatalogFilterAvailability(
      fallbackProducts,
      "coin",
    );

    expect([...availability.purities]).toEqual(["99.80"]);
    expect([...availability.coinShapes]).toEqual(["round"]);
    expect([...availability.idolConstructions]).toEqual([]);
    expect([...availability.deities]).toEqual([]);
  });

  it("preserves editorial display order", () => {
    const results = filterProducts(fallbackProducts.toReversed(), {});
    expect(results[0]?.displayOrder).toBe(1);
  });
});
