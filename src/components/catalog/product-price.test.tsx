import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProductPrice } from "./product-price";
import { GalleryPriceProvider, PricedProductLink } from "./price-context";
import type { PriceEstimate } from "@/lib/pricing/model";
import { getProductPageStructuredData } from "@/lib/catalog-seo";
import { fallbackProducts } from "@/data/catalog";
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}));
const old: PriceEstimate = {
  status: "available",
  minimum: 1050,
  maximum: 1050,
  mode: "automatic",
  currency: "INR",
  asOf: "2026-09-01T09:00:00Z",
  validUntil: "2026-09-30T18:29:59.999Z",
  lastAvailable: true,
  sizes: [],
};
describe("server-supplied visible pricing", () => {
  it("matches every structured offer to its server-rendered size price", () => {
    const now = Date.parse("2026-09-10T10:00:00Z");
    const estimate: PriceEstimate = {
      ...old, lastAvailable: false, asOf: new Date(now).toISOString(),
      minimum: 5500, maximum: 9900,
      sizes: [
        { weightGrams: 50, diameterInches: 4, amount: 5500 },
        { weightGrams: 100, diameterInches: 6, amount: 9900 },
      ],
    };
    const product = { ...fallbackProducts[0], estimate };
    const schema = getProductPageStructuredData(product, now);
    const html = renderToStaticMarkup(
      <ProductPrice slug={product.slug} estimate={estimate} details />,
    );
    if (!("offers" in schema)) throw new Error("Expected priced Product markup");
    for (const offer of schema.offers) {
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency", currency: "INR", maximumFractionDigits: 0,
      }).format(Number(offer.price));
      expect(html).toContain(formatted);
      expect(html).toContain(offer.name);
      expect(html).toContain(offer.description);
    }
  });

  it("includes amount and absolute date in HTML without JavaScript", () => {
    const now = Date.parse("2026-09-10T10:00:00Z");
    const html = renderToStaticMarkup(
      <ProductPrice slug="coin" estimate={old} details />,
    );
    const schema = getProductPageStructuredData({
      ...fallbackProducts[0],
      estimate: old,
    }, now);
    expect(html).toContain("₹1,050");
    expect(html).not.toContain("Approx");
    expect(html).toContain('dateTime="2026-09-01T09:00:00Z"');
    expect(html).toContain('dateTime="2026-09-30T18:29:59.999Z"');
    expect(html).toContain("Price valid until");
    expect(html).toContain("Includes making charges and taxes");
    expect(html).toContain("last available silver rate");
    expect(html).not.toContain("Offer");
    expect(schema).toMatchObject({
      "@type": "Product",
      offers: [{
        price: "1050.00",
        priceCurrency: "INR",
        priceValidUntil: "2026-09-30",
        availability: "https://schema.org/InStock",
      }],
    });
  });
  it("renders a crawlable gallery amount without the detail disclosures", () => {
    const html = renderToStaticMarkup(
      <GalleryPriceProvider>
        <PricedProductLink slug="coin" estimate={old}>
          <ProductPrice slug="coin" estimate={old} />
        </PricedProductLink>
      </GalleryPriceProvider>,
    );
    expect(html).toContain('href="/products/coin"');
    expect(html).toContain(
      'data-product-price="true" data-currency="INR">₹1,050</p>',
    );
    expect(html).not.toMatch(
      /Approx|snapshot|<time|last available|making charges/,
    );
  });
  it("reuses the card estimate in a dialog while allowing a full page to use a newer estimate", () => {
    const fresh = { ...old, minimum: 2000, maximum: 2000 };
    render(
      <GalleryPriceProvider>
        <PricedProductLink slug="coin" estimate={old}>
          Open coin
        </PricedProductLink>
        <div data-testid="dialog">
          <ProductPrice slug="coin" estimate={fresh} dialog />
        </div>
        <div data-testid="page">
          <ProductPrice slug="coin" estimate={fresh} />
        </div>
      </GalleryPriceProvider>,
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/products/coin");
    fireEvent.click(screen.getByRole("link"));
    expect(screen.getByTestId("dialog")).toHaveTextContent("₹1,050");
    expect(screen.getByTestId("page")).toHaveTextContent("₹2,000");
  });
});
