import { describe, expect, it } from "vitest";

import {
  extractNumberLike,
  isRateSnapshotFresh,
  rateEventSchema,
  rateSnapshotSchema,
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
