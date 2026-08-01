import { describe, expect, it } from "vitest";

import {
  extractNumberLike,
  feedStatusEventSchema,
  isRateSnapshotFresh,
  rateEventSchema,
  rateSnapshotSchema,
  sourceEventSchema,
  sourceSnapshotEventSchema,
} from "@/lib/rates/contract";

const validSnapshot = {
  schemaVersion: 1,
  view: "public",
  serverTime: "2026-07-28T10:00:00Z",
  sequence: 10,
  items: [{ id: "silver-bank", value: 102000 }],
  sources: [{ id: "silver-mcx", value: 101500, high: 102200, low: 100900 }],
  feedStatus: { status: "live", updatedAt: "2026-07-28T10:00:00Z" },
};

describe("rate contract", () => {
  it("accepts the v1 snapshot and ignores additive fields", () => {
    const parsed = rateSnapshotSchema.safeParse({
      ...validSnapshot,
      futureField: "ignored",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("futureField");
    }
  });

  it("rejects unsupported schema versions", () => {
    expect(
      rateSnapshotSchema.safeParse({ ...validSnapshot, schemaVersion: 2 })
        .success,
    ).toBe(false);
  });

  it("rejects malformed sequences", () => {
    expect(
      rateSnapshotSchema.safeParse({ ...validSnapshot, sequence: -1 }).success,
    ).toBe(false);
  });

  it("rejects duplicate identifiers and invalid financial values", () => {
    expect(
      rateSnapshotSchema.safeParse({
        ...validSnapshot,
        items: [
          { id: "silver-bank", value: 10 },
          { id: "silver-bank", value: 11 },
        ],
      }).success,
    ).toBe(false);
    expect(
      rateSnapshotSchema.safeParse({
        ...validSnapshot,
        items: [{ id: "silver-bank", value: "   " }],
      }).success,
    ).toBe(false);
    expect(
      rateSnapshotSchema.safeParse({
        ...validSnapshot,
        items: [{ id: "silver-bank", value: -1 }],
      }).success,
    ).toBe(false);
    expect(extractNumberLike("   " as never)).toBeNull();
  });

  it("requires a supported schema version on incremental events", () => {
    expect(
      rateEventSchema.safeParse({
        sequence: 11,
        item: { id: "silver-bank", value: 102100 },
      }).success,
    ).toBe(false);
  });

  it("normalizes the current DDAJewels snapshot contract", () => {
    const parsed = rateSnapshotSchema.safeParse({
      schemaVersion: 1,
      view: "default",
      serverTime: "2026-07-29T13:45:39.402Z",
      sequence: 3483183,
      items: [
        {
          itemId: "gold-999-id",
          name: "Gold 999",
          unit: "PER_10_GRAM",
          finalRate: 146370,
          movementValue: 442,
          movementDirection: "DOWN",
          buyingRate: 145000,
          premiumTotal: -1200,
          premiumBreakdown: {
            unit: "PER_10_GRAM",
            l1: -1000,
            l2: -200,
            total: -1200,
          },
        },
      ],
      feedStatus: {
        status: "live",
        marketState: { label: "Live feed" },
      },
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.items[0]).toMatchObject({
        id: "gold-999-id",
        name: "Gold 999",
        value: 146370,
        change: -442,
        direction: "down",
        buyingRate: 145000,
        premiumTotal: -1200,
        premiumBreakdown: { total: -1200 },
      });
      expect(parsed.data.sources).toEqual([]);
      expect(parsed.data.feedStatus).toBe("live");
    }
  });

  it("normalizes DDAJewels rate and market SSE batches", () => {
    const rate = rateEventSchema.safeParse({
      schemaVersion: 1,
      view: "default",
      sequence: 3483193,
      items: [
        {
          itemId: "silver-bank-id",
          finalRate: 222882,
          movementValue: 618,
          movementDirection: "DOWN",
        },
      ],
    });
    const sources = sourceSnapshotEventSchema.safeParse({
      schemaVersion: 1,
      sources: [
        {
          sourceId: "silver-mcx-id",
          name: "Silver MCX",
          unit: "PER_KG",
          sortOrder: 0,
          bid: 215271,
          ask: 215385,
          high: 219000,
          low: 214783,
          sourceTimestamp: "2026-07-29T13:45:31.000Z",
          calculatedAt: "2026-07-29T13:45:44.611Z",
          sourceState: { freshness: "live", flags: [] },
        },
      ],
    });
    const sourceDelta = sourceEventSchema.safeParse({
      schemaVersion: 1,
      sources: [
        {
          sourceId: "silver-mcx-id",
          name: "Silver MCX",
          unit: "PER_KG",
          sortOrder: 0,
          bid: 215280,
          ask: 215376,
          high: 219000,
          low: 214783,
          sourceTimestamp: "2026-07-29T13:45:44.000Z",
          calculatedAt: "2026-07-29T13:45:48.501Z",
        },
      ],
    });
    const status = feedStatusEventSchema.safeParse({
      schemaVersion: 1,
      status: "live",
      marketState: { label: "Live feed" },
    });

    expect(rate.success && rate.data.items[0]).toMatchObject({
      id: "silver-bank-id",
      value: 222882,
      direction: "down",
    });
    expect(sources.success && sources.data.sources[0]).toMatchObject({
      id: "silver-mcx-id",
      bid: 215271,
      ask: 215385,
      high: 219000,
      low: 214783,
    });
    expect(sourceDelta.success && sourceDelta.data.sources[0]?.ask).toBe(
      215376,
    );
    expect(status.success && status.data.feedStatus).toBe("live");
  });

  it("validates snapshot freshness with a bounded clock skew", () => {
    const now = Date.parse("2026-07-28T10:01:00Z");
    expect(
      isRateSnapshotFresh("2026-07-28T10:00:00Z", now),
    ).toBe(true);
    expect(
      isRateSnapshotFresh("2026-07-28T09:00:00Z", now),
    ).toBe(false);
    expect(
      isRateSnapshotFresh("2026-07-28T10:02:00Z", now),
    ).toBe(false);
  });
});
