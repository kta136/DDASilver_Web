// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import { SiteHeader } from "@/components/site-header";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("<SiteHeader />", () => {
  it("renders the external rates portal in desktop and mobile navigation", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_RATES_PORTAL_URL",
      "https://preview.ddajewels.com/silver-rates",
    );

    render(<SiteHeader />);

    const ratesLinks = screen.getAllByRole("link", { name: "Live Rates" });
    expect(ratesLinks).toHaveLength(2);
    for (const link of ratesLinks) {
      expect(link).toHaveAttribute(
        "href",
        "https://preview.ddajewels.com/silver-rates",
      );
    }
  });
});
