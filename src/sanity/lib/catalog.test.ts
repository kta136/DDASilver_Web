import { afterEach, describe, expect, it, vi } from "vitest";

import { createSnapshotStore } from "@/sanity/lib/snapshot";
import { createSanityReader } from "@/sanity/lib/read";
import { productSchema } from "@/sanity/lib/contract";
import {
  productsQuery,
  categoriesQuery,
  collectionsQuery,
} from "@/sanity/lib/queries";
import { sanityDataset, sanityProjectId } from "@/sanity/env";
import {
  fetchCatalog,
  readAllDocuments,
  getListingParams,
} from "@/sanity/lib/catalog";

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

const category = {
  title: "Gifts",
  slug: "gifts",
  description: "Silver gifts for meaningful occasions.",
  image: catalogImage("A representative silver gift"),
  displayOrder: 1,
};
function mockClient(products: unknown[]) {
  return asCatalogClient({
    fetch: vi.fn(async (query: string) =>
      query === categoriesQuery
        ? [category]
        : query === collectionsQuery
          ? []
          : products,
    ),
  });
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("catalog read boundary", () => {
  it("keeps valid products when one document is malformed and reports its field", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const catalog = await fetchCatalog(
      mockClient([
        productPayload(),
        { ...productPayload(), slug: "bad", weightGrams: -1 },
      ]),
      { store: createSnapshotStore() },
    );
    expect(catalog.products.map((p) => p.slug)).toEqual(["test-silver-gift"]);
    expect(catalog.source).toBe("stale");
    expect(log).toHaveBeenCalledWith(
      "Sanity document failed validation",
      expect.objectContaining({
        document: "bad",
        issues: expect.arrayContaining([
          expect.objectContaining({ field: "weightGrams" }),
        ]),
      }),
    );
  });
  it("preserves legacy nullable values and creates image SEO", async () => {
    const catalog = await fetchCatalog(
      mockClient([
        { ...productPayload(), featured: null, utensilType: "bottle" },
      ]),
      { store: createSnapshotStore() },
    );
    expect(catalog.products[0]).toMatchObject({
      featured: false,
      utensilType: "bottle",
      images: [
        expect.objectContaining({
          alt: "Test Silver Gift from DDA Silver",
          src: expect.stringContaining("/test-silver-gift.png"),
        }),
      ],
    });
  });
  it.each(["91.60", "99.50"])("accepts gold purity %s", async (purity) => {
    const catalog = await fetchCatalog(
      mockClient([
        { ...productPayload(), material: "gold", purity, coinShape: "round" },
      ]),
      { store: createSnapshotStore() },
    );
    expect(catalog.products[0]).toMatchObject({
      material: "gold",
      purity,
      coinShape: "round",
    });
  });
  it("recovers only the invalid document from the last validated response", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const store = createSnapshotStore();
    await fetchCatalog(mockClient([productPayload()]), { store });
    const catalog = await fetchCatalog(
      mockClient([
        { ...productPayload(), images: [] },
        { ...productPayload(), slug: "new-valid" },
      ]),
      { store },
    );
    expect(catalog.products.map((p) => p.slug)).toEqual([
      "test-silver-gift",
      "new-valid",
    ]);
    expect(catalog.source).toBe("stale");
    // An intentionally empty successful response must not resurrect deleted content.
    expect((await fetchCatalog(mockClient([]), { store })).products).toEqual(
      [],
    );
  });
  it("serves the published snapshot during an outage, never demo data in production", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_ENV", "production");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const store = createSnapshotStore();
    await fetchCatalog(mockClient([productPayload()]), { store });
    const failed = asCatalogClient({
      fetch: vi.fn().mockRejectedValue(new Error("Unavailable")),
    });
    expect((await fetchCatalog(failed, { store })).source).toBe("stale");
    await expect(
      fetchCatalog(failed, { store: createSnapshotStore() }),
    ).rejects.toThrow("temporarily unavailable");
    await expect(fetchCatalog(failed, { store, draft: true })).rejects.toThrow(
      "temporarily unavailable",
    );
  });
  it("does not persist or recover draft content", async () => {
    const store = { get: vi.fn(), set: vi.fn() };
    await fetchCatalog(mockClient([productPayload()]), { store, draft: true });
    expect(store.get).not.toHaveBeenCalled();
    expect(store.set).not.toHaveBeenCalled();
  });
  it("retries a failed cached request without caching", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("cache failure"))
      .mockResolvedValueOnce([]);
    const read = createSanityReader(asCatalogClient({ fetch }), {
      store: createSnapshotStore(),
    });
    await read("test", {}, (value) => ({ value }));
    expect(fetch.mock.calls[0][2]).toMatchObject({
      cache: "force-cache",
      next: {
        revalidate: 300,
        tags: expect.arrayContaining([
          "sanity-catalog",
          "deity",
          "sanity.imageAsset",
        ]),
      },
    });
    expect(fetch.mock.calls[1][2]).toEqual({ cache: "no-store" });
  });
  it("traverses more than 1000 documents in stable cursor batches", async () => {
    const rows = Array.from({ length: 1005 }, (_, index) => ({
      ...productPayload(),
      _id: `product-${String(index).padStart(5, "0")}`,
      slug: `product-${index}`,
    }));
    const fetch = vi.fn(async (_query, { afterId }) =>
      rows.filter((row) => row._id > afterId).slice(0, 200),
    );
    const result = await readAllDocuments(
      createSanityReader(asCatalogClient({ fetch }), {
        store: createSnapshotStore(),
      }),
      productsQuery,
      productSchema,
      "product",
    );
    expect(result.value).toHaveLength(1005);
    expect(fetch).toHaveBeenCalledTimes(6);
    expect(result.value.at(-1)?.slug).toBe("product-1004");
  });
  it("binds all listing filters, search terms and page bounds as parameters", () => {
    expect(
      getListingParams(
        {
          query: "Silver bowl!",
          category: "new-category",
          purity: "92.5",
          utensilType: "bowl",
        },
        2,
        "gifts",
      ),
    ).toMatchObject({
      category: "new-category",
      collection: "gifts",
      purity: "92.5",
      item: "bowl",
      terms: ["silver*", "bowl*"],
      start: 24,
      end: 48,
    });
  });
});
