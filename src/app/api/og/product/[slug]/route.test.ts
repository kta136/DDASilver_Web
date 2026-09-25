import { describe, expect, it, vi } from "vitest";

const { getPublishedProduct } = vi.hoisted(() => ({
  getPublishedProduct: vi.fn(),
}));

vi.mock("@/sanity/lib/catalog", () => ({ getPublishedProduct }));
vi.mock("next/og", () => ({
  ImageResponse: class extends Response {
    constructor(_element: unknown, options: { headers: HeadersInit }) {
      const headers = new Headers(options.headers);
      headers.set("Content-Type", "image/png");
      super(new Uint8Array([137, 80, 78, 71]), { headers });
    }
  },
}));

import { GET } from "@/app/api/og/product/[slug]/route";
import { fallbackProducts } from "@/data/catalog";

describe("product social image route", () => {
  it("marks successful generated PNG responses noindex and preserves caching", async () => {
    getPublishedProduct.mockResolvedValue({
      ...fallbackProducts[0]!,
      title: "Silver Coin",
      slug: "silver-coin",
    });

    const response = await GET(new Request("https://example.test"), {
      params: Promise.resolve({ slug: "silver-coin" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/png");
    expect(response.headers.get("x-robots-tag")).toBe("noindex");
    expect(response.headers.get("cache-control")).toBe(
      "public, max-age=0, s-maxage=300, stale-while-revalidate=60",
    );
  });

  it("keeps missing product responses as 404 without noindex headers", async () => {
    getPublishedProduct.mockResolvedValue(undefined);

    const response = await GET(new Request("https://example.test"), {
      params: Promise.resolve({ slug: "unpublished-product" }),
    });

    expect(response.status).toBe(404);
    expect(response.headers.get("x-robots-tag")).toBeNull();
  });
});
