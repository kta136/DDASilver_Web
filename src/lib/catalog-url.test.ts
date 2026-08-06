import { describe, expect, it } from "vitest";

import {
  parseCatalogSearchParams,
  serializeCatalogFilters,
} from "@/lib/catalog-url";

const options = {
  categorySlugs: ["jewellery", "coin", "idols", "utensils"],
  deitySlugs: ["shiva"],
};

describe("catalog URL state", () => {
  it("accepts known filters and ignores unknown values", () => {
    const parsed = parseCatalogSearchParams(
      new URLSearchParams(
        "q=bracelet&category=idols&collection=unknown&purity=92.5&idol=solid&deity=shiva&shape=round",
      ),
      options,
    );

    expect(parsed).toEqual({
      query: "bracelet",
      category: "idols",
      purity: "92.5",
      idolConstruction: "solid",
      deitySlug: "shiva",
      coinShape: "",
      utensilType: "",
    });
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
});
