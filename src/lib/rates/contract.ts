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
  bid: numberLike.optional(),
  ask: numberLike.optional(),
  high: numberLike.optional(),
  low: numberLike.optional(),
  open: numberLike.optional(),
  previousClose: numberLike.optional(),
  sortOrder: z.number().int().optional(),
});

export const feedStatusSchema = z.union([
  z.enum(["live", "stale", "closed", "unavailable"]),
  z.object({
    status: z.enum(["live", "stale", "closed", "unavailable"]),
    message: z.string().trim().max(240).optional(),
    updatedAt: z.string().datetime({ offset: true }).optional(),
  }),
]);

const legacyRateSnapshotSchema = z
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

const ddaJewelsUnitSchema = z.enum([
  "PER_GRAM",
  "PER_10_GRAM",
  "PER_KG",
]);
const ddaJewelsDirectionSchema = z.enum(["UP", "DOWN", "FLAT"]);
const ddaJewelsMovementValueSchema = z
  .number()
  .finite()
  .nonnegative()
  .max(1_000_000_000_000);
const ddaJewelsRateItemSchema = z.object({
  itemId: identifier,
  name: boundedText.optional(),
  unit: ddaJewelsUnitSchema.optional(),
  finalRate: monetaryNumber,
  movementValue: ddaJewelsMovementValueSchema,
  movementDirection: ddaJewelsDirectionSchema,
});
const ddaJewelsSourceItemSchema = z.object({
  sourceId: identifier,
  name: boundedText,
  unit: ddaJewelsUnitSchema,
  sortOrder: z.number().int(),
  bid: numberLike,
  ask: numberLike,
  high: numberLike,
  low: numberLike,
  sourceTimestamp: z.string().datetime({ offset: true }).nullable(),
  calculatedAt: z.string().datetime({ offset: true }).nullable(),
});
const ddaJewelsFeedStatusSchema = z.object({
  status: z.enum(["live", "stale", "closed", "unavailable"]).nullable(),
});

function normalizeDdaJewelsDirection(
  direction: z.infer<typeof ddaJewelsDirectionSchema>,
) {
  return direction.toLocaleLowerCase("en-IN") as
    | "up"
    | "down"
    | "flat";
}

function normalizeDdaJewelsRateItem(
  item: z.infer<typeof ddaJewelsRateItemSchema>,
): RateItem {
  const direction = normalizeDdaJewelsDirection(item.movementDirection);
  const signedChange =
    direction === "down"
      ? -item.movementValue
      : direction === "up"
        ? item.movementValue
        : 0;
  return {
    id: item.itemId,
    ...(item.name ? { name: item.name } : {}),
    ...(item.unit ? { unit: item.unit } : {}),
    value: item.finalRate,
    change: signedChange,
    direction,
  };
}

function normalizeDdaJewelsSourceItem(
  source: z.infer<typeof ddaJewelsSourceItemSchema>,
): SourceItem {
  return {
    id: source.sourceId,
    name: source.name,
    unit: source.unit,
    sortOrder: source.sortOrder,
    bid: source.bid,
    ask: source.ask,
    high: source.high,
    low: source.low,
    value: source.ask,
  };
}

const ddaJewelsCurrentSnapshotSchema = z
  .object({
    schemaVersion,
    view: identifier,
    serverTime: z.string().datetime({ offset: true }),
    sequence,
    items: z.array(ddaJewelsRateItemSchema).max(100),
    feedStatus: ddaJewelsFeedStatusSchema,
  })
  .superRefine((snapshot, context) => {
    const seen = new Set<string>();
    for (const item of snapshot.items) {
      if (seen.has(item.itemId)) {
        context.addIssue({
          code: "custom",
          message: "Duplicate items id",
          path: ["items", item.itemId],
        });
      }
      seen.add(item.itemId);
    }
  })
  .transform((snapshot) => ({
    schemaVersion: snapshot.schemaVersion,
    view: snapshot.view,
    serverTime: snapshot.serverTime,
    sequence: snapshot.sequence,
    items: snapshot.items.map(normalizeDdaJewelsRateItem),
    sources: [] as SourceItem[],
    feedStatus: snapshot.feedStatus.status ?? ("unavailable" as const),
  }));

export const rateSnapshotSchema = z.union([
  legacyRateSnapshotSchema,
  ddaJewelsCurrentSnapshotSchema,
]);

const legacyNestedRateEventSchema = z
  .object({
    schemaVersion,
    sequence,
    item: rateItemSchema,
  })
  .transform((event) => ({
    sequence: event.sequence,
    items: [event.item],
  }));
const legacyInlineRateEventSchema = z
  .object({
    schemaVersion,
    sequence,
  })
  .and(rateItemSchema)
  .transform((event) => ({
    sequence: event.sequence,
    items: [event],
  }));
const ddaJewelsRateEventSchema = z
  .object({
    schemaVersion,
    sequence,
    items: z.array(ddaJewelsRateItemSchema).max(100),
  })
  .transform((event) => ({
    sequence: event.sequence,
    items: event.items.map(normalizeDdaJewelsRateItem),
  }));

export const rateEventSchema = z.union([
  legacyNestedRateEventSchema,
  legacyInlineRateEventSchema,
  ddaJewelsRateEventSchema,
]);

const legacySourceSnapshotEventSchema = z
  .object({
    schemaVersion,
    sequence,
    sources: z.array(sourceItemSchema).max(100),
  })
  .transform((event) => ({
    sequence: event.sequence as number | undefined,
    sources: event.sources,
  }));
const ddaJewelsSourceBatchEventSchema = z
  .object({
    schemaVersion,
    sources: z.array(ddaJewelsSourceItemSchema).max(100),
  })
  .transform((event) => ({
    sequence: undefined as number | undefined,
    sources: event.sources.map(normalizeDdaJewelsSourceItem),
  }));

export const sourceSnapshotEventSchema = z.union([
  legacySourceSnapshotEventSchema,
  ddaJewelsSourceBatchEventSchema,
]);

const legacyNestedSourceEventSchema = z
  .object({
    schemaVersion,
    sequence,
    source: sourceItemSchema,
  })
  .transform((event) => ({
    sequence: event.sequence as number | undefined,
    sources: [event.source],
  }));
const legacyInlineSourceEventSchema = z
  .object({
    schemaVersion,
    sequence,
  })
  .and(sourceItemSchema)
  .transform((event) => ({
    sequence: event.sequence as number | undefined,
    sources: [event],
  }));

export const sourceEventSchema = z.union([
  legacyNestedSourceEventSchema,
  legacyInlineSourceEventSchema,
  ddaJewelsSourceBatchEventSchema,
]);

const legacyFeedStatusEventSchema = z
  .object({
    schemaVersion,
    sequence,
    feedStatus: feedStatusSchema,
    serverTime: z.string().datetime({ offset: true }).optional(),
  })
  .transform((event) => ({
    sequence: event.sequence as number | undefined,
    feedStatus: event.feedStatus,
    serverTime: event.serverTime,
  }));
const ddaJewelsFeedStatusEventSchema = z
  .object({
    schemaVersion,
    status: z.enum(["live", "stale", "closed", "unavailable"]).nullable(),
  })
  .transform((event) => ({
    sequence: undefined as number | undefined,
    feedStatus: event.status ?? ("unavailable" as const),
    serverTime: undefined as string | undefined,
  }));

export const feedStatusEventSchema = z.union([
  legacyFeedStatusEventSchema,
  ddaJewelsFeedStatusEventSchema,
]);

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
