import { describe, expect, it } from "vitest";

import {
  getCatalogPageStructuredData,
  getCategorySeoName,
  getPopulatedCategories,
  getPopulatedCollections,
  getProductPageStructuredData,
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
].map(({ title, slug }, displayOrder): Category => ({
  title,
  slug,
  description: `${title} products`,
  image,
  displayOrder,
}));

const collections = [
  { title: "Gifts", slug: "gifts" },
  { title: "Coming Soon", slug: "coming-soon" },
].map(({ title, slug }, displayOrder): Collection => ({
  title,
  slug,
  description: `${title} collection`,
  heroImage: image,
  productSlugs: [],
  displayOrder,
}));

describe("catalog SEO helpers", () => {
  it("does not label gold categories as silver or duplicate the material", () => {
    expect(
      getCategorySeoName({
        title: "Gold Coins & Bars",
        slug: "gold",
        productKind: "gold",
      }),
    ).toBe("Gold Coins & Bars");
    expect(getCategorySeoName({ title: "Silver Gifts", slug: "gifts" })).toBe(
      "Silver Gifts",
    );
    expect(getCategorySeoName({ title: "Utensils", slug: "utensils" })).toBe(
      "Silver Utensils",
    );
  });
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
      { "@type": "PropertyValue", name: "Shape", value: "Round" },
    ]);
  });

  it("describes Gold material and 99.50% purity", () => {
    expect(
      getProductStructuredDataProperties({
        ...product,
        title: "Gold Coin",
        categorySlug: "gold",
        material: "gold",
        purity: "99.50",
      }),
    ).toEqual([
      { "@type": "PropertyValue", name: "Material", value: "Gold" },
      { "@type": "PropertyValue", name: "Gold purity", value: "99.50%" },
      { "@type": "PropertyValue", name: "Weight", value: "50 g" },
      { "@type": "PropertyValue", name: "Shape", value: "Round" },
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
            name: "Silver Coin, 50 g",
          },
        ],
      },
    });
    expect(JSON.stringify(structuredData)).not.toContain('"@type":"Product"');
  });

  it("describes unpriced enquiry pages without invalid Product markup", () => {
    const structuredData = getProductPageStructuredData({
      ...product,
      reference: "COIN-50",
    });
    expect(structuredData).toMatchObject({
      "@type": "WebPage",
      url: "http://localhost:3000/products/silver-coin",
      mainEntity: {
        "@type": "Thing",
        name: "Silver Coin, 50 g",
        identifier: "COIN-50",
        description: expect.stringContaining("Silver purity: 99.80%. Weight: 50 g"),
      },
    });
    const json = JSON.stringify(structuredData);
    expect(json).not.toMatch(/"(?:offers|aggregateRating|review)":/);
    expect(json).not.toContain('"@type":"Product"');
    expect(json).not.toContain("5500");
  });

  const now = Date.parse("2026-09-10T10:00:00Z");
  const pricedProduct: Product = {
    ...product,
    estimate: {
      status: "available", mode: "automatic", currency: "INR",
      minimum: 5500, maximum: 5500, asOf: new Date(now - 60_000).toISOString(),
      lastAvailable: false, sizes: [],
    },
  };

  it("uses the displayed rupee price without inventing reviews or stock", () => {
    const schema = getProductPageStructuredData(pricedProduct, now);
    expect(schema).toMatchObject({
      "@type": "Product",
      offers: [{ "@type": "Offer", price: "5500.00", priceCurrency: "INR",
        url: "http://localhost:3000/products/silver-coin" }],
    });
    expect(JSON.stringify(schema)).not.toMatch(/"(?:availability|review|aggregateRating|priceValidUntil)":/);
  });

  it("publishes each visible size price without using AggregateOffer", () => {
    const estimate = pricedProduct.estimate!;
    if (estimate.status !== "available") throw new Error("Expected priced fixture");
    const schema = getProductPageStructuredData({ ...product, estimate: {
      ...estimate, maximum: 9900, sizes: [
        { weightGrams: 50, diameterInches: 4, amount: 5500 },
        { weightGrams: 100, diameterInches: 6, amount: 9900 },
      ],
    } }, now);
    expect("offers" in schema && schema.offers).toMatchObject([
      { name: "50 g / 4 in", price: "5500.00" },
      { name: "100 g / 6 in", price: "9900.00" },
    ]);
    expect(JSON.stringify(schema)).not.toContain("AggregateOffer");
  });

  it("omits unavailable, fallback, stale and malformed prices", () => {
    const estimate = pricedProduct.estimate!;
    if (estimate.status !== "available") throw new Error("Expected priced fixture");
    for (const value of [
      { status: "unavailable" as const },
      { ...estimate, lastAvailable: true },
      { ...estimate, asOf: new Date(now - 390_001).toISOString() },
      { ...estimate, asOf: "invalid" },
      { ...estimate, asOf: new Date(now + 1).toISOString() },
      { ...estimate, minimum: 0, maximum: 0 },
      { ...estimate, minimum: Number.NaN },
      { ...estimate, maximum: 9900 },
    ]) {
      const schema = getProductPageStructuredData({ ...product, estimate: value }, now);
      expect(schema["@type"]).toBe("WebPage");
      expect(schema).not.toHaveProperty("offers");
    }
  });

  it("keeps manually reviewed prices eligible beyond the live-rate window", () => {
    const estimate = pricedProduct.estimate!;
    if (estimate.status !== "available") throw new Error("Expected priced fixture");
    expect(getProductPageStructuredData({ ...product, estimate: {
      ...estimate, mode: "manual", asOf: "2026-08-01T10:00:00Z",
    } }, now)["@type"]).toBe("Product");
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
