import { describe, expect, it } from "vitest";

import { resolveRatesPortalUrl } from "@/lib/rates/portal";

describe("resolveRatesPortalUrl", () => {
  it("accepts the DDAJewels silver-rates destination", () => {
    expect(
      resolveRatesPortalUrl(
        "https://preview.ddajewels.com/silver-rates",
      ),
    ).toBe("https://preview.ddajewels.com/silver-rates");
  });

  it.each([
    "https://evil.example/silver-rates",
    "javascript:alert(1)",
    "https://ddajewels.com/rates",
    "https://ddajewels.com/silver-rates?returnTo=https://evil.example",
  ])("falls back to the retained local rates page for %s", (value) => {
    expect(resolveRatesPortalUrl(value)).toBe("/rates");
  });
});
