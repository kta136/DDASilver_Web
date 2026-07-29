import { describe, expect, it } from "vitest";

import {
  createPageMetadata,
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

  it("resolves same-site URLs against the configured preview origin", () => {
    expect(toAbsoluteUrl("/contact")).toBe("http://localhost:3000/contact");
  });
});
