// @vitest-environment node

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { fallbackCategories, fallbackProducts } from "@/data/catalog";

describe("<CatalogBrowser /> server rendering", () => {
  it("renders pagination links without browser globals", () => {
    expect(typeof window).toBe("undefined");
    const coin = fallbackProducts.find(
      (product) => product.categorySlug === "coin",
    )!;
    const markup = renderToStaticMarkup(
      <CatalogBrowser
        products={[coin]}
        categories={fallbackCategories}
        initialCategory="coin"
        initialFilters={{
          query: "silver",
          sort: "",
          category: "coin",
          purity: "",
          idolConstruction: "",
          deitySlug: "",
          coinShape: "",
          utensilType: "",
        }}
        initialPage={{
          products: [coin],
          total: 25,
          page: 1,
          pageSize: 24,
          degraded: false,
          facets: [
            {
              categorySlug: "coin",
              productCount: 25,
              purities: ["99.80"],
              coinShapes: ["round"],
              idolConstructions: [],
              utensilTypes: [],
              deities: [],
            },
          ],
        }}
        syncUrl
      />,
    );

    expect(markup).toContain('href="?q=silver&amp;page=2"');
    expect(markup).toContain("Page 1 of 2");
  });
});
