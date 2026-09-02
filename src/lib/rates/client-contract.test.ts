import { describe, expect, it } from "vitest";

import {
  feedStatusEventSchema,
  rateEventSchema,
  rateSnapshotSchema,
  sourceEventSchema,
  sourceSnapshotEventSchema,
} from "@/lib/rates/client-contract";

describe("client rate contract", () => {
  it("parses and sanitizes the legacy snapshot without Zod", () => {
    const parsed = rateSnapshotSchema.safeParse({
      schemaVersion: 1,
      view: "public",
      serverTime: "2026-07-28T10:00:00Z",
      sequence: 10,
      items: [{ id: "silver-bank", value: 102000 }],
      sources: [{ id: "silver-mcx", ask: 101500 }],
      feedStatus: { status: "live" },
      futureField: "ignored",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("futureField");
      expect(parsed.data.items[0]).toEqual({
        id: "silver-bank",
        value: 102000,
      });
    }
  });

  it("normalizes the current DDAJewels snapshot and event shapes", () => {
    const snapshot = rateSnapshotSchema.safeParse({
      schemaVersion: "v1",
      view: "default",
      serverTime: "2026-07-29T13:45:39.402Z",
      sequence: 3483183,
      items: [
        {
          itemId: "gold-999-id",
          finalRate: 146370,
          movementValue: 442,
          movementDirection: "DOWN",
        },
      ],
      feedStatus: { status: "live" },
    });
    const rates = rateEventSchema.safeParse({
      schemaVersion: 1,
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
          sourceTimestamp: null,
          calculatedAt: null,
        },
      ],
    });
    const status = feedStatusEventSchema.safeParse({
      schemaVersion: 1,
      status: "live",
    });

    expect(snapshot.success && snapshot.data.items[0]).toMatchObject({
      id: "gold-999-id",
      value: 146370,
      change: -442,
      direction: "down",
    });
    expect(rates.success && rates.data.items[0]?.value).toBe(222882);
    expect(sources.success && sources.data.sources[0]?.ask).toBe(215385);
    expect(sourceDelta.success && sourceDelta.data.sources[0]?.ask).toBe(215376);
    expect(status.success && status.data.feedStatus).toBe("live");
  });

  it("rejects malformed, duplicated, oversized, and unsupported payloads", () => {
    const base = {
      schemaVersion: 1,
      view: "public",
      serverTime: "2026-07-28T10:00:00Z",
      sequence: 10,
      sources: [],
      feedStatus: "live",
    };

    expect(
      rateSnapshotSchema.safeParse({
        ...base,
        items: [
          { id: "silver", value: 10 },
          { id: "silver", value: 11 },
        ],
      }).success,
    ).toBe(false);
    expect(
      rateSnapshotSchema.safeParse({
        ...base,
        schemaVersion: 2,
        items: [],
      }).success,
    ).toBe(false);
    expect(
      rateEventSchema.safeParse({
        schemaVersion: 1,
        sequence: -1,
        item: { id: "silver", value: 10 },
      }).success,
    ).toBe(false);
    expect(
      rateEventSchema.safeParse({
        schemaVersion: 1,
        sequence: 1,
        item: { id: "silver", value: "   " },
      }).success,
    ).toBe(false);
  });
});
