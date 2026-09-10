import { describe, expect, it } from "vitest";
import defaults from "../../../docs/gallery-pricing-defaults.json";
import {
  calculateEstimate,
  makingCharge,
  pricingIssues,
  type PricingProduct,
  type SilverReference,
} from "./model";
import { decodeMakingRules, decodePricing } from "./validation";

const reference: SilverReference = {
  itemId: "cmomrj7er000004l5137q5fx4",
  unit: "PER_KG",
  value: 100_123.45,
  snapshotAsOf: "2026-01-01T10:00:00Z",
};
const product: PricingProduct = {
  weightGrams: 10,
  categoryMakingChargePerGram: 5,
  purity: "92.5",
};
describe("gallery pricing", () => {
  it("adds tax-inclusive making to the per-gram rate and rounds only the final total", () => {
    expect(calculateEstimate(product, reference)).toMatchObject({
      minimum: 1051,
      maximum: 1051,
      asOf: reference.snapshotAsOf,
    });
    expect(
      calculateEstimate({ ...product, purity: "99.80" }, reference),
    ).toEqual(calculateEstimate(product, reference));
    expect(
      calculateEstimate({ ...product, weightGrams: 20 }, reference),
    ).toMatchObject({ minimum: 2102 });
  });
  it("distinguishes explicit zero, inheritance, missing charges and invalid fields", () => {
    expect(
      calculateEstimate(
        { ...product, pricing: { makingChargePerGram: 0 } },
        reference,
      ),
    ).toMatchObject({ minimum: 1001 });
    expect(calculateEstimate({ weightGrams: 10 }, reference)).toEqual({
      status: "unavailable",
    });
    expect(
      calculateEstimate(
        { ...product, pricing: decodePricing({ makingChargePerGram: -1 }) },
        reference,
      ),
    ).toEqual({ status: "unavailable" });
    expect(calculateEstimate(product, null)).toEqual({ status: "unavailable" });
  });
  it.each([
    [249, "silver", 5],
    [250, "silver", 5],
    [250.001, "silver", 3],
    [250, "gold-polish", 10],
    [251, "gold-polish", 8],
  ] as const)(
    "uses owner-confirmed coin boundary at %sg %s",
    (weight, finish, expected) => {
      expect(
        makingCharge(
          {
            pricing: { finish },
            categoryMakingRules: decodeMakingRules(
              defaults["category-coin"].makingRules,
            ),
          },
          weight,
        ),
      ).toEqual({ perGram: expected });
    },
  );
  it("requires a verified finish and handles each size separately across a weight boundary", () => {
    const coin: PricingProduct = {
      categoryMakingRules: decodeMakingRules(
        defaults["category-coin"].makingRules,
      ),
      sizeVariants: [
        { weightGrams: 250, diameterInches: 3 },
        { weightGrams: 500, diameterInches: 4 },
      ],
    };
    expect(calculateEstimate(coin, reference)).toEqual({
      status: "unavailable",
    });
    expect(
      calculateEstimate({ ...coin, pricing: { finish: "silver" } }, reference),
    ).toMatchObject({
      minimum: 26281,
      maximum: 51562,
      sizes: [{ amount: 26281 }, { amount: 51562 }],
    });
  });
  it.each([
    [19, 2150],
    [20, 2250],
    [21, 2310],
  ])(
    "adds fixed or per-gram utensil making at %s g",
    (weightGrams, minimum) => {
      expect(
        calculateEstimate(
          {
            weightGrams,
            categoryMakingRules: decodeMakingRules(
              defaults["category-utensils"].makingRules,
            ),
          },
          { ...reference, value: 100_000 },
        ),
      ).toMatchObject({ minimum });
    },
  );
  it("adds the phone-cover making charge once per piece", () => {
    expect(
      calculateEstimate(
        { weightGrams: 100, categoryMakingChargePerPiece: 3000 },
        { ...reference, value: 100_000 },
      ),
    ).toMatchObject({ minimum: 13_000 });
    expect(
      calculateEstimate(
        {
          ...product,
          pricing: decodePricing({
            makingChargePerGram: 10,
            makingChargePerPiece: 3000,
          }),
        },
        reference,
      ),
    ).toEqual({ status: "unavailable" });
  });
  it.each([
    ["hollow", "silver", 25],
    ["hollow", "colour", 25],
    ["hollow", "antique", 25],
    ["hollow", "steel-polish", 30],
    ["solid", "silver", 10],
    ["solid", "antique", 15],
    ["semi-solid", "silver", 15],
    ["semi-solid", "antique", 15],
    ["semi-solid", "colour", 30],
  ] as const)(
    "uses %s %s idol charges",
    (idolConstruction, finish, expected) => {
      expect(
        makingCharge(
          {
            idolConstruction,
            pricing: { finish },
            categoryMakingRules: decodeMakingRules(
              defaults["category-idols"].makingRules,
            ),
          },
          100,
        ),
      ).toEqual({ perGram: expected });
    },
  );
  it("does not silently pick between ambiguous rules", () => {
    const rule = { minimumWeightGrams: 0, makingChargePerGram: 5 };
    expect(
      pricingIssues({
        ...product,
        categoryMakingRules: [rule, { ...rule, makingChargePerGram: 10 }],
      }),
    ).not.toEqual([]);
  });
  it("keeps manual totals visible past the review due date and without a rate", () => {
    const manual: PricingProduct = {
      pricing: {
        mode: "manual",
        manualTotalInr: 1234.6,
        reviewedAt: "2020-01-01T00:00:00Z",
        reviewDueAt: "2020-02-01T00:00:00Z",
      },
    };
    expect(calculateEstimate(manual, null, true)).toMatchObject({
      minimum: 1235,
      mode: "manual",
      asOf: "2020-01-01T00:00:00Z",
      lastAvailable: false,
    });
    expect(
      calculateEstimate(
        { pricing: { mode: "manual", manualTotalInr: 1000 } },
        reference,
      ),
    ).toEqual({ status: "unavailable" });
  });
  it("requires one manual total per variant", () => {
    const manual: PricingProduct = {
      sizeVariants: [
        { weightGrams: 10, diameterInches: 1 },
        { weightGrams: 20, diameterInches: 2 },
      ],
      pricing: {
        mode: "manual",
        reviewedAt: reference.snapshotAsOf,
        manualSizes: [{ weightGrams: 10, diameterInches: 1, totalInr: 500 }],
      },
    };
    expect(calculateEstimate(manual, null)).toEqual({ status: "unavailable" });
    manual.pricing!.manualSizes!.push({
      weightGrams: 20,
      diameterInches: 2,
      totalInr: 900,
    });
    expect(calculateEstimate(manual, null)).toMatchObject({
      minimum: 500,
      maximum: 900,
    });
    expect(
      decodePricing({
        ...manual.pricing,
        manualSizes: [
          ...manual.pricing!.manualSizes!,
          manual.pricing!.manualSizes![0],
        ],
      }),
    ).toBeNull();
  });
  it("does not price gold or owner-deferred categories", () => {
    expect(
      calculateEstimate({ ...product, material: "gold" }, reference),
    ).toBeUndefined();
    expect(
      calculateEstimate({ categoryPricingDeferred: true }, reference),
    ).toBeUndefined();
    expect(pricingIssues({ categoryPricingDeferred: true })).toEqual([]);
  });
});
