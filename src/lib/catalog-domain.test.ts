import { describe, expect, it } from "vitest";
import {
  assertProductDocument,
  galleryManifestProductSchema,
  getCategoryKind,
} from "@/lib/catalog-domain";

const product = {
  _id: "product-test",
  _type: "product",
  title: "Silver bowl",
  slug: { current: "silver-bowl" },
  shortDescription: "A silver bowl for serving and gifting.",
  gallery: [
    {
      _type: "image",
      _key: "front",
      asset: { _type: "reference", _ref: "image-test" },
      alt: "Silver bowl on an ivory background",
    },
  ],
  category: { _type: "reference", _ref: "arbitrary-category-id" },
  featured: false,
  displayOrder: 1,
  purity: "92.5",
  material: "silver",
  utensilType: "bowl",
  weightGrams: 30,
};

describe("shared Sanity write contract", () => {
  it("validates category attributes without depending on document IDs or names", () => {
    const kind = getCategoryKind({ slug: "serveware", productKind: "utensil" });
    expect(() => assertProductDocument(product, kind)).not.toThrow();
    expect(() => assertProductDocument(product, "general")).toThrow(
      "utensilType",
    );
    expect(getCategoryKind({ slug: "idols" })).toBe("idol");
    expect(getCategoryKind({ slug: "idols", productKind: "general" })).toBe(
      "general",
    );
  });
  it.each([
    { weightGrams: -1 },
    { displayOrder: 100001 },
    { shortDescription: "" },
    { widthInches: 1001 },
    { purity: "fake" },
  ])("rejects invalid metadata %j", (invalid) => {
    expect(() =>
      assertProductDocument({ ...product, ...invalid }, "utensil"),
    ).toThrow();
  });
  it("rejects excessive galleries, missing alt text and duplicate keys", () => {
    expect(() =>
      assertProductDocument({
        ...product,
        gallery: Array.from({ length: 21 }, (_, i) => ({
          ...product.gallery[0],
          _key: String(i),
        })),
      }),
    ).toThrow();
    expect(() =>
      assertProductDocument({
        ...product,
        gallery: [{ ...product.gallery[0], alt: "" }],
      }),
    ).toThrow();
    expect(() =>
      assertProductDocument({
        ...product,
        gallery: [product.gallery[0], product.gallery[0]],
      }),
    ).toThrow("keys must be unique");
  });
  it("does not let manifest readiness flags bypass numeric or text validation", () => {
    const manifest = {
      ...product,
      id: product._id,
      slug: "silver-bowl",
      alt: product.gallery[0].alt,
      readyForProductPublish: true,
    };
    expect(galleryManifestProductSchema.safeParse(manifest).success).toBe(true);
    expect(
      galleryManifestProductSchema.safeParse({ ...manifest, weightGrams: -1 })
        .success,
    ).toBe(false);
    expect(
      galleryManifestProductSchema.safeParse({ ...manifest, alt: "" }).success,
    ).toBe(false);
  });
});
