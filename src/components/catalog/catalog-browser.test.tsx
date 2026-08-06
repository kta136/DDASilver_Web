// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
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

  it("filters utensils by bowl or plate", () => {
    const bowl = fallbackProducts.find(
      (product) => product.categorySlug === "utensils",
    )!;
    const plate = {
      ...bowl,
      title: "Concentric-Line Silver Plate",
      slug: "concentric-line-silver-plate",
      utensilType: "plate" as const,
    };

    render(
      <CatalogBrowser
        products={[bowl, plate]}
        categories={fallbackCategories}
        initialCategory="utensils"
      />,
    );

    const itemTypeFilter = screen.getByRole("combobox", {
      name: "Filter by utensil item type",
    });
    expect(
      within(itemTypeFilter).getByRole("option", { name: "Bowl" }),
    ).toBeInTheDocument();
    expect(
      within(itemTypeFilter).getByRole("option", { name: "Plate" }),
    ).toBeInTheDocument();
    expect(
      within(itemTypeFilter).queryByRole("option", { name: "Jug" }),
    ).not.toBeInTheDocument();

    fireEvent.change(itemTypeFilter, { target: { value: "plate" } });

    expect(
      screen.getByRole("heading", { name: "Concentric-Line Silver Plate" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: bowl.title }),
    ).not.toBeInTheDocument();
  });
});
