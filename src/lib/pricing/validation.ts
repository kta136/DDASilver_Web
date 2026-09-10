import { z } from "zod";
import type { MakingRule, ProductPricing } from "./model";
import { productFinishes } from "./model";

export const makingChargeSchema = z
  .number()
  .finite()
  .nonnegative()
  .max(1_000_000);
const money = z.number().positive().max(1_000_000_000);
const optional = <T extends z.ZodType>(schema: T) =>
  schema.nullish().transform((value) => value ?? undefined);
export const productPricingSchema = z
  .object({
    mode: optional(z.enum(["automatic", "manual"])),
    makingChargePerGram: optional(makingChargeSchema),
    makingChargePerPiece: optional(makingChargeSchema),
    manualTotalInr: optional(money),
    manualSizes: optional(
      z
        .array(
          z.object({
            weightGrams: z.number().positive(),
            diameterInches: z.number().positive(),
            totalInr: money,
          }),
        )
        .max(50)
        .refine(
          (sizes) =>
            new Set(
              sizes.map((size) => `${size.weightGrams}/${size.diameterInches}`),
            ).size === sizes.length,
          "Each weight and diameter must have one manual total.",
        ),
    ),
    reviewedAt: optional(z.iso.datetime({ offset: true })),
    reviewDueAt: optional(z.iso.datetime({ offset: true })),
    finish: optional(z.enum(productFinishes)),
  })
  .refine(
    (pricing) =>
      pricing.makingChargePerGram === undefined ||
      pricing.makingChargePerPiece === undefined,
    "Use either per-gram or per-piece making, not both.",
  );
export const makingRulesSchema = z
  .array(
    z
      .object({
        minimumWeightGrams: z.number().nonnegative(),
        minimumExclusive: optional(z.boolean()),
        finish: optional(z.enum(productFinishes)),
        purity: optional(z.string()),
        idolConstruction: optional(z.string()),
        makingChargePerGram: optional(makingChargeSchema),
        makingChargePerPiece: optional(makingChargeSchema),
      })
      .refine(
        (rule) =>
          Number(rule.makingChargePerGram !== undefined) +
            Number(rule.makingChargePerPiece !== undefined) ===
          1,
        "Enter exactly one making charge: per gram or per piece.",
      ),
  )
  .max(50);
export function decodeMakingRules(
  raw: unknown,
): MakingRule[] | null | undefined {
  if (raw == null) return undefined;
  const parsed = makingRulesSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

// Invalid pricing is represented separately, never a reason to discard a product.
export function decodePricing(raw: unknown): ProductPricing | null | undefined {
  if (raw == null) return undefined;
  const parsed = productPricingSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
export function decodeMakingCharge(raw: unknown): number | null | undefined {
  if (raw == null) return undefined;
  const parsed = makingChargeSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}
