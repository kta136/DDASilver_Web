import {
  extractNumberLike,
  extractRateValue,
  isRateSnapshotFresh,
  normalizeFeedStatus,
  normalizeRateIdentifier,
  type FeedStatus,
  type FeedStatusValue,
  type NumberLike,
  type PremiumBreakdown,
  type RateDirection,
  type RateItem,
  type RateSnapshot,
  type RateUnit,
  type SourceItem,
} from "@/lib/rates/model";

export {
  extractNumberLike,
  extractRateValue,
  isRateSnapshotFresh,
  normalizeFeedStatus,
  normalizeRateIdentifier,
  type FeedStatus,
  type RateItem,
  type RateSnapshot,
  type SourceItem,
};

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

type ClientSchema<T> = {
  safeParse(value: unknown): SafeParseResult<T>;
};

type RateEvent = { sequence: number; items: RateItem[] };
type SourceEvent = { sequence?: number; sources: SourceItem[] };
type FeedStatusEvent = {
  sequence?: number;
  feedStatus: FeedStatus;
  serverTime?: string;
};

const maximumFinancialValue = 1_000_000_000_000;
const maximumItems = 100;
const validSchemaVersions = new Set<unknown>([1, "1", "v1"]);
const rateUnits = new Set<RateUnit>(["PER_GRAM", "PER_10_GRAM", "PER_KG"]);
const rateDirections = new Set<RateDirection>(["up", "down", "flat"]);
const ddaJewelsDirections = new Set(["UP", "DOWN", "FLAT"] as const);
const feedStatuses = new Set<FeedStatusValue>([
  "live",
  "stale",
  "closed",
  "unavailable",
]);

function schema<T>(parser: (value: unknown) => T): ClientSchema<T> {
  return {
    safeParse(value) {
      try {
        return { success: true, data: parser(value) };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error("Invalid rate data"),
        };
      }
    },
  };
}

function invalid(message: string): never {
  throw new Error(message);
}

