// @vitest-environment node
import { evaluate, parse } from "groq-js";
import { describe, expect, it } from "vitest";
import {
  catalogFacetsQuery,
  collectionsQuery,
  productPageQuery,
  productQuery,
  featuredProductsQuery,
  homepageFallbackProductsQuery,
} from "@/sanity/lib/queries";

const dataset = [
  {
    _id: "asset",
    _type: "sanity.imageAsset",
    url: "https://cdn.sanity.io/test.png",
    metadata: { dimensions: { width: 1254, height: 1254 } },
  },
  {
    _id: "category",
    _type: "category",
    slug: { current: "serveware" },
    title: "Serveware",
    displayOrder: 1,
  },
  {
    _id: "collection",
    _type: "collection",
    slug: { current: "gifts" },
    title: "Gifts",
    displayOrder: 1,
    products: [{ _ref: "wrong-legacy-product" }],
  },
  ...Array.from({ length: 26 }, (_, i) => ({
    _id: `product-${i}`,
    _type: "product",
    slug: { current: `silver-bowl-${i}` },
    title: `Silver Bowl ${i}`,
    shortDescription: "A silver bowl.",
    category: { _ref: "category" },
    collections: [{ _ref: "collection" }],
    gallery: [{ asset: { _ref: "asset" } }],
    displayOrder: i,
    purity: "92.5",
    utensilType: "bowl",
  })),
];
const params = {
  category: "serveware",
  collection: "gifts",
  purity: "",
  idol: "",
  deity: "",
  shape: "",
  item: "bowl",
  terms: ["sil*", "bow*"],
  start: 24,
  end: 48,
};
async function run(
  query: string,
  parameters: Record<string, unknown> = params,
) {
  return (
    await evaluate(parse(query, { params: parameters }), {
      dataset,
      params: parameters,
    })
  ).get();
}
describe("GROQ catalog queries", () => {
  it("provides four real published cards when no products are featured", async () => {
    expect(await run(featuredProductsQuery)).toEqual([]);
    const fallback = await run(homepageFallbackProductsQuery);
    expect(fallback.map((product: { slug: string }) => product.slug)).toEqual([
      "silver-bowl-0",
      "silver-bowl-1",
      "silver-bowl-2",
      "silver-bowl-3",
    ]);
    expect(
      fallback.every(
        (product: { images: unknown[] }) => product.images.length === 1,
      ),
    ).toBe(true);
  });
  it("paginates matching results and returns the total before slicing", async () => {
    const result = await run(productPageQuery);
    expect(result.total).toBe(26);
    expect(
      result.products.map((product: { slug: string }) => product.slug),
    ).toEqual(["silver-bowl-24", "silver-bowl-25"]);
    expect(
      (await run(productPageQuery, { ...params, terms: ["missing*"] })).total,
    ).toBe(0);
  });
  it("derives collection membership from product references only", async () => {
    const [collection] = await run(collectionsQuery);
    expect(collection.productCount).toBe(26);
    expect(collection.productSlugs).toHaveLength(26);
    expect(collection.productSlugs).not.toContain("wrong-legacy-product");
  });
  it("does not emit null deities for products without that optional field", async () => {
    const [facet] = await run(catalogFacetsQuery);
    expect(facet).toMatchObject({
      categorySlug: "serveware",
      productCount: 26,
      purities: ["92.5"],
      utensilTypes: ["bowl"],
      deities: [],
    });
  });
  it("fetches only the requested detail document", async () => {
    const products = await run(productQuery, { slug: "silver-bowl-25" });
    expect(products.map((product: { slug: string }) => product.slug)).toEqual([
      "silver-bowl-25",
    ]);
  });
});
