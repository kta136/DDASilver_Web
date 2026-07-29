import { describe, expect, it } from "vitest";

import { rateSnapshotSchema } from "@/lib/rates/contract";

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
});