function record(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    invalid(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function has(object: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function schemaVersion(value: unknown): RateSnapshot["schemaVersion"] {
  if (!validSchemaVersions.has(value)) invalid("Unsupported schema version");
  return value as RateSnapshot["schemaVersion"];
}

function text(value: unknown, label: string, minimum: number, maximum: number) {
  if (typeof value !== "string") invalid(`${label} must be text`);
  const parsed = value.trim();
  if (parsed.length < minimum || parsed.length > maximum) {
    invalid(`${label} has an invalid length`);
  }
  return parsed;
}

function optionalText(
  object: Record<string, unknown>,
  key: string,
  minimum: number,
  maximum: number,
) {
  return !has(object, key) || object[key] === undefined
    ? undefined
    : text(object[key], key, minimum, maximum);
}

function finiteNumber(
  value: unknown,
  label: string,
  minimum: number,
  maximum: number,
  integer = false,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum ||
    (integer && !Number.isInteger(value))
  ) {
    invalid(`${label} must be a bounded${integer ? " integer" : " number"}`);
  }
  return value;
}

function optionalNumber(
  object: Record<string, unknown>,
  key: string,
  minimum: number,
  maximum: number,
  integer = false,
) {
  return !has(object, key) || object[key] === undefined
    ? undefined
    : finiteNumber(object[key], key, minimum, maximum, integer);
}

function numberLike(value: unknown, label: string): NumberLike {
  if (value === null) return null;
  if (typeof value === "number") {
    return finiteNumber(value, label, 0, maximumFinancialValue);
  }
  if (typeof value !== "string") invalid(`${label} must be numeric`);
  const parsed = value.trim();
  if (
    parsed.length < 1 ||
    parsed.length > 32 ||
    !/^\d+(?:\.\d+)?$/.test(parsed)
  ) {
    invalid(`${label} must be a decimal value`);
  }
  return parsed;
}

function optionalNumberLike(object: Record<string, unknown>, key: string) {
  return !has(object, key) || object[key] === undefined
    ? undefined
    : numberLike(object[key], key);
}

function dateTime(value: unknown, label: string) {
  const parsed = text(value, label, 1, 64);
  if (
    !/(?:Z|[+-]\d{2}:\d{2})$/i.test(parsed) ||
    !Number.isFinite(Date.parse(parsed))
  ) {
    invalid(`${label} must be an ISO date-time with an offset`);
  }
  return parsed;
}

function optionalDateTime(object: Record<string, unknown>, key: string) {
  return !has(object, key) || object[key] === undefined
    ? undefined
    : dateTime(object[key], key);
}

function nullableDateTime(value: unknown, label: string) {
  return value === null ? null : dateTime(value, label);
}

function array<T>(
  value: unknown,
  label: string,
  parser: (item: unknown) => T,
) {
  if (!Array.isArray(value) || value.length > maximumItems) {
    invalid(`${label} must be a bounded array`);
  }
  return value.map(parser);
}

function assign<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: T[K] | undefined,
) {
  if (value !== undefined) target[key] = value;
}

function parsePremiumBreakdown(value: unknown): PremiumBreakdown {
  const object = record(value, "premium breakdown");
  if (typeof object.unit !== "string" || !rateUnits.has(object.unit as RateUnit)) {
    invalid("premium breakdown unit is invalid");
  }
  return {
    unit: object.unit as RateUnit,
    l1: finiteNumber(object.l1, "l1", -maximumFinancialValue, maximumFinancialValue),
    l2: finiteNumber(object.l2, "l2", -maximumFinancialValue, maximumFinancialValue),
    total: finiteNumber(
      object.total,
      "total",
      -maximumFinancialValue,
      maximumFinancialValue,
    ),
  };
}

function parseOptionalPremium(
  object: Record<string, unknown>,
  key: "premiumBreakdown",
) {
  if (!has(object, key) || object[key] === undefined) return undefined;
  return object[key] === null ? null : parsePremiumBreakdown(object[key]);
}

function parseRateItem(value: unknown): RateItem {
  const object = record(value, "rate item");
  const item: RateItem = { id: text(object.id, "id", 1, 80) };
  assign(item, "name", optionalText(object, "name", 1, 160));
  assign(item, "label", optionalText(object, "label", 1, 160));
  assign(item, "value", optionalNumberLike(object, "value"));
  assign(item, "rate", optionalNumberLike(object, "rate"));
  assign(item, "displayValue", optionalNumberLike(object, "displayValue"));
  assign(
    item,
    "change",
    optionalNumber(object, "change", -maximumFinancialValue, maximumFinancialValue),
  );
  if (has(object, "direction") && object.direction !== undefined) {
    if (
      typeof object.direction !== "string" ||
      !rateDirections.has(object.direction as RateDirection)
    ) {
      invalid("direction is invalid");
    }
    item.direction = object.direction as RateDirection;
  }
  assign(item, "buyingRate", optionalNumberLike(object, "buyingRate"));
  if (has(object, "premiumTotal") && object.premiumTotal !== undefined) {
    item.premiumTotal =
      object.premiumTotal === null
        ? null
        : finiteNumber(
            object.premiumTotal,
            "premiumTotal",
            -maximumFinancialValue,
            maximumFinancialValue,
          );
  }
  assign(item, "premiumBreakdown", parseOptionalPremium(object, "premiumBreakdown"));
  assign(item, "unit", optionalText(object, "unit", 0, 32));
  return item;
}

function parseSourceItem(value: unknown): SourceItem {
  const object = record(value, "source item");
  const source: SourceItem = parseRateItem(object);
  for (const key of ["bid", "ask", "high", "low", "open", "previousClose"] as const) {
    assign(source, key, optionalNumberLike(object, key));
  }
  assign(
    source,
    "sortOrder",
    optionalNumber(object, "sortOrder", -Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, true),
  );
  return source;
}

function parseFeedStatus(value: unknown): FeedStatus {
  if (typeof value === "string") {
    if (!feedStatuses.has(value as FeedStatusValue)) invalid("feed status is invalid");
    return value as FeedStatusValue;
  }
  const object = record(value, "feed status");
  if (typeof object.status !== "string" || !feedStatuses.has(object.status as FeedStatusValue)) {
    invalid("feed status is invalid");
  }
  const status: Exclude<FeedStatus, string> = {
    status: object.status as FeedStatusValue,
  };
  assign(status, "message", optionalText(object, "message", 0, 240));
  assign(status, "updatedAt", optionalDateTime(object, "updatedAt"));
  return status;
}

function parseDdaJewelsRateItem(value: unknown): RateItem {
  const object = record(value, "DDAJewels rate item");
  if (
    typeof object.movementDirection !== "string" ||
    !ddaJewelsDirections.has(
      object.movementDirection as "UP" | "DOWN" | "FLAT",
    )
  ) {
    invalid("movement direction is invalid");
  }
  if (
    has(object, "unit") &&
    object.unit !== undefined &&
    (typeof object.unit !== "string" || !rateUnits.has(object.unit as RateUnit))
  ) {
    invalid("unit is invalid");
  }
  const movement = finiteNumber(
    object.movementValue,
    "movementValue",
    0,
    maximumFinancialValue,
  );
  const direction = object.movementDirection.toLocaleLowerCase("en-IN") as RateDirection;
  const item: RateItem = {
    id: text(object.itemId, "itemId", 1, 80),
    value: finiteNumber(object.finalRate, "finalRate", 0, maximumFinancialValue),
    change: direction === "down" ? -movement : direction === "up" ? movement : 0,
    direction,
  };
  assign(item, "name", optionalText(object, "name", 1, 160));
  if (typeof object.unit === "string") item.unit = object.unit;
  assign(item, "buyingRate", optionalNumberLike(object, "buyingRate"));
  if (has(object, "premiumTotal") && object.premiumTotal !== undefined) {
    item.premiumTotal =
      object.premiumTotal === null
        ? null
        : finiteNumber(
            object.premiumTotal,
            "premiumTotal",
            -maximumFinancialValue,
            maximumFinancialValue,
          );
  }
  assign(item, "premiumBreakdown", parseOptionalPremium(object, "premiumBreakdown"));
  return item;
}

function parseDdaJewelsSourceItem(value: unknown): SourceItem {
  const object = record(value, "DDAJewels source item");
  if (typeof object.unit !== "string" || !rateUnits.has(object.unit as RateUnit)) {
    invalid("source unit is invalid");
  }
  nullableDateTime(object.sourceTimestamp, "sourceTimestamp");
  nullableDateTime(object.calculatedAt, "calculatedAt");
  const ask = numberLike(object.ask, "ask");
  return {
    id: text(object.sourceId, "sourceId", 1, 80),
    name: text(object.name, "name", 1, 160),
    unit: object.unit,
    sortOrder: finiteNumber(
      object.sortOrder,
      "sortOrder",
      -Number.MAX_SAFE_INTEGER,
      Number.MAX_SAFE_INTEGER,
      true,
    ),
    bid: numberLike(object.bid, "bid"),
    ask,
    high: numberLike(object.high, "high"),
    low: numberLike(object.low, "low"),
    value: ask,
  };
}

function uniqueIds(values: readonly { id: string }[], label: string) {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) invalid(`Duplicate ${label} id`);
    ids.add(value.id);
  }
}

