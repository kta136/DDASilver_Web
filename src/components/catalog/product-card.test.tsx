// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProductCard } from "@/components/catalog/product-card";
import { fallbackProducts } from "@/data/catalog";

afterEach(cleanup);

describe("<ProductCard />", () => {
  it("renders product height and width when they are present", () => {
    const product = {
      ...fallbackProducts[0]!,
      heightInches: 4.5,
      widthInches: 3,
    };

    render(<ProductCard product={product} />);

    expect(screen.getByText(/Height 4\.5 in/)).toBeInTheDocument();
    expect(screen.getByText(/Width 3 in/)).toBeInTheDocument();
  });

  it("omits product height and width when they are absent", () => {
    const product = {
      ...fallbackProducts[0]!,
      heightInches: undefined,
      widthInches: undefined,
    };

    render(<ProductCard product={product} />);

    expect(screen.queryByText(/Height /)).not.toBeInTheDocument();
    expect(screen.queryByText(/Width /)).not.toBeInTheDocument();
  });

  it("labels singhasan width and depth without presenting them as overall dimensions", () => {
    const product = {
      ...fallbackProducts[0]!,
      singhasanWidthInches: 9,
      singhasanDepthInches: 7,
    };

    render(<ProductCard product={product} />);

    expect(screen.getByText(/Singhasan: 9 × 7 in/)).toBeInTheDocument();
  });

  it("fills a square Jhula card without cropping or hover zoom", () => {
    const product = {
      ...fallbackProducts[0]!,
      categorySlug: "jhula",
    };

    render(<ProductCard product={product} compactImage />);

    const image = screen.getByAltText(product.images[0]!.alt);

    expect(image).toHaveClass("object-contain");
    expect(image).not.toHaveClass("group-hover:scale-[1.025]");
    expect(image.parentElement).toHaveClass("aspect-square");
  });

  it("uses one square, uncropped image treatment throughout the catalog gallery", () => {
    const product = {
      ...fallbackProducts[0]!,
      categorySlug: "gifts",
    };

    render(<ProductCard product={product} compactImage />);

    const image = screen.getByAltText(product.images[0]!.alt);

    expect(image).toHaveClass("object-contain");
    expect(image).not.toHaveClass("object-cover");
    expect(image.parentElement).toHaveClass("aspect-square");
  });
});
