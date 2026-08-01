import { describe, expect, it } from "vitest";

import {
  createPersonalRateView,
  flashStyleOrDefault,
  marketDataViewOrDefault,
  movePersonalRate,
  parsePersonalRateView,
  rateFontSizePercent,
  reconcilePersonalRateView,
} from "@/lib/rates/personal-view";

describe("personal rate view", () => {
  it("reconciles stored preferences with newly authorized items", () => {
    expect(
      reconcilePersonalRateView(
        createPersonalRateView({
          order: ["gold", "orphan", "silver"],
          hidden: ["coin"],
        }),
        ["silver", "gold", "coin", "mohar"],
      ),
    ).toEqual({
      order: ["gold", "silver", "mohar"],
      hidden: ["coin"],
    });
  });

  it("moves a row without losing the remaining order", () => {
    expect(movePersonalRate(["silver", "gold", "coin"], "coin", "silver"))
      .toEqual(["coin", "silver", "gold"]);
  });

  it("rejects malformed storage and removes duplicates", () => {
    expect(parsePersonalRateView("not-json")).toMatchObject({
      order: [],
      hidden: [],
    });
    expect(
      parsePersonalRateView(
        JSON.stringify({ order: ["gold", "gold", 1], hidden: ["coin"] }),
      ),
    ).toMatchObject({ order: ["gold"], hidden: ["coin"] });
  });

  it("parses all DDA Jewels display preferences safely", () => {
    const parsed = parsePersonalRateView(
      JSON.stringify({
        schemaVersion: 1,
        order: ["gold-cash"],
        hidden: [],
        hideBuyingColumn: false,
        rateFontSizeStep: 3.9,
        rateFontFamily: "mono",
        marketDataView: "cards",
        marketDataFontSizeStep: -2,
        flashStyle: "bold",
      }),
    );

    expect(parsed).toMatchObject({
      hideBuyingColumn: false,
      rateFontSizeStep: 3,
      rateFontFamily: "mono",
      marketDataView: "cards",
      marketDataFontSizeStep: -2,
      flashStyle: "bold",
    });
    expect(rateFontSizePercent(8)).toBe(172);
    expect(marketDataViewOrDefault("invalid")).toBe("table");
    expect(flashStyleOrDefault("invalid")).toBe("soft");
  });
});
