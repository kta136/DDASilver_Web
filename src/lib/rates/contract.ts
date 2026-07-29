import { z } from "zod";

const schemaVersion = z.union([
  z.literal(1),
  z.literal("1"),
  z.literal("v1"),
]);
const identifier = z.string().trim().min(1).max(80);
const boundedText = z.string().trim().min(1).max(160);
const decimalString = z
  .string()
  .trim()
  .min(1)
  .max(32)
  .regex(/^\d+(?:\.\d+)?$/);
const monetaryNumber = z.number().finite().nonnegative().max(1_000_000_000_000);
const numberLike = z.union([monetaryNumber, decimalString]).nullable();
const sequence = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);

export const rateItemSchema = z.object({
  id: identifier,
  name: boundedText.optional(),
  label: boundedText.optional(),
  value: numberLike.optional(),
  rate: numberLike.optional(),
  displayValue: numberLike.optional(),
  change: z.number().finite().min(-1_000_000_000_000).max(1_000_000_000_000).optional(),
  direction: z.enum(["up", "down", "flat"]).optional(),
  unit: z.string().trim().max(32).optional(),
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
    message: z.string().trim().max(240).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  }),
]);

export const rateSnapshotSchema = z
  .object({
    schemaVersion,
    view: identifier,
    serverTime: z.string().datetime({ offset: true }),
    sequence,
    items: z.array(rateItemSchema).max(100),
    sources: z.array(sourceItemSchema).max(100),
    feedStatus: feedStatusSchema,
  })
  .superRefine((snapshot, context) => {
    for (const [field, values] of [
      ["items", snapshot.items],
      ["sources", snapshot.sources],
    ] as const) {
      const seen = new Set<string>();
      for (const value of values) {
        if (seen.has(value.id)) {
          context.addIssue({
            code: "custom",
            message: `Duplicate ${field} id`,
            path: [field, value.id],
          });
        }
        seen.add(value.id);
      }
    }
  });

export const rateEventSchema = z.object({
  schemaVersion,
  sequence,
  item: rateItemSchema.optional(),
}).and(rateItemSchema.partial());

export const sourceSnapshotEventSchema = z.object({
  schemaVersion,
  sequence,
  sources: z.array(sourceItemSchema).max(100),
});

export const sourceEventSchema = z.object({
  schemaVersion,
  sequence,
  source: sourceItemSchema.optional(),
}).and(sourceItemSchema.partial());

export const feedStatusEventSchema = z.object({
  schemaVersion,
  sequence,
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
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" &&
    !/^\d+(?:\.\d+)?$/.test(value.trim())
  ) {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value.trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function extractNumberLike(
  value: z.infer<typeof numberLike> | undefined,
) {
  if (value === null || value === undefined) {
    return null;
  }

  if (
    typeof value === "string" &&
    !/^\d+(?:\.\d+)?$/.test(value.trim())
  ) {
    return null;
  }
  const parsed = typeof value === "number" ? value : Number(value.trim());
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function normalizeRateIdentifier(value: string) {
  return value
    .toLocaleLowerCase("en-IN")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function isRateSnapshotFresh(
  serverTime: string,
  now = Date.now(),
  maxAgeMs = 90_000,
  maxFutureSkewMs = 30_000,
) {
  const timestamp = Date.parse(serverTime);
  return (
    Number.isFinite(timestamp) &&
    timestamp >= now - maxAgeMs &&
    timestamp <= now + maxFutureSkewMs
  );
}
