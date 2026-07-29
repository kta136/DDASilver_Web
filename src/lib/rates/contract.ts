import { z } from "zod";

const numberLike = z.union([z.number(), z.string()]).nullable();

export const rateItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  label: z.string().min(1).optional(),
  value: numberLike.optional(),
  rate: numberLike.optional(),
  displayValue: numberLike.optional(),
  change: z.number().optional(),
  direction: z.enum(["up", "down", "flat"]).optional(),
  unit: z.string().optional(),
});

export const sourceItemSchema = rateItemSchema.extend({
  high: numberLike.optional(),
  low: numberLike.optional(),
  open: numberLike.optional(),
  previousClose: numberLike.optional(),
});

export const feedStatusSchema = z.union([
  z.enum(["live", "stale", "closed", "unavailable"]),
  z.object({
    status: z.enum(["live", "stale", "closed", "unavailable"]),
    message: z.string().optional(),
    updatedAt: z.string().optional(),
  }),
]);

export const rateSnapshotSchema = z.object({
  schemaVersion: z.union([z.literal(1), z.literal("1"), z.literal("v1")]),
  view: z.string().min(1),
  serverTime: z.string().datetime({ offset: true }),
  sequence: z.number().int().nonnegative(),
  items: z.array(rateItemSchema),
  sources: z.array(sourceItemSchema),
  feedStatus: feedStatusSchema,
});

export const rateEventSchema = z.object({
  schemaVersion: z
    .union([z.literal(1), z.literal("1"), z.literal("v1")])
    .optional(),
  sequence: z.number().int().nonnegative(),
  item: rateItemSchema.optional(),
}).and(rateItemSchema.partial());

export const sourceSnapshotEventSchema = z.object({
  schemaVersion: z
    .union([z.literal(1), z.literal("1"), z.literal("v1")])
    .optional(),
  sequence: z.number().int().nonnegative(),
  sources: z.array(sourceItemSchema),
});

export const sourceEventSchema = z.object({
  schemaVersion: z
    .union([z.literal(1), z.literal("1"), z.literal("v1")])
    .optional(),
  sequence: z.number().int().nonnegative(),
  source: sourceItemSchema.optional(),
}).and(sourceItemSchema.partial());

export const feedStatusEventSchema = z.object({
  schemaVersion: z
    .union([z.literal(1), z.literal("1"), z.literal("v1")])
    .optional(),
  sequence: z.number().int().nonnegative(),
  feedStatus: feedStatusSchema,
  serverTime: z.string().datetime({ offset: true }).optional(),
});

export type RateItem = z.infer<typeof rateItemSchema>;
export type SourceItem = z.infer<typeof sourceItemSchema>;
export type RateSnapshot = z.infer<typeof rateSnapshotSchema>;
export type FeedStatus = z.infer<typeof feedStatusSchema>;

export function normalizeFeedStatus(status: FeedStatus) {
  return typeof status === "string" ? status : status.status;
}

export function extractRateValue(item?: RateItem) {
  if (!item) {
    return null;
  }

  const value = item.displayValue ?? item.value ?? item.rate;
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function extractNumberLike(
  value: z.infer<typeof numberLike> | undefined,
) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizedRateId(item: Pick<RateItem, "id" | "name" | "label">) {
  return `${item.id} ${item.name ?? ""} ${item.label ?? ""}`
    .toLocaleLowerCase("en-IN")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
