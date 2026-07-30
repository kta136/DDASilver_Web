// @vitest-environment jsdom

import {
  cleanup,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import {
  fallbackCategories,
  fallbackProducts,
} from "@/data/catalog";

afterEach(cleanup);

describe("<CatalogBrowser />", () => {
  it("removes collections and only renders item-backed filter options", () => {
    render(
      <CatalogBrowser
        products={fallbackProducts}
        categories={[
          ...fallbackCategories,
          {
            ...fallbackCategories[0]!,
            title: "Empty category",
            slug: "empty-category",
          },
        ]}
        initialCategory="coin"
      />,
    );

    expect(
      screen.queryByRole("combobox", { name: "Filter by collection" }),
    ).not.toBeInTheDocument();

    const categoryFilter = screen.getByRole("combobox", {
      name: "Filter by category",
    });
    expect(
      within(categoryFilter).queryByRole("option", {
        name: "Empty category",
      }),
    ).not.toBeInTheDocument();

    const purityFilter = screen.getByRole("combobox", {
      name: "Filter by purity",
    });
    expect(
      within(purityFilter).queryByRole("option", { name: "92.5%" }),
    ).not.toBeInTheDocument();
    expect(
      within(purityFilter).getByRole("option", { name: "99.80%" }),
    ).toBeInTheDocument();

    const shapeFilter = screen.getByRole("combobox", {
      name: "Filter by coin shape",
    });
    expect(
      within(shapeFilter).getByRole("option", { name: "Round" }),
    ).toBeInTheDocument();
    expect(
      within(shapeFilter).queryByRole("option", { name: "Oval" }),
    ).not.toBeInTheDocument();
  });

  it("shows deity names backed by products in the Idols category", () => {
    const idol = fallbackProducts.find(
      (product) => product.categorySlug === "idols",
    )!;

    render(
      <CatalogBrowser
        products={[
          {
            ...idol,
            title: "Shiva Family",
            slug: "shiva-family",
            deities: [
              { title: "Shiva", slug: "shiva" },
              { title: "Parvati", slug: "parvati" },
            ],
          },
        ]}
        categories={fallbackCategories}
        initialCategory="idols"
      />,
    );

    const deityFilter = screen.getByRole("combobox", {
      name: "Filter by deity",
    });
    expect(
      within(deityFilter).getByRole("option", { name: "Parvati" }),
    ).toBeInTheDocument();
    expect(
      within(deityFilter).getByRole("option", { name: "Shiva" }),
    ).toBeInTheDocument();
  });
});
