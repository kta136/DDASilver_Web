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

  it("magnifies a photo around the mouse position and resets on exit", () => {
    render(<ProductGallery images={images.slice(0, 1)} />);

    const image = screen.getByAltText("Bracelet front");
    const slide = image.parentElement!;
    vi.spyOn(slide, "getBoundingClientRect").mockReturnValue({
      bottom: 550,
      height: 500,
      left: 100,
      right: 500,
      top: 50,
      width: 400,
      x: 100,
      y: 50,
      toJSON: () => ({}),
    });

    fireEvent.pointerEnter(slide, {
      clientX: 300,
      clientY: 300,
      pointerType: "mouse",
    });

    expect(image).toHaveStyle({
      transform: "scale(2)",
      transformOrigin: "50% 50%",
    });

    fireEvent.pointerMove(slide, {
      clientX: 500,
      clientY: 50,
      pointerType: "mouse",
    });

    expect(image).toHaveStyle({ transformOrigin: "100% 0%" });

    fireEvent.pointerLeave(slide, { pointerType: "mouse" });

    expect(image.style.transform).toBe("");
    expect(image.style.transformOrigin).toBe("");
  });

  it("leaves touch interactions available for gallery swiping", () => {
    render(<ProductGallery images={images.slice(0, 1)} />);

    const image = screen.getByAltText("Bracelet front");
    const slide = image.parentElement!;

    fireEvent.pointerEnter(slide, {
      clientX: 160,
      clientY: 160,
      pointerType: "touch",
    });
    fireEvent.pointerMove(slide, {
      clientX: 220,
      clientY: 160,
      pointerType: "touch",
    });

    expect(image.style.transform).toBe("");
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
