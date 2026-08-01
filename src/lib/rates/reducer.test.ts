import { describe, expect, it } from "vitest";

import {
  initialRateState,
  rateReducer,
} from "@/lib/rates/reducer";

const snapshot = {
  schemaVersion: 1 as const,
  view: "public",
  serverTime: "2026-07-28T10:00:00Z",
  sequence: 10,
  items: [{ id: "silver-bank", value: 102000 }],
  sources: [{ id: "silver-mcx", value: 101500 }],
  feedStatus: "live" as const,
};

describe("rate reducer", () => {
  it("hydrates from a valid snapshot", () => {
    const state = rateReducer(initialRateState, {
      type: "snapshot",
      snapshot,
      receivedAt: 1_000,
    });

    expect(state.connection).toBe("live");
    expect(state.sequence).toBe(10);
    expect(state.items["silver-bank"]?.value).toBe(102000);
  });

  it("ignores duplicate and out-of-order events", () => {
    const hydrated = rateReducer(initialRateState, {
      type: "snapshot",
      snapshot,
      receivedAt: 1_000,
    });
    const ignored = rateReducer(hydrated, {
      type: "rate",
      item: { id: "silver-bank", value: 1 },
      sequence: 9,
      receivedAt: 2_000,
    });

    expect(ignored).toBe(hydrated);
  });

  it("marks the feed stale after the configured threshold", () => {
    const hydrated = rateReducer(initialRateState, {
      type: "snapshot",
      snapshot,
      receivedAt: 1_000,
    });
    const stale = rateReducer(hydrated, {
      type: "stale",
      now: 92_000,
      thresholdMs: 90_000,
    });

    expect(stale.isStale).toBe(true);
  });

  it("does not refresh every rate when one item or feed status changes", () => {
    const hydrated = rateReducer(initialRateState, {
      type: "snapshot",
      snapshot,
      receivedAt: 1_000,
    });
    const oneRateUpdated = rateReducer(hydrated, {
      type: "rate",
      item: { id: "silver-bank", value: 102500 },
      sequence: 11,
      receivedAt: 80_000,
    });
    const statusUpdated = rateReducer(oneRateUpdated, {
      type: "feed-status",
      feedStatus: "live",
      sequence: 12,
      receivedAt: 85_000,
    });
    const stale = rateReducer(statusUpdated, {
      type: "stale",
      now: 92_000,
      thresholdMs: 90_000,
    });

    expect(statusUpdated.lastValidEventAt).toBe(1_000);
    expect(stale.isStale).toBe(true);
  });

  it("merges DDAJewels rate and source batches without losing row labels", () => {
    const hydrated = rateReducer(initialRateState, {
      type: "snapshot",
      snapshot,
      receivedAt: 1_000,
    });
    const ratesUpdated = rateReducer(hydrated, {
      type: "rate-batch",
      items: [{ id: "silver-bank", value: 102700, change: 250 }],
      sequence: 11,
      receivedAt: 2_000,
    });
    const sourcesUpdated = rateReducer(ratesUpdated, {
      type: "source-batch",
      sources: [
        {
          id: "silver-mcx",
          name: "Silver MCX",
          bid: 101600,
          ask: 101700,
          high: 102200,
          low: 100900,
        },
      ],
      receivedAt: 2_100,
    });

    expect(ratesUpdated.items["silver-bank"]).toMatchObject({
      id: "silver-bank",
      value: 102700,
      change: 250,
    });
    expect(sourcesUpdated.sources["silver-mcx"]).toMatchObject({
      name: "Silver MCX",
      bid: 101600,
      ask: 101700,
    });
    expect(sourcesUpdated.sequence).toBe(11);
  });

  it("replaces no-longer-authorized rows on a stream snapshot", () => {
    const approved = rateReducer(initialRateState, {
      type: "snapshot",
      snapshot: {
        ...snapshot,
        items: [
          { id: "silver-bank", value: 102000 },
          { id: "approved-only", value: 110000 },
        ],
      },
      receivedAt: 1_000,
    });
    const publicOnly = rateReducer(approved, {
      type: "rate-snapshot",
      items: [{ id: "silver-bank", value: 102100 }],
      sequence: 10,
      receivedAt: 2_000,
    });

    expect(publicOnly.items).toEqual({
      "silver-bank": { id: "silver-bank", value: 102100 },
    });
  });

  it("clears a stale premium breakdown when a rate only updates its total", () => {
    const hydrated = rateReducer(initialRateState, {
      type: "snapshot",
      snapshot: {
        ...snapshot,
        items: [
          {
            id: "silver-bank",
            value: 102000,
            premiumTotal: 500,
            premiumBreakdown: {
              unit: "PER_KG" as const,
              l1: 300,
              l2: 200,
              total: 500,
            },
          },
        ],
      },
      receivedAt: 1_000,
    });
    const updated = rateReducer(hydrated, {
      type: "rate-batch",
      items: [{ id: "silver-bank", value: 102100, premiumTotal: -250 }],
      sequence: 11,
      receivedAt: 2_000,
    });

    expect(updated.items["silver-bank"]?.premiumTotal).toBe(-250);
    expect(updated.items["silver-bank"]).not.toHaveProperty("premiumBreakdown");
  });
});