function parseLegacySnapshot(value: unknown): RateSnapshot {
  const object = record(value, "rate snapshot");
  const items = array(object.items, "items", parseRateItem);
  const sources = array(object.sources, "sources", parseSourceItem);
  uniqueIds(items, "items");
  uniqueIds(sources, "sources");
  return {
    schemaVersion: schemaVersion(object.schemaVersion),
    view: text(object.view, "view", 1, 80),
    serverTime: dateTime(object.serverTime, "serverTime"),
    sequence: finiteNumber(
      object.sequence,
      "sequence",
      0,
      Number.MAX_SAFE_INTEGER,
      true,
    ),
    items,
    sources,
    feedStatus: parseFeedStatus(object.feedStatus),
  };
}

function parseDdaJewelsSnapshot(value: unknown): RateSnapshot {
  const object = record(value, "DDAJewels snapshot");
  const items = array(object.items, "items", parseDdaJewelsRateItem);
  uniqueIds(items, "items");
  const status = record(object.feedStatus, "feedStatus").status;
  if (status !== null && (typeof status !== "string" || !feedStatuses.has(status as FeedStatusValue))) {
    invalid("feed status is invalid");
  }
  return {
    schemaVersion: schemaVersion(object.schemaVersion),
    view: text(object.view, "view", 1, 80),
    serverTime: dateTime(object.serverTime, "serverTime"),
    sequence: finiteNumber(
      object.sequence,
      "sequence",
      0,
      Number.MAX_SAFE_INTEGER,
      true,
    ),
    items,
    sources: [],
    feedStatus: (status as FeedStatusValue | null) ?? "unavailable",
  };
}

