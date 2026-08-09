import { describe, expect, it } from "vitest";

import {
  createPageMetadata,
  getProductSeoName,
  getProductSocialImage,
  getSocialImageProductUrl,
  serializeJsonLd,
  toAbsoluteUrl,
  truncateSeoText,
} from "@/lib/seo";

describe("SEO helpers", () => {
  it("normalizes and truncates metadata text on a word boundary", () => {
    const result = truncateSeoText(
      "  A   deliberately long description for a silver collection in Agra.  ",
      48,
    );

    expect(result).toBe("A deliberately long description for a silver…");
    expect(result.length).toBeLessThanOrEqual(48);
  });

  it("creates canonical and social metadata without overriding indexability", () => {
    const metadata = createPageMetadata({
      title: "Silver Products in Agra",
      description: "Browse silver products from DDA Silver in Agra.",
      path: "/products",
    });

    expect(metadata.alternates).toEqual({ canonical: "/products" });
    expect(metadata.openGraph).toMatchObject({
      siteName: "DDA Silver",
      url: "http://localhost:3000/products",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
    expect(metadata.robots).toBeUndefined();
  });

  it("keeps private utility pages out of search results", () => {
    const metadata = createPageMetadata({
      title: "Customer login",
      description: "Continue to the shared customer login.",
      path: "/login",
      canonical: false,
      noIndex: true,
    });

    expect(metadata.alternates).toBeUndefined();
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("can noindex thin pages while allowing crawlers to follow their links", () => {
    const metadata = createPageMetadata({
      title: "Upcoming silver category",
      description: "This silver category does not have published products yet.",
      path: "/category/upcoming",
      noIndex: true,
      noFollow: false,
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it("resolves same-site URLs against the configured preview origin", () => {
    expect(toAbsoluteUrl("/contact")).toBe("http://localhost:3000/contact");
  });

  it("removes an internal item code from a product SEO name", () => {
    expect(
      getProductSeoName(
        "HM-GN-1 — Ganesha Silver Idol with Arch",
        "HM-GN-1",
      ),
    ).toBe("Ganesha Silver Idol with Arch");
  });

  it("keeps a product title unchanged when the reference is not its prefix", () => {
    expect(getProductSeoName("Silver Coin 10g", "COIN-10G")).toBe(
      "Silver Coin 10g",
    );
  });

  it("builds a 1200 by 630 product social image descriptor", () => {
    expect(
      getProductSocialImage(
        "ganesha-silver-idol-with-arch",
        "Ganesha Silver Idol with Arch",
      ),
    ).toEqual({
      src: "/api/og/product/ganesha-silver-idol-with-arch",
      alt: "Ganesha Silver Idol with Arch from DDA Silver",
      width: 1200,
      height: 630,
    });
  });

  it("supports local product images in the social image renderer", () => {
    expect(getSocialImageProductUrl("/images/product.png")).toBe(
      "http://localhost:3000/images/product.png",
    );
  });

  it("adds Sanity image transformations for social cards", () => {
    expect(
      getSocialImageProductUrl(
        "https://cdn.sanity.io/images/project/production/product.png",
      ),
    ).toBe(
      "https://cdn.sanity.io/images/project/production/product.png?w=560&h=560&fit=max&q=92",
    );
  });

  it("escapes HTML-significant characters in JSON-LD", () => {
    expect(serializeJsonLd({ name: "Silver <script>" })).toBe(
      '{"name":"Silver \\u003cscript>"}',
    );
  });
});
