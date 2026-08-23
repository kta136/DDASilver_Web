import { describe, expect, it, vi } from "vitest";

import { fallbackProducts } from "@/data/catalog";
import {
  sanityDataset,
  sanityProjectId,
} from "@/sanity/env";
import { fetchCatalog } from "@/sanity/lib/catalog";

type CatalogClient = Parameters<typeof fetchCatalog>[0];

function asCatalogClient(value: unknown) {
  return value as CatalogClient;
}

function catalogImage(alt: string) {
  return {
    src: `https://cdn.sanity.io/images/${sanityProjectId}/${sanityDataset}/test-1x1.png`,
    alt,
    width: 1,
    height: 1,
  };
}

function productPayload(imageAlt?: string) {
  return {
    title: "TEST-1 — Test Silver Gift",
    slug: "test-silver-gift",
    shortDescription: "A test silver gift used to verify catalog recovery.",
    images: [{ ...catalogImage(imageAlt ?? ""), alt: imageAlt }],
    categorySlug: "gifts",
    collectionSlugs: [],
    featured: false,
    displayOrder: 1,
    reference: "TEST-1",
    material: null,
    purity: "92.5",
    weightGrams: null,
    heightInches: null,
    widthInches: null,
    depthInches: null,
    diameterInches: null,
    singhasanWidthInches: null,
    singhasanDepthInches: null,
    sizeVariants: [],
    utensilType: null,
    idolConstruction: null,
    deities: [],
    coinShape: null,
    updatedAt: "2026-08-09T00:00:00.000Z",
  };
}

