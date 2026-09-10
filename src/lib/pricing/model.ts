export const productFinishes = [
  "silver",
  "gold-polish",
  "antique",
  "colour",
  "steel-polish",
] as const;
export type ProductFinish = (typeof productFinishes)[number];
export type ProductPricing = {
  mode?: "automatic" | "manual";
  makingChargePerGram?: number;
  makingChargePerPiece?: number;
  manualTotalInr?: number;
  manualSizes?: {
    weightGrams: number;
    diameterInches: number;
    totalInr: number;
  }[];
  reviewedAt?: string;
  reviewDueAt?: string;
  finish?: ProductFinish;
};

export type MakingRule = {
  minimumWeightGrams: number;
  minimumExclusive?: boolean;
  finish?: ProductFinish;
  purity?: string;
  idolConstruction?: string;
  makingChargePerGram?: number;
  makingChargePerPiece?: number;
};

export type PricingProduct = {
  material?: string;
  categoryKind?: string;
  categorySlug?: string;
  weightGrams?: number;
  sizeVariants?: { weightGrams: number; diameterInches: number }[];
  pricing?: ProductPricing | null;
  categoryMakingChargePerGram?: number | null;
  categoryMakingChargePerPiece?: number | null;
  categoryMakingRules?: MakingRule[] | null;
  categoryPricingDeferred?: boolean;
  purity?: string;
  idolConstruction?: string;
};

export type PriceEstimate =
  | {
      status: "available";
      mode: "automatic" | "manual";
      currency: "INR";
      minimum: number;
      maximum: number;
      asOf: string;
      lastAvailable: boolean;
      sizes: { weightGrams: number; diameterInches: number; amount: number }[];
    }
  | { status: "unavailable" };

export type SilverReference = {
  itemId: string;
  unit: "PER_KG";
  value: number;
  snapshotAsOf: string;
};

export function isGold(product: PricingProduct) {
  return (
    product.material === "gold" ||
    product.categoryKind === "gold" ||
    product.categorySlug === "gold"
  );
}

const nonnegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const positive = (value: unknown): value is number =>
  nonnegative(value) && value > 0;

/** A product override wins; otherwise use the most specific applicable weight band. */
export function makingCharge(
  product: PricingProduct,
  weight: number,
): { perGram: number } | { perPiece: number } | undefined {
  const charge = (perGram: unknown, perPiece: unknown) => {
    if (perGram != null && perPiece != null) return undefined;
    if (nonnegative(perGram)) return { perGram };
    if (nonnegative(perPiece)) return { perPiece };
  };
  if (
    product.pricing?.makingChargePerGram !== undefined ||
    product.pricing?.makingChargePerPiece !== undefined
  )
    return charge(
      product.pricing.makingChargePerGram,
      product.pricing.makingChargePerPiece,
    );
  if (product.categoryMakingRules === null) return undefined;
  const rules = product.categoryMakingRules ?? [];
  if (!rules.length)
    return charge(
      product.categoryMakingChargePerGram,
      product.categoryMakingChargePerPiece,
    );
  if (rules.some((rule) => rule.finish) && !product.pricing?.finish)
    return undefined;
  const specificity = (rule: MakingRule) =>
    Number(Boolean(rule.finish)) +
    Number(Boolean(rule.purity)) +
    Number(Boolean(rule.idolConstruction));
  const matching = rules
    .filter(
      (rule) =>
        (rule.minimumExclusive
          ? weight > rule.minimumWeightGrams
          : weight >= rule.minimumWeightGrams) &&
        (!rule.finish || rule.finish === product.pricing?.finish) &&
        (!rule.purity || rule.purity === product.purity) &&
        (!rule.idolConstruction ||
          rule.idolConstruction === product.idolConstruction),
    )
    .sort(
      (a, b) =>
        specificity(b) - specificity(a) ||
        b.minimumWeightGrams - a.minimumWeightGrams,
    );
  if (!matching.length) return undefined;
  if (
    matching[1] &&
    specificity(matching[0]) === specificity(matching[1]) &&
    matching[0].minimumWeightGrams === matching[1].minimumWeightGrams
  )
    return undefined;
  return charge(
    matching[0].makingChargePerGram,
    matching[0].makingChargePerPiece,
  );
}

