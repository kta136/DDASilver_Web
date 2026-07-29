// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

import { SiteHeader } from "@/components/site-header";

afterEach(() => {
  cleanup();
});

describe("<SiteHeader />", () => {
  it("keeps desktop and mobile Live Rates links inside DDA Silver", () => {
    render(<SiteHeader />);

    const ratesLinks = screen.getAllByRole("link", { name: "Live Rates" });
    expect(ratesLinks).toHaveLength(2);
    for (const link of ratesLinks) {
      expect(link).toHaveAttribute("href", "/rates");
    }
  });
});
