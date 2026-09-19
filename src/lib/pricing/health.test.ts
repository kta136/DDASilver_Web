import { describe, expect, it } from "vitest";
import { automaticReferenceFreshness } from "./freshness";
import { pricingHealth } from "./health";
import type { StoreRead } from "./store";

const now = Date.parse("2026-09-12T10:00:00Z");
const asOf = new Date(now).toISOString();

describe("automatic reference freshness and monitoring", () => {
  it("warns in the last minute and expires only after the existing 390-second boundary", () => {
    expect(automaticReferenceFreshness(asOf, now + 329_999).status).toBe("fresh");
    expect(automaticReferenceFreshness(asOf, now + 330_000)).toEqual({
      status: "expiring", expiresAt: "2026-09-12T10:06:30.000Z", secondsRemaining: 60,
    });
    expect(automaticReferenceFreshness(asOf, now + 390_000).status).toBe("expiring");
    expect(automaticReferenceFreshness(asOf, now + 390_001).status).toBe("expired");
  });

  it("rejects missing, malformed and future references", () => {
    expect(automaticReferenceFreshness(undefined, now).status).toBe("unavailable");
    expect(automaticReferenceFreshness("bad", now).status).toBe("invalid");
    expect(automaticReferenceFreshness(asOf, now - 1).status).toBe("invalid");
  });

  it("distinguishes a failed refresh and backup recovery from price expiry", () => {
    const state: StoreRead = {
      recovery: "backup",
      record: {
        version: 1, generation: 1,
        reference: { snapshotAsOf: asOf, itemId: "silver", unit: "PER_KG", value: 100_000 },
        refresh: { lastAttemptAt: now, nextAttemptAt: now + 300_000, outcome: "failed" },
      },
    };
    expect(pricingHealth(state, now)).toMatchObject({
      status: "degraded", warnings: ["refresh-failed", "storage-recovery"],
      automaticOffers: { status: "fresh", secondsRemaining: 390 },
    });
    expect(pricingHealth(state, now + 390_001)).toMatchObject({
      status: "degraded", warnings: ["reference-expired", "refresh-failed", "storage-recovery"],
      automaticOffers: { status: "expired", secondsRemaining: 0 },
    });
    expect(pricingHealth({ record: null, recovery: "missing" }, now)).toMatchObject({
      status: "unavailable", warnings: ["reference-unavailable"],
    });
  });

  it("keeps a failed refresh healthy while an authoritative market closure is valid", () => {
    const validUntil = new Date(now + 2 * 86_400_000).toISOString();
    const state: StoreRead = {
      recovery: "primary",
      record: {
        version: 1,
        generation: 1,
        reference: {
          snapshotAsOf: new Date(now - 86_400_000).toISOString(),
          itemId: "silver",
          unit: "PER_KG",
          value: 100_000,
          marketStatus: "closed",
          validUntil,
        },
        refresh: {
          lastAttemptAt: now,
          nextAttemptAt: now + 300_000,
          outcome: "failed",
        },
      },
    };
    expect(pricingHealth(state, now)).toMatchObject({
      status: "ok",
      marketStatus: "closed",
      priceValidUntil: validUntil,
      warnings: [],
      automaticOffers: {
        status: "market-closed",
        expiresAt: validUntil,
      },
    });
    expect(pricingHealth(state, Date.parse(validUntil) + 1)).toMatchObject({
      status: "degraded",
      warnings: ["reference-expired", "refresh-failed"],
    });
  });
});
