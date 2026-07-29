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
});
