// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startGalleryPricingWorker } from "./background";
import type { SilverReference } from "./model";
import { REFRESH_INTERVAL_MS, SILVER_BANK_ID, type StoreRead } from "./store";

const now = Date.parse("2026-09-12T10:00:00Z");
let stop: (() => void) | undefined;

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(now);
});
afterEach(() => {
  stop?.();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function fixture() {
  const state: StoreRead = {
    recovery: "primary",
    record: {
      version: 1,
      generation: 1,
      reference: {
        itemId: SILVER_BANK_ID, unit: "PER_KG", value: 100_000,
        snapshotAsOf: new Date(now - 60_000).toISOString(),
        marketStatus: "live",
        validUntil: new Date(now + 86_400_000).toISOString(),
      },
      refresh: { lastAttemptAt: now - REFRESH_INTERVAL_MS, nextAttemptAt: now, outcome: "accepted" },
    },
  };
  const fetchReference = vi.fn<() => Promise<SilverReference | null>>().mockResolvedValue(null);
  const store = {
    read: vi.fn(async () => state),
    refresh: vi.fn(async (fetcher: () => Promise<SilverReference | null>) => {
      const record = state.record!;
      record.refresh = { lastAttemptAt: Date.now(), nextAttemptAt: Date.now() + REFRESH_INTERVAL_MS, outcome: "pending" };
      const candidate = await fetcher();
      if (candidate) record.reference = candidate;
      record.refresh.outcome = candidate ? "accepted" : "failed";
      return record.refresh.outcome;
    }),
  };
  const report = vi.fn();
  const settings = vi.fn(async () => ({ enabled: true }));
  const isDraining = vi.fn(() => false);
  return { state, store, fetchReference, report, settings, isDraining };
}

describe("background pricing maintenance", () => {
  it("refreshes without page visits, retries at the durable deadline, warns before expiry and reports recovery", async () => {
    const f = fixture();
    f.fetchReference.mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockImplementation(async () => ({
      ...f.state.record!.reference!, snapshotAsOf: new Date(Date.now()).toISOString(), value: 110_000,
    }));
    stop = startGalleryPricingWorker(f);
    expect(f.store.read).not.toHaveBeenCalled(); // Startup is non-blocking.
    await vi.advanceTimersByTimeAsync(0);
    expect(f.fetchReference).toHaveBeenCalledTimes(1);
    expect(f.report).toHaveBeenLastCalledWith("pricing-warning", expect.objectContaining({ warnings: ["refresh-failed"] }));

    await vi.advanceTimersByTimeAsync(270_000);
    expect(f.fetchReference).toHaveBeenCalledTimes(1);
    expect(f.report).toHaveBeenLastCalledWith("pricing-warning", expect.objectContaining({
      warnings: ["reference-expiring", "refresh-failed"],
      automaticOffers: expect.objectContaining({ status: "expiring", secondsRemaining: 60 }),
    }));
    await vi.advanceTimersByTimeAsync(29_999);
    expect(f.fetchReference).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(f.fetchReference).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(45_000);
    expect(f.report).toHaveBeenLastCalledWith("pricing-warning", expect.objectContaining({
      warnings: ["reference-expired", "refresh-failed"],
    }));
    expect(f.report).toHaveBeenCalledTimes(3); // No repeated warning every poll.

    await vi.advanceTimersByTimeAsync(255_000);
    expect(f.fetchReference).toHaveBeenCalledTimes(3);
    expect(f.report).toHaveBeenLastCalledWith("pricing-recovered", expect.objectContaining({ status: "ok", warnings: [] }));
    expect(f.state.record!.reference!.value).toBe(110_000);
  });

  it("honours a saved attempt gate after startup and does not poll Sanity on every check", async () => {
    const f = fixture();
    f.state.record!.refresh.nextAttemptAt = now + 123_456;
    stop = startGalleryPricingWorker(f);
    await vi.advanceTimersByTimeAsync(123_455);
    expect(f.store.refresh).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(f.store.refresh).toHaveBeenCalledOnce();
    expect(f.settings).toHaveBeenCalledOnce();
  });

  it("does not fetch or alert while pricing is disabled and detects later activation", async () => {
    const f = fixture();
    f.settings.mockResolvedValueOnce({ enabled: false });
    stop = startGalleryPricingWorker(f);
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS - 1);
    expect(f.store.read).not.toHaveBeenCalled();
    expect(f.report).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(f.fetchReference).toHaveBeenCalledOnce();
  });

  it("keeps checking after a storage exception without overlapping slow checks", async () => {
    const f = fixture();
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    f.store.read.mockRejectedValueOnce(new Error("storage offline"));
    let finishRead!: (state: StoreRead) => void;
    f.store.read.mockImplementationOnce(() => new Promise((resolve) => { finishRead = resolve; }));
    stop = startGalleryPricingWorker(f);
    await vi.advanceTimersByTimeAsync(0);
    expect(warning).toHaveBeenCalledOnce();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(f.store.read).toHaveBeenCalledTimes(2);
    expect(f.store.refresh).not.toHaveBeenCalled();
    finishRead(f.state);
    await vi.advanceTimersByTimeAsync(0);
    expect(f.fetchReference).toHaveBeenCalledOnce();
  });

  it("stops scheduling on drain and on explicit shutdown", async () => {
    const f = fixture();
    f.state.record!.refresh.nextAttemptAt = now + REFRESH_INTERVAL_MS;
    stop = startGalleryPricingWorker(f);
    await vi.advanceTimersByTimeAsync(0);
    f.isDraining.mockReturnValue(true);
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
    expect(f.store.read).toHaveBeenCalledOnce();
    expect(f.fetchReference).not.toHaveBeenCalled();
    stop();

    f.isDraining.mockReturnValue(false);
    stop = startGalleryPricingWorker(f);
    stop();
    await vi.advanceTimersByTimeAsync(REFRESH_INTERVAL_MS);
    expect(f.store.read).toHaveBeenCalledOnce();
  });
});
