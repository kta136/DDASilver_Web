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

  it("filters utensils by customer-facing item type", () => {
    const bowl = fallbackProducts.find(
      (product) => product.categorySlug === "utensils",
    )!;
    const plate = {
      ...bowl,
      title: "Concentric-Line Silver Plate",
      slug: "concentric-line-silver-plate",
      utensilType: "plate" as const,
    };

    const results = filterProducts([bowl, plate], {
      category: "utensils",
      utensilType: "plate",
    });

    expect(results.map((product) => product.slug)).toEqual([
      "concentric-line-silver-plate",
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

  it("only exposes utensil item types backed by utensils", () => {
    const bowl = fallbackProducts.find(
      (product) => product.categorySlug === "utensils",
    )!;
    const plate = {
      ...bowl,
      slug: "silver-plate",
      utensilType: "plate" as const,
    };
    const availability = getCatalogFilterAvailability(
      [bowl, plate],
      "utensils",
    );

    expect([...availability.utensilTypes]).toEqual(["bowl", "plate"]);
  });

  it("preserves editorial display order", () => {
    const results = filterProducts(fallbackProducts.toReversed(), {});
    expect(results[0]?.displayOrder).toBe(1);
  });

  it("sorts the full matching list by weight and leaves missing weights last", () => {
    const products = [
      { ...fallbackProducts[0]!, slug: "heavy", weightGrams: 50 },
      { ...fallbackProducts[1]!, slug: "unknown", weightGrams: undefined },
      { ...fallbackProducts[2]!, slug: "light", weightGrams: 5 },
    ];

    expect(
      filterProducts(products, { sort: "weight-asc" }).map(
        (product) => product.slug,
      ),
    ).toEqual(["light", "heavy", "unknown"]);
    expect(
      filterProducts(products, { sort: "weight-desc" }).map(
        (product) => product.slug,
      ),
    ).toEqual(["heavy", "light", "unknown"]);
  });

  it("sorts available prices by their displayed minimum and keeps unavailable last", () => {
    const products = [
      {
        ...fallbackProducts[0]!,
        slug: "price-range",
        estimate: {
          status: "available" as const,
          mode: "automatic" as const,
          currency: "INR" as const,
          minimum: 1000,
          maximum: 2000,
          asOf: "2026-09-01T00:00:00.000Z",
          validUntil: "2026-10-01T00:00:00.000Z",
          lastAvailable: false,
          sizes: [],
        },
      },
      {
        ...fallbackProducts[1]!,
        slug: "price-500",
        estimate: {
          status: "available" as const,
          mode: "automatic" as const,
          currency: "INR" as const,
          minimum: 500,
          maximum: 500,
          asOf: "2026-09-01T00:00:00.000Z",
          validUntil: "2026-10-01T00:00:00.000Z",
          lastAvailable: false,
          sizes: [],
        },
      },
      {
        ...fallbackProducts[2]!,
        slug: "unpriced",
        estimate: { status: "unavailable" as const },
      },
    ];

    expect(
      filterProducts(products, { sort: "price-asc" }).map(
        (product) => product.slug,
      ),
    ).toEqual(["price-500", "price-range", "unpriced"]);
    expect(
      filterProducts(products, { sort: "price-desc" }).map(
        (product) => product.slug,
      ),
    ).toEqual(["price-range", "price-500", "unpriced"]);
  });

  it("uses the lightest variant weight for weight sorting", () => {
    const products = [
      {
        ...fallbackProducts[0]!,
        slug: "variants",
        weightGrams: undefined,
        sizeVariants: [
          { weightGrams: 450, diameterInches: 4 },
          { weightGrams: 350, diameterInches: 3 },
        ],
      },
      { ...fallbackProducts[1]!, slug: "middle", weightGrams: 400 },
    ];

    expect(
      filterProducts(products, { sort: "weight-asc" }).map(
        (product) => product.slug,
      ),
    ).toEqual(["variants", "middle"]);
  });
});
