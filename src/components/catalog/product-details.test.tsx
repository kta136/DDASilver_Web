// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ProductDetails } from "@/components/catalog/product-details";
import { fallbackProducts } from "@/data/catalog";

afterEach(cleanup);

describe("<ProductDetails />", () => {
  it("renders the essential product information and enquiry action", () => {
    const product = fallbackProducts[0]!;

    render(
      <ProductDetails
        product={product}
        categoryTitle="Jewellery"
        headingLevel={2}
        headingId="product-title"
        presentation="dialog"
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: product.title }),
    ).toHaveAttribute("id", "product-title");
    expect(screen.getByText("Jewellery")).toBeInTheDocument();
    expect(screen.getByText(`Reference ${product.reference}`)).toBeInTheDocument();
    expect(screen.getByText(product.shortDescription)).toBeInTheDocument();
    expect(screen.getByText("92.5%")).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: "Confirm availability on WhatsApp",
      }),
    ).toHaveAttribute("href", expect.stringMatching(/^https:\/\/wa\.me\//));
  });

  it("renders a product weight when Sanity provides one", () => {
    const product = {
      ...fallbackProducts[0]!,
      weightGrams: 400,
    };

    render(
      <ProductDetails
        product={product}
        headingLevel={1}
        presentation="page"
      />,
    );

    expect(screen.getByText("Weight")).toBeInTheDocument();
    expect(screen.getByText("400 g")).toBeInTheDocument();
  });

  it("renders verified product dimensions when Sanity provides them", () => {
    const product = {
      ...fallbackProducts[0]!,
      heightInches: 4.5,
      widthInches: 3,
      diameterInches: 5,
    };

    render(
      <ProductDetails
        product={product}
        headingLevel={1}
        presentation="page"
      />,
    );

    expect(screen.getByText("Height")).toBeInTheDocument();
    expect(screen.getByText("4.5 in")).toBeInTheDocument();
    expect(screen.getByText("Width")).toBeInTheDocument();
    expect(screen.getByText("3 in")).toBeInTheDocument();
    expect(screen.getByText("Diameter")).toBeInTheDocument();
    expect(screen.getByText("5 in")).toBeInTheDocument();
  });

  it("omits optional attributes that are absent", () => {
    const product = {
      ...fallbackProducts[0]!,
      reference: undefined,
      purity: undefined,
      weightGrams: undefined,
      heightInches: undefined,
      widthInches: undefined,
      diameterInches: undefined,
      idolConstruction: undefined,
      deities: [],
      coinShape: undefined,
    };

    render(
      <ProductDetails
        product={product}
        headingLevel={1}
        presentation="page"
      />,
    );

    expect(screen.queryByText(/^Reference /)).not.toBeInTheDocument();
    expect(screen.queryByText("Purity")).not.toBeInTheDocument();
    expect(screen.queryByText("Weight")).not.toBeInTheDocument();
    expect(screen.queryByText("Shape")).not.toBeInTheDocument();
  });
});
