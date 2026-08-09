// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ProductGallery } from "@/components/catalog/product-gallery";
import type { CatalogImage } from "@/types/catalog";

const scrollTo = vi.fn();
const images: CatalogImage[] = [
  {
    src: "/images/mockup/featured-bracelet.png",
    alt: "Bracelet front",
    width: 1200,
    height: 1500,
  },
  {
    src: "/images/mockup/featured-ring.png",
    alt: "Bracelet side",
    width: 1200,
    height: 1500,
  },
];

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: scrollTo,
  });
});

beforeEach(() => scrollTo.mockClear());
afterEach(cleanup);

describe("<ProductGallery />", () => {
  it("hides navigation for a single photo", () => {
    render(<ProductGallery images={images.slice(0, 1)} />);

    expect(
      screen.queryByRole("button", { name: "Next photo" }),
    ).not.toBeInTheDocument();
    expect(screen.getByAltText("Bracelet front")).toBeInTheDocument();
  });

  it("can preserve the full product frame without cropping", () => {
    render(<ProductGallery images={images.slice(0, 1)} containImages />);

    const image = screen.getByAltText("Bracelet front");
    const slide = image.parentElement;
    const scroller = slide?.parentElement;
    const gallery = scroller?.parentElement;

    expect(image).toHaveClass("object-contain");
    expect(slide).toHaveClass("lg:h-full", "lg:aspect-auto");
    expect(scroller).toHaveClass("lg:h-full");
    expect(gallery).toHaveClass("lg:h-full");
  });

  it("moves between photos with accessible controls", () => {
    render(<ProductGallery images={images} />);
    const scroller = screen.getByAltText("Bracelet front").parentElement!
      .parentElement!;
    Object.defineProperty(scroller, "clientWidth", {
      configurable: true,
      value: 320,
    });

    expect(screen.getByText("Photo 1 of 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Previous photo" }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Next photo" }));

    expect(screen.getByText("Photo 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next photo" })).toBeDisabled();
    expect(scrollTo).toHaveBeenCalledWith({ left: 320, behavior: "smooth" });
  });

  it("updates the active photo after a horizontal swipe scroll", () => {
    render(<ProductGallery images={images} />);
    const scroller = screen.getByAltText("Bracelet front").parentElement!
      .parentElement!;
    Object.defineProperties(scroller, {
      clientWidth: { configurable: true, value: 320 },
      scrollLeft: { configurable: true, value: 320 },
    });

    fireEvent.scroll(scroller);

    expect(screen.getByText("Photo 2 of 2")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show photo 2" }),
    ).toHaveAttribute("aria-current", "true");
  });
});
