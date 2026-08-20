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
