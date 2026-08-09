import { describe, expect, it, vi } from "vitest";

const { getPublishedCatalog } = vi.hoisted(() => ({
  getPublishedCatalog: vi.fn(),
}));

vi.mock("@/sanity/lib/catalog", () => ({ getPublishedCatalog }));

import sitemap from "@/app/sitemap";

const image = {
  src: "/images/product.png",
  alt: "Silver product",
  width: 1254,
  height: 1254,
};

describe("sitemap metadata route", () => {
  it("includes product images and omits empty category and collection pages", async () => {
    getPublishedCatalog.mockResolvedValue({
      source: "fallback",
      products: [
        {
          title: "Silver Coin",
          slug: "silver-coin",
          shortDescription: "A silver coin.",
          images: [image],
          categorySlug: "coin",
          collectionSlugs: ["gifts"],
          featured: false,
          displayOrder: 1,
          deities: [],
        },
      ],
      categories: [
        {
          title: "Coin",
          slug: "coin",
          description: "Silver coins.",
          image,
          displayOrder: 1,
        },
        {
          title: "Purse",
          slug: "purse",
          description: "Silver purses.",
          image,
          displayOrder: 2,
        },
      ],
      collections: [
        {
          title: "Gifts",
          slug: "gifts",
          description: "Silver gifts.",
          heroImage: image,
          productSlugs: ["silver-coin"],
          displayOrder: 1,
        },
        {
          title: "Coming Soon",
          slug: "coming-soon",
          description: "Upcoming products.",
          heroImage: image,
          productSlugs: [],
          displayOrder: 2,
        },
      ],
    });

    const entries = await sitemap();

    expect(entries).toContainEqual(
      expect.objectContaining({
        url: "http://localhost:3000/products/silver-coin",
        images: ["http://localhost:3000/images/product.png"],
      }),
    );
    expect(entries).toContainEqual(
      expect.objectContaining({
        url: "http://localhost:3000/category/coin",
        images: ["http://localhost:3000/images/product.png"],
      }),
    );
    expect(entries).toContainEqual(
      expect.objectContaining({
        url: "http://localhost:3000/collections/gifts",
        images: ["http://localhost:3000/images/product.png"],
      }),
    );
    expect(entries.map((entry) => entry.url)).not.toContain(
      "http://localhost:3000/category/purse",
    );
    expect(entries.map((entry) => entry.url)).not.toContain(
      "http://localhost:3000/collections/coming-soon",
    );
  });
});
