// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { fallbackCategories, fallbackProducts } from "@/data/catalog";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

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
      name: "Filter by coin or bar shape",
    });
    expect(
      within(shapeFilter).getByRole("option", { name: "Round" }),
    ).toBeInTheDocument();
    expect(
      within(shapeFilter).queryByRole("option", { name: "Oval" }),
    ).not.toBeInTheDocument();
  });

  it("shows Gold purity and shape filters", () => {
    const goldProduct = {
      ...fallbackProducts.find((product) => product.categorySlug === "coin")!,
      title: "Card-Packed Gold Coin",
      slug: "card-packed-gold-coin",
      categorySlug: "gold",
      material: "gold" as const,
      purity: "99.50" as const,
      coinShape: "scalloped" as const,
    };
    const goldCategory = {
      ...fallbackCategories[0]!,
      title: "Gold Coins & Bars",
      slug: "gold",
    };

    render(
      <CatalogBrowser
        products={[goldProduct]}
        categories={[goldCategory]}
        initialCategory="gold"
      />,
    );

    expect(
      within(
        screen.getByRole("combobox", { name: "Filter by purity" }),
      ).getByRole("option", { name: "99.50%" }),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("combobox", {
          name: "Filter by coin or bar shape",
        }),
      ).getByRole("option", { name: "Scalloped" }),
    ).toBeInTheDocument();
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

describe("paginated catalog browsing", () => {
  const coin = fallbackProducts.find(
    (product) => product.categorySlug === "coin",
  )!;
  const second = {
    ...coin,
    slug: "second-page-coin",
    title: "Second Page Coin",
  };
  const initialPage = {
    products: [coin],
    total: 25,
    page: 1,
    pageSize: 24,
    degraded: false,
    facets: [
      {
        categorySlug: "coin",
        productCount: 25,
        purities: ["99.80" as const],
        coinShapes: ["round" as const, "oval" as const],
        idolConstructions: [],
        utensilTypes: [],
        deities: [],
      },
    ],
  };
  it("uses full-catalog facets, requests the next page and restores browser history", async () => {
    window.history.replaceState(null, "", "/products?category=coin");
    const fetch = vi
      .fn()
      .mockImplementation(async (url: string) => ({
        ok: true,
        json: async () =>
          url.includes("page=2")
            ? { ...initialPage, products: [second], page: 2 }
            : initialPage,
      }));
    vi.stubGlobal("fetch", fetch);
    render(
      <CatalogBrowser
        products={[coin]}
        categories={fallbackCategories}
        initialCategory="coin"
        initialPage={initialPage}
        syncUrl
      />,
    );
    expect(screen.getByRole("option", { name: "Oval" })).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("link", { name: "Next" }));
    expect(screen.getByRole("status")).toHaveTextContent("Updating designs");
    await screen.findByRole("heading", { name: second.title });
    expect(fetch.mock.calls[0][0]).toContain("page=2");
    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();
    window.history.replaceState(null, "", "/products?category=coin");
    fireEvent.popState(window);
    await waitFor(() =>
      expect(screen.getByText("Page 1 of 2")).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("heading", { name: second.title }),
    ).not.toBeInTheDocument();
  });
  it("shows an actionable error, retries, and resets pagination when filters change", async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({
        ok: true,
        json: async () => ({ ...initialPage, products: [second], page: 2 }),
      });
    vi.stubGlobal("fetch", fetch);
    render(
      <CatalogBrowser
        products={[coin]}
        categories={fallbackCategories}
        initialCategory="coin"
        initialPage={initialPage}
      />,
    );
    fireEvent.click(screen.getByRole("link", { name: "Next" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Previous results are shown",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByRole("heading", { name: second.title });
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search products" }),
      { target: { value: "silver" } },
    );
    await waitFor(() =>
      expect(fetch.mock.calls.at(-1)?.[0]).toContain(
        "q=silver&category=coin&page=1",
      ),
    );
  });
  it("uses a category's configured kind after its slug changes", () => {
    render(
      <CatalogBrowser
        products={[{ ...coin, categorySlug: "bullion" }]}
        categories={[
          { ...fallbackCategories[0], slug: "bullion", productKind: "coin" },
        ]}
        initialCategory="bullion"
      />,
    );
    expect(
      screen.getByRole("combobox", { name: "Filter by coin or bar shape" }),
    ).toBeInTheDocument();
  });
});
