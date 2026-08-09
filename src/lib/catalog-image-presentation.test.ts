import { describe, expect, it } from "vitest";

import {
  shouldContainProductImage,
  shouldUseSquareProductCardImage,
} from "@/lib/catalog-image-presentation";

describe("shouldContainProductImage", () => {
  it("contains Jhula and purse products at every card size", () => {
    expect(
      shouldContainProductImage({ categorySlug: "jhula" }, true),
    ).toBe(true);
    expect(
      shouldContainProductImage({ categorySlug: "purse" }, true),
    ).toBe(true);
  });

  it("contains coin images outside the compact catalog grid", () => {
    const coin = { categorySlug: "coin", coinShape: "round" as const };

    expect(shouldContainProductImage(coin)).toBe(true);
    expect(shouldContainProductImage(coin, true)).toBe(false);
  });

  it("keeps standard product photography on the cover treatment", () => {
    expect(shouldContainProductImage({ categorySlug: "jewellery" })).toBe(
      false,
    );
  });

  it("uses square card media only for Jhula products", () => {
    expect(shouldUseSquareProductCardImage({ categorySlug: "jhula" })).toBe(
      true,
    );
    expect(shouldUseSquareProductCardImage({ categorySlug: "gifts" })).toBe(
      false,
    );
  });
});