describe("fetchCatalog()", () => {
  it("retries without the CDN after a malformed or failed Sanity response", async () => {
    const retryFetch = vi
      .fn()
      .mockResolvedValueOnce([
        {
          title: "Test Silver Gift",
          slug: "test-silver-gift",
          shortDescription: "A test silver gift used to verify catalog recovery.",
          images: [catalogImage("A test silver gift on a neutral background")],
          categorySlug: "gifts",
          collectionSlugs: [],
          featured: false,
          displayOrder: 1,
          reference: "TEST-1",
          material: null,
          purity: "92.5",
          weightGrams: null,
          heightInches: null,
          widthInches: null,
          depthInches: null,
          diameterInches: null,
          singhasanWidthInches: null,
          singhasanDepthInches: null,
          sizeVariants: [],
          utensilType: null,
          idolConstruction: null,
          deities: [],
          coinShape: null,
          updatedAt: "2026-08-09T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([
        {
          title: "Gifts",
          slug: "gifts",
          description: "Silver gifts for meaningful occasions.",
          image: catalogImage("A representative silver gift"),
          displayOrder: 1,
          updatedAt: "2026-08-09T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([]);
    const retryClient = asCatalogClient({
      fetch: retryFetch,
      withConfig: vi.fn(),
    });
    const primaryClient = asCatalogClient({
      fetch: vi.fn().mockRejectedValue(new SyntaxError("Malformed JSON")),
      withConfig: vi.fn(() => retryClient),
    });

    const catalog = await fetchCatalog(primaryClient);

    expect(primaryClient.withConfig).toHaveBeenCalledWith({ useCdn: false });
    expect(retryFetch).toHaveBeenCalledTimes(3);
    expect(catalog.source).toBe("sanity");
    expect(catalog.products[0]?.slug).toBe("test-silver-gift");
  });

  it("accepts published bottle products without falling back", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce([
        {
          title: "Test Silver Bottle",
          slug: "test-silver-bottle",
          shortDescription:
            "A test silver bottle used to verify catalog validation.",
          images: [catalogImage("A test silver bottle on a neutral background")],
          categorySlug: "utensils",
          collectionSlugs: [],
          featured: false,
          displayOrder: 1,
          reference: "TEST-BOTTLE-1",
          material: "silver",
          purity: "92.5",
          weightGrams: null,
          heightInches: null,
          widthInches: null,
          depthInches: null,
          diameterInches: null,
          singhasanWidthInches: null,
          singhasanDepthInches: null,
          sizeVariants: [],
          utensilType: "bottle",
          idolConstruction: null,
          deities: [],
          coinShape: null,
          updatedAt: "2026-08-20T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([
        {
          title: "Utensils",
          slug: "utensils",
          description: "Silver utensils for serving and gifting.",
          image: catalogImage("A representative silver utensil"),
          displayOrder: 1,
          updatedAt: "2026-08-20T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([]);
    const client = asCatalogClient({
      fetch,
      withConfig: vi.fn(),
    });

    const catalog = await fetchCatalog(client);

    expect(catalog.source).toBe("sanity");
    expect(catalog.products[0]?.utensilType).toBe("bottle");
  });

  it("accepts Gold products with multiple purities and Pooja Thali Sets", async () => {
    const goldProduct = {
      ...productPayload("A card-packed gold coin on a neutral background"),
      title: "Card-Packed Gold Coin",
      slug: "card-packed-gold-coin",
      shortDescription:
        "A card-packed 99.50% gold coin prepared for gifting.",
      categorySlug: "gold",
      reference: "DDA-GOLD-TEST-1",
      material: "gold",
      purity: "99.50",
      coinShape: "round",
    };
    const queenVictoriaGoldProduct = {
      ...productPayload(
        "A card-packed Queen Victoria gold coin on a neutral background",
      ),
      title: "Packaged Queen Victoria Gold Coin",
      slug: "packaged-queen-victoria-gold-coin",
      shortDescription:
        "A card-packed 91.60% Queen Victoria gold coin prepared for gifting.",
      categorySlug: "gold",
      reference: "DDA-GOLD-TEST-2",
      material: "gold",
      purity: "91.60",
      coinShape: "round",
    };
    const poojaThali = {
      ...productPayload("A silver Pooja Thali Set on a neutral background"),
      title: "Silver Pooja Thali Set",
      slug: "silver-pooja-thali-set",
      shortDescription:
        "A 92.5% silver Pooja Thali Set for devotional rituals.",
      categorySlug: "utensils",
      reference: "DDA-UT-PT-TEST-1",
      material: "silver",
      purity: "92.5",
      utensilType: "pooja-thali-set",
    };
    const fetch = vi
      .fn()
      .mockResolvedValueOnce([goldProduct, queenVictoriaGoldProduct, poojaThali])
      .mockResolvedValueOnce([
        {
          title: "Gold Coins & Bars",
          slug: "gold",
          description: "Card-packed gold coins and bars in multiple purities.",
          image: catalogImage("A representative card-packed gold coin"),
          displayOrder: 1,
          updatedAt: "2026-08-22T00:00:00.000Z",
        },
        {
          title: "Utensils",
          slug: "utensils",
          description: "Silver Pooja Thali Sets.",
          image: catalogImage("A representative silver Pooja Thali Set"),
          displayOrder: 2,
          updatedAt: "2026-08-22T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([]);
    const client = asCatalogClient({ fetch, withConfig: vi.fn() });

    const catalog = await fetchCatalog(client);

    expect(catalog.source).toBe("sanity");
    expect(catalog.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          material: "gold",
          purity: "99.50",
          coinShape: "round",
        }),
        expect.objectContaining({
          material: "gold",
          purity: "91.60",
          coinShape: "round",
        }),
        expect.objectContaining({
          material: "silver",
          utensilType: "pooja-thali-set",
        }),
      ]),
    );
  });

  it("automatically adds product image SEO for API-imported content", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce([productPayload()])
      .mockResolvedValueOnce([
        {
          title: "Gifts",
          slug: "gifts",
          description: "Silver gifts for meaningful occasions.",
          image: catalogImage("A representative silver gift"),
          displayOrder: 1,
          updatedAt: "2026-08-09T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([]);
    const client = asCatalogClient({ fetch, withConfig: vi.fn() });

    const catalog = await fetchCatalog(client);

    expect(catalog.source).toBe("sanity");
    expect(catalog.products[0]?.images[0]).toMatchObject({
      alt: "Test Silver Gift from DDA Silver",
      src: expect.stringContaining(
        "/test-1x1.png/test-silver-gift.png",
      ),
    });
    expect(catalog.categories[0]?.image.src).toContain(
      "/test-1x1.png/gifts-category.png",
    );
  });

  it("uses the fallback catalog when both Sanity requests fail", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const retryClient = asCatalogClient({
      fetch: vi.fn().mockRejectedValue(new Error("Direct API unavailable")),
      withConfig: vi.fn(),
    });
    const primaryClient = asCatalogClient({
      fetch: vi.fn().mockRejectedValue(new Error("CDN response invalid")),
      withConfig: vi.fn(() => retryClient),
    });

    const catalog = await fetchCatalog(primaryClient);

    expect(catalog.source).toBe("fallback");
    expect(catalog.products).toEqual(fallbackProducts);
    expect(consoleError).toHaveBeenCalledOnce();
    consoleError.mockRestore();
  });
});
