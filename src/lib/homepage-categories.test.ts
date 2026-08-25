import { describe, expect, it } from "vitest";

import {
  getHomepageCategories,
  homepageCategorySlugs,
} from "@/lib/homepage-categories";
import type { CatalogImage, Category, Product } from "@/types/catalog";

const categorySlugs = [
  "jewellery",
  "gold",
  "utensils",
  "jhula",
  "gifts",
  "purse",
  "idols",
  "coin",
];

function image(src: string): CatalogImage {
  return { src, alt: src, width: 1254, height: 1254 };
}

const categories = categorySlugs.map(
  (slug, displayOrder): Category => ({
    title: slug,
    slug,
    description: `${slug} products`,
    image: image(`/category/${slug}.png`),
    displayOrder,
  }),
);

function product(categorySlug: string, slug = `${categorySlug}-product`): Product {
  return {
    title: slug,
    slug,
    shortDescription: `${slug} description`,
    images: [image(`/gallery/${slug}.png`)],
    categorySlug,
    collectionSlugs: [],
    featured: false,
    displayOrder: 1,
    deities: [],
  };
}

describe("homepage category images", () => {
  it("uses real gallery images for Coin, Idols, Gifts, and Utensils only", () => {
    const products = categorySlugs.map((slug) => product(slug));

    const result = getHomepageCategories(categories, products);

    expect(result.map((category) => category.slug)).toEqual(
      homepageCategorySlugs,
    );

    for (const slug of ["coin", "idols", "gifts", "utensils"]) {
      expect(result.find((category) => category.slug === slug)?.image.src).toBe(
        `/gallery/${slug}-product.png`,
      );
    }
    for (const slug of ["purse", "jhula", "gold"]) {
      expect(result.find((category) => category.slug === slug)?.image.src).toBe(
        `/category/${slug}.png`,
      );
    }
    expect(result.some((category) => category.slug === "jewellery")).toBe(
      false,
    );
  });

  it("keeps the category image when no product exists and uses the first gallery item", () => {
    const result = getHomepageCategories(categories, [
      product("coin", "first-coin"),
      product("coin", "second-coin"),
    ]);

    expect(result.map((category) => category.slug)).toEqual(
      homepageCategorySlugs,
    );
    expect(result.find((category) => category.slug === "coin")?.image.src).toBe(
      "/gallery/first-coin.png",
    );
    expect(result.find((category) => category.slug === "idols")?.image.src).toBe(
      "/category/idols.png",
    );
  });

  it("restores homepage categories from the published fallback when the primary catalog is incomplete", () => {
    const primaryCategories = categories.filter((category) =>
      ["jewellery", "coin", "idols", "gifts", "utensils"].includes(
        category.slug,
      ),
    );

    const result = getHomepageCategories(
      primaryCategories,
      categorySlugs.map((slug) => product(slug)),
      categories,
    );

    expect(result.map((category) => category.slug)).toEqual(
      homepageCategorySlugs,
    );
    expect(result.find((category) => category.slug === "purse")?.image.src).toBe(
      "/category/purse.png",
    );
    expect(result.find((category) => category.slug === "jhula")?.image.src).toBe(
      "/category/jhula.png",
    );
    expect(result.find((category) => category.slug === "gold")?.image.src).toBe(
      "/category/gold.png",
    );
  });
});