function oneOf<T>(value: unknown, parsers: readonly ((input: unknown) => T)[]): T {
  for (const parser of parsers) {
    try {
      return parser(value);
    } catch {
      // Try the next supported wire shape.
    }
  }
  return invalid("Rate data does not match a supported contract");
}

function parseRateEvent(value: unknown): RateEvent {
  const object = record(value, "rate event");
  const version = schemaVersion(object.schemaVersion);
  void version;
  const sequence = finiteNumber(
    object.sequence,
    "sequence",
    0,
    Number.MAX_SAFE_INTEGER,
    true,
  );
  if (has(object, "item")) {
    return { sequence, items: [parseRateItem(object.item)] };
  }
  if (has(object, "items")) {
    return {
      sequence,
      items: array(object.items, "items", parseDdaJewelsRateItem),
    };
  }
  return { sequence, items: [parseRateItem(object)] };
}

function parseLegacySourceSnapshot(value: unknown): SourceEvent {
  const object = record(value, "source snapshot");
  schemaVersion(object.schemaVersion);
  return {
    sequence: finiteNumber(
      object.sequence,
      "sequence",
      0,
      Number.MAX_SAFE_INTEGER,
      true,
    ),
    sources: array(object.sources, "sources", parseSourceItem),
  };
}

function parseDdaJewelsSourceBatch(value: unknown): SourceEvent {
  const object = record(value, "DDAJewels source batch");
  schemaVersion(object.schemaVersion);
  return {
    sources: array(object.sources, "sources", parseDdaJewelsSourceItem),
  };
}

function parseSourceEvent(value: unknown): SourceEvent {
  const object = record(value, "source event");
  schemaVersion(object.schemaVersion);
  if (has(object, "source")) {
    return {
      sequence: finiteNumber(
        object.sequence,
        "sequence",
        0,
        Number.MAX_SAFE_INTEGER,
        true,
      ),
      sources: [parseSourceItem(object.source)],
    };
  }
  if (has(object, "sources")) return parseDdaJewelsSourceBatch(object);
  return {
    sequence: finiteNumber(
      object.sequence,
      "sequence",
      0,
      Number.MAX_SAFE_INTEGER,
      true,
    ),
    sources: [parseSourceItem(object)],
  };
}

function parseFeedStatusEvent(value: unknown): FeedStatusEvent {
  const object = record(value, "feed status event");
  schemaVersion(object.schemaVersion);
  if (has(object, "feedStatus")) {
    return {
      sequence: finiteNumber(
        object.sequence,
        "sequence",
        0,
        Number.MAX_SAFE_INTEGER,
        true,
      ),
      feedStatus: parseFeedStatus(object.feedStatus),
      ...(optionalDateTime(object, "serverTime")
        ? { serverTime: optionalDateTime(object, "serverTime") }
        : {}),
    };
  }
  const status = object.status;
  if (status !== null && (typeof status !== "string" || !feedStatuses.has(status as FeedStatusValue))) {
    invalid("feed status is invalid");
  }
  return { feedStatus: (status as FeedStatusValue | null) ?? "unavailable" };
}

export const rateSnapshotSchema = schema((value) =>
  oneOf(value, [parseLegacySnapshot, parseDdaJewelsSnapshot]),
);
export const rateEventSchema = schema(parseRateEvent);
export const sourceSnapshotEventSchema = schema((value) =>
  oneOf(value, [parseLegacySourceSnapshot, parseDdaJewelsSourceBatch]),
);
export const sourceEventSchema = schema(parseSourceEvent);
export const feedStatusEventSchema = schema(parseFeedStatusEvent);
