// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RatesPortalLink } from "@/components/rates-portal-link";

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
});

describe("<RatesPortalLink />", () => {
  it("renders the configured external DDAJewels route", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_RATES_PORTAL_URL",
      "https://preview.ddajewels.com/silver-rates",
    );

    render(<RatesPortalLink>Live Rates</RatesPortalLink>);

    expect(screen.getByRole("link", { name: "Live Rates" })).toHaveAttribute(
      "href",
      "https://preview.ddajewels.com/silver-rates",
    );
  });
});
