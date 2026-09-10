import { fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProductPrice } from "./product-price";
import { GalleryPriceProvider, PricedProductLink } from "./price-context";
import type { PriceEstimate } from "@/lib/pricing/model";
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
  lastAvailable: true,
  sizes: [],
};
describe("server-supplied visible pricing", () => {
  it("includes amount and absolute date in HTML without JavaScript", () => {
    const html = renderToStaticMarkup(
      <ProductPrice slug="coin" estimate={old} details />,
    );
    expect(html).toContain("₹1,050");
    expect(html).not.toContain("Approx");
    expect(html).toContain('dateTime="2026-09-01T09:00:00Z"');
    expect(html).toContain("Includes making charges and taxes");
    expect(html).toContain("last available silver rate");
    expect(html).not.toContain("Offer");
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
