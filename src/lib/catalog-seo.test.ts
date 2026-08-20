import { describe, expect, it } from "vitest";

import {
  getCatalogPageStructuredData,
  getPopulatedCategories,
  getPopulatedCollections,
  getProductStructuredDataProperties,
} from "@/lib/catalog-seo";
import type { Category, Collection, Product } from "@/types/catalog";

const image = {
  src: "/images/product.png",
  alt: "Silver product",
  width: 1254,
  height: 1254,
};

const product: Product = {
  title: "Silver Coin",
  slug: "silver-coin",
  shortDescription: "A silver coin.",
  images: [image],
  categorySlug: "coin",
  collectionSlugs: ["gifts"],
  featured: false,
  displayOrder: 1,
  purity: "99.80",
  weightGrams: 50,
  coinShape: "round",
  deities: [],
};

const categories = [
  { title: "Coin", slug: "coin" },
  { title: "Purse", slug: "purse" },
].map(
  ({ title, slug }, displayOrder): Category => ({
    title,
    slug,
    description: `${title} products`,
    image,
    displayOrder,
  }),
);

const collections = [
  { title: "Gifts", slug: "gifts" },
  { title: "Coming Soon", slug: "coming-soon" },
].map(
  ({ title, slug }, displayOrder): Collection => ({
    title,
    slug,
    description: `${title} collection`,
    heroImage: image,
    productSlugs: [],
    displayOrder,
  }),
);

describe("catalog SEO helpers", () => {
  it("keeps only categories and collections backed by published products", () => {
    expect(getPopulatedCategories(categories, [product])).toEqual([
      categories[0],
    ]);
    expect(getPopulatedCollections(collections, [product])).toEqual([
      collections[0],
    ]);
  });

  it("maps visible product facts to honest structured-data properties", () => {
    expect(getProductStructuredDataProperties(product)).toEqual([
      { "@type": "PropertyValue", name: "Silver purity", value: "99.80%" },
      { "@type": "PropertyValue", name: "Weight", value: "50 g" },
      { "@type": "PropertyValue", name: "Coin shape", value: "Round" },
    ]);
  });

  it("describes catalog pages as ordered lists of canonical products", () => {
    const structuredData = getCatalogPageStructuredData({
      name: "Silver coins in Agra",
      description: "Explore silver coins from DDA Silver.",
      path: "/category/coin",
      products: [
        {
          ...product,
          title: "SKU-50 — Silver Coin",
          reference: "SKU-50",
        },
      ],
    });

    expect(structuredData).toMatchObject({
      "@type": "CollectionPage",
      "@id": "http://localhost:3000/category/coin#collection-page",
      url: "http://localhost:3000/category/coin",
      isPartOf: { "@id": "http://localhost:3000/#website" },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 1,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            url: "http://localhost:3000/products/silver-coin",
            item: {
              "@type": "Product",
              "@id":
                "http://localhost:3000/products/silver-coin#product",
              name: "Silver Coin",
              url: "http://localhost:3000/products/silver-coin",
            },
          },
        ],
      },
    });
  });

  it("keeps large catalog structured data bounded", () => {
    const products = Array.from({ length: 101 }, (_, index) => ({
      ...product,
      slug: `silver-coin-${index + 1}`,
      displayOrder: index + 1,
    }));
    const structuredData = getCatalogPageStructuredData({
      name: "Silver products in Agra",
      description: "Explore silver products from DDA Silver.",
      path: "/products",
      products,
    });

    expect(structuredData.mainEntity.numberOfItems).toBe(101);
    expect(structuredData.mainEntity.itemListElement).toHaveLength(100);
  });
});
