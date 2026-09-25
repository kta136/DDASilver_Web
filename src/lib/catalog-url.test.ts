import { describe, expect, it } from "vitest";

import {
  parseCatalogSearchParams,
  serializeCatalogBrowserUrl,
  serializeCatalogFilters,
  toCatalogSearchParams,
} from "@/lib/catalog-url";

const options = {
  categorySlugs: ["jewellery", "coin", "gold", "idols", "utensils"],
  deitySlugs: ["shiva"],
};

describe("catalog URL state", () => {
  it("accepts known filters and ignores unknown values", () => {
    const parsed = parseCatalogSearchParams(
      new URLSearchParams(
        "q=bracelet&sort=price-desc&category=idols&collection=unknown&purity=92.5&idol=solid&deity=shiva&shape=round",
      ),
      options,
    );

    expect(parsed).toEqual({
      query: "bracelet",
      sort: "price-desc",
      category: "idols",
      purity: "92.5",
      idolConstruction: "solid",
      deitySlug: "shiva",
      coinShape: "",
      utensilType: "",
    });
  });

  it("ignores unsupported sort values and round-trips supported values", () => {
    const unsupported = parseCatalogSearchParams(
      new URLSearchParams("sort=discount"),
      options,
    );
    expect(unsupported.sort).toBe("");

    const supported = parseCatalogSearchParams(
      new URLSearchParams("category=coin&sort=weight-asc"),
      options,
    );
    expect(serializeCatalogFilters(supported).toString()).toBe(
      "sort=weight-asc&category=coin",
    );
  });

  it("round-trips the utensil item filter", () => {
    const parsed = parseCatalogSearchParams(
      new URLSearchParams("category=utensils&item=plate"),
      options,
    );

    expect(parsed.category).toBe("utensils");
    expect(parsed.utensilType).toBe("plate");
    expect(serializeCatalogFilters(parsed).toString()).toBe(
      "category=utensils&item=plate",
    );
  });

  it("round-trips the bottle utensil item filter", () => {
    const parsed = parseCatalogSearchParams(
      new URLSearchParams("category=utensils&item=bottle"),
      options,
    );

    expect(parsed.category).toBe("utensils");
    expect(parsed.utensilType).toBe("bottle");
    expect(serializeCatalogFilters(parsed).toString()).toBe(
      "category=utensils&item=bottle",
    );
  });

  it("round-trips Pooja Thali Sets", () => {
    const parsed = parseCatalogSearchParams(
      new URLSearchParams("category=utensils&item=pooja-thali-set"),
      options,
    );

    expect(parsed.utensilType).toBe("pooja-thali-set");
    expect(serializeCatalogFilters(parsed).toString()).toBe(
      "category=utensils&item=pooja-thali-set",
    );
  });

  it("round-trips 91.60% Gold purity and scalloped shape", () => {
    const parsed = parseCatalogSearchParams(
      new URLSearchParams("category=gold&purity=91.60&shape=scalloped"),
      options,
    );

    expect(parsed.purity).toBe("91.60");
    expect(parsed.coinShape).toBe("scalloped");
    expect(serializeCatalogFilters(parsed).toString()).toBe(
      "category=gold&purity=91.60&shape=scalloped",
    );
  });

  it("serializes active filters without discarding unrelated parameters", () => {
    const serialized = serializeCatalogFilters(
      {
        query: " coin ",
        category: "coin",
        coinShape: "round",
      },
      new URLSearchParams("ref=home&collection=heritage"),
    );

    expect(serialized.toString()).toBe(
      "ref=home&q=coin&category=coin&shape=round",
    );
  });

  it("defaults an omitted category to the category route only when absent", () => {
    expect(
      parseCatalogSearchParams(new URLSearchParams("sort=weight-asc"), {
        ...options,
        defaultCategory: "coin",
      }).category,
    ).toBe("coin");
    expect(
      parseCatalogSearchParams(new URLSearchParams("category="), {
        ...options,
        defaultCategory: "coin",
      }).category,
    ).toBe("");
  });

  it("serializes the route default as an omitted category and removes page one", () => {
    const params = serializeCatalogBrowserUrl(
      {
        query: " silver ",
        sort: "weight-desc",
        category: "coin",
        purity: "92.5",
        idolConstruction: "",
        deitySlug: "",
        coinShape: "",
        utensilType: "",
      },
      {
        current: new URLSearchParams("campaign=home&page=2"),
        defaultCategory: "coin",
        page: 1,
      },
    );

    expect(params.toString()).toBe(
      "campaign=home&q=silver&sort=weight-desc&purity=92.5",
    );
  });

  it("keeps a different category, active filters and page two in browser URLs", () => {
    const params = serializeCatalogBrowserUrl(
      {
        query: "silver",
        sort: "",
        category: "gold",
        purity: "91.60",
        idolConstruction: "",
        deitySlug: "",
        coinShape: "scalloped",
        utensilType: "",
      },
      {
        current: new URLSearchParams("campaign=home&page=1"),
        defaultCategory: "coin",
        page: 2,
      },
    );

    expect(params.get("campaign")).toBe("home");
    expect(params.get("category")).toBe("gold");
    expect(params.get("q")).toBe("silver");
    expect(params.get("purity")).toBe("91.60");
    expect(params.get("shape")).toBe("scalloped");
    expect(params.get("page")).toBe("2");
  });

  it("preserves an explicit category clear on the browser URL", () => {
    const filters = {
      query: "",
      sort: "",
      category: "",
      purity: "",
      idolConstruction: "",
      deitySlug: "",
      coinShape: "",
      utensilType: "",
    } as const;
    const browserUrl = serializeCatalogBrowserUrl(filters, {
      current: new URLSearchParams("category=coin&page=2"),
      defaultCategory: "coin",
      page: 1,
    });

    expect(browserUrl.toString()).toBe("category=");
    expect(toCatalogSearchParams({ category: [""], q: "" }).toString()).toBe(
      "category=",
    );
    expect(serializeCatalogFilters(filters).toString()).toBe("");
  });
});
