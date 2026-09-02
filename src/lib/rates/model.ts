export type RateDirection = "up" | "down" | "flat";
export type RateUnit = "PER_GRAM" | "PER_10_GRAM" | "PER_KG";
export type NumberLike = number | string | null;

export type PremiumBreakdown = {
  unit: RateUnit;
  l1: number;
  l2: number;
  total: number;
};

export type RateItem = {
  id: string;
  name?: string;
  label?: string;
  value?: NumberLike;
  rate?: NumberLike;
  displayValue?: NumberLike;
  change?: number;
  direction?: RateDirection;
  buyingRate?: NumberLike;
  premiumTotal?: number | null;
  premiumBreakdown?: PremiumBreakdown | null;
  unit?: string;
};

export type SourceItem = RateItem & {
  bid?: NumberLike;
  ask?: NumberLike;
  high?: NumberLike;
  low?: NumberLike;
  open?: NumberLike;
  previousClose?: NumberLike;
  sortOrder?: number;
};

export type FeedStatusValue = "live" | "stale" | "closed" | "unavailable";
export type FeedStatus =
  | FeedStatusValue
  | {
      status: FeedStatusValue;
      message?: string;
      updatedAt?: string;
    };

export type RateSnapshot = {
  schemaVersion: 1 | "1" | "v1";
  view: string;
  serverTime: string;
  sequence: number;
  items: RateItem[];
  sources: SourceItem[];
  feedStatus: FeedStatus;
};

export function normalizeFeedStatus(status: FeedStatus) {
  return typeof status === "string" ? status : status.status;
}

export function extractRateValue(item?: RateItem) {
  if (!item) {
    return null;
  }

  return extractNumberLike(item.displayValue ?? item.value ?? item.rate);
}

export function extractNumberLike(value: NumberLike | undefined) {
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