function makingTotal(product: PricingProduct, weight: number) {
  const charge = makingCharge(product, weight);
  return charge
    ? "perGram" in charge
      ? weight * charge.perGram
      : charge.perPiece
    : undefined;
}

/** Shared by Studio, imports, the activation audit and the server calculator. */
export function pricingIssues(product: PricingProduct): string[] {
  if (isGold(product) || product.categoryPricingDeferred) return [];
  if (product.pricing === null)
    return ["Correct the invalid product pricing fields."];
  const pricing = product.pricing ?? {};
  const variants = product.sizeVariants ?? [];
  if (pricing.mode === "manual") {
    if (!pricing.reviewedAt || !Number.isFinite(Date.parse(pricing.reviewedAt)))
      return ["Enter the manual price review date."];
    if (variants.length) {
      if (
        variants.some(
          (variant) =>
            !pricing.manualSizes?.some(
              (size) =>
                size.weightGrams === variant.weightGrams &&
                size.diameterInches === variant.diameterInches &&
                positive(size.totalInr),
            ),
        )
      )
        return ["Enter a manual total for every weight and diameter variant."];
    } else if (!positive(pricing.manualTotalInr))
      return ["Enter a positive manual total."];
    return [];
  }
  const issues: string[] = [];
  if (
    variants.length
      ? variants.some((size) => !positive(size.weightGrams))
      : !positive(product.weightGrams)
  )
    issues.push("Enter a verified weight or use a manual total.");
  const weights = variants.length
    ? variants.map((size) => size.weightGrams)
    : [product.weightGrams ?? 0];
  if (weights.some((weight) => !nonnegative(makingTotal(product, weight))))
    issues.push(
      "Enter a making charge or complete the finish/purity fields needed by the category's making rules; explicit zero is allowed.",
    );
  return issues;
}

/** Round the completed item total to the nearest ₹100; ₹50 ties round up. */
function roundItemTotal(amount: number) {
  return Math.round(amount / 100) * 100;
}

export function calculateEstimate(
  product: PricingProduct,
  reference: SilverReference | null,
  lastAvailable = false,
): PriceEstimate | undefined {
  if (isGold(product) || product.categoryPricingDeferred) return undefined;
  if (pricingIssues(product).length) return { status: "unavailable" };
  const pricing = product.pricing ?? {};
  const mode = pricing.mode ?? "automatic";
  if (mode === "automatic" && (!reference || !positive(reference.value)))
    return { status: "unavailable" };
  const automaticTotal = (weight: number) =>
    (weight * reference!.value) / 1_000 + makingTotal(product, weight)!;
  const sizes = (product.sizeVariants ?? []).map((variant) => ({
    ...variant,
    amount: roundItemTotal(
      mode === "manual"
        ? pricing.manualSizes!.find(
            (size) =>
              size.weightGrams === variant.weightGrams &&
              size.diameterInches === variant.diameterInches,
          )!.totalInr
        : automaticTotal(variant.weightGrams),
    ),
  }));
  const totals = sizes.length
    ? sizes.map((size) => size.amount)
    : [
        roundItemTotal(
          mode === "manual"
            ? pricing.manualTotalInr!
            : automaticTotal(product.weightGrams!),
        ),
      ];
  if (totals.some((amount) => !Number.isSafeInteger(amount) || amount <= 0))
    return { status: "unavailable" };
  return {
    status: "available",
    mode,
    currency: "INR",
    minimum: Math.min(...totals),
    maximum: Math.max(...totals),
    asOf: mode === "manual" ? pricing.reviewedAt! : reference!.snapshotAsOf,
    lastAvailable: mode === "automatic" && lastAvailable,
    sizes,
  };
}

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
export function formatEstimate(
  estimate: Extract<PriceEstimate, { status: "available" }>,
) {
  return estimate.minimum === estimate.maximum
    ? money.format(estimate.minimum)
    : `${money.format(estimate.minimum)}–${money.format(estimate.maximum)}`;
}
export function formatPriceDate(date: string) {
  return (
    new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(date)) + " IST"
  );
}
