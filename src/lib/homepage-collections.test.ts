import { describe, expect, it } from "vitest";

import { getHomepageCollections } from "@/lib/homepage-collections";
import type { Collection } from "@/types/catalog";

const image = {
  src: "/collection.png",
  alt: "Silver collection",
  width: 1254,
  height: 1254,
};
const collection = (
  slug: string,
  displayOrder: number,
  overrides: Partial<Collection> = {},
): Collection => ({
  title: slug,
  slug,
  description: "Collection description",
  heroImage: image,
  productSlugs: [],
  displayOrder,
  ...overrides,
});

describe("homepage collection links", () => {
  it("shows populated collections in catalog order and omits empty ones", () => {
    const result = getHomepageCollections([
      collection("later", 4, { productSlugs: ["a"], productCount: 1 }),
      collection("tie-z", 2, { productSlugs: ["c"], productCount: 1 }),
      collection("empty", 1, { productCount: 0 }),
      collection("first", 1, { productSlugs: ["b"] }),
      collection("tie-a", 2, { productSlugs: ["d"], productCount: 1 }),
      collection("fallback-empty", 5),
    ]);

    expect(result.map(({ slug }) => slug)).toEqual([
      "first",
      "tie-z",
      "tie-a",
      "later",
    ]);
  });
});
