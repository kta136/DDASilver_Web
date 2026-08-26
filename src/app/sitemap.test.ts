import { describe, expect, it, vi } from "vitest";

const { getSitemapCatalog } = vi.hoisted(() => ({
  getSitemapCatalog: vi.fn(),
}));

vi.mock("@/sanity/lib/catalog", () => ({ getSitemapCatalog }));

import sitemap from "@/app/sitemap";

const image = {
  src: "/images/product.png",
  alt: "Silver product",
  width: 1254,
  height: 1254,
};

describe("sitemap metadata route", () => {
  it("includes product images and omits empty category and collection pages", async () => {
    getSitemapCatalog.mockResolvedValue({
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
          updatedAt: "2026-08-20T10:00:00.000Z",
        },
      ],
      categories: [
        {
          title: "Coin",
          slug: "coin",
          description: "Silver coins.",
          image,
          displayOrder: 1,
          updatedAt: "2026-08-01T10:00:00.000Z",
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
          updatedAt: "2026-08-02T10:00:00.000Z",
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
        lastModified: "2026-08-20T10:00:00.000Z",
      }),
    );
    expect(entries).toContainEqual(
      expect.objectContaining({
        url: "http://localhost:3000/collections/gifts",
        images: ["http://localhost:3000/images/product.png"],
        lastModified: "2026-08-20T10:00:00.000Z",
      }),
    );
    expect(entries).toContainEqual(
      expect.objectContaining({
        url: "http://localhost:3000/",
        lastModified: "2026-08-20T10:00:00.000Z",
      }),
    );
    expect(entries).toContainEqual(
      expect.objectContaining({
        url: "http://localhost:3000/products",
        lastModified: "2026-08-20T10:00:00.000Z",
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
