import { describe, expect, it } from "vitest";
import { getHomepageCategories } from "@/lib/homepage-categories";
import type { Category } from "@/types/catalog";

const image = {
  src: "/category.png",
  alt: "Category image",
  width: 1254,
  height: 1254,
};
const category = (
  slug: string,
  overrides: Partial<Category> = {},
): Category => ({
  title: slug,
  slug,
  description: "Category description",
  image,
  displayOrder: 10,
  productCount: 1,
  ...overrides,
});

describe("homepage category configuration", () => {
  it("supports new categories, editorial ordering, hiding and empty categories", () => {
    const result = getHomepageCategories([
      category("new-range", { homepageOrder: 1 }),
      category("coin", { displayOrder: 0, homepageOrder: 2 }),
      category("hidden", { showOnHomepage: false }),
      category("empty", { productCount: 0 }),
    ]);
    expect(result.map(({ slug }) => slug)).toEqual(["new-range", "coin"]);
  });
  it("uses product imagery by default, allows editorial imagery and handles missing products", () => {
    const firstProductImage = { ...image, src: "/product.png" };
    const result = getHomepageCategories([
      category("a", { firstProductImage }),
      category("b", { firstProductImage, homepageImageSource: "category" }),
      category("c"),
    ]);
    expect(result.map(({ image }) => image.src)).toEqual([
      "/product.png",
      "/category.png",
      "/category.png",
    ]);
  });
});
