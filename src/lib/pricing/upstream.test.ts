// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchGalleryReference } from "./upstream";
import { SILVER_BANK_ID } from "./store";
const payload = () => ({
  schemaVersion: 1,
  view: "default",
  serverTime: new Date().toISOString(),
  sequence: 1,
  feedStatus: { status: "live" },
  items: [
    {
      itemId: SILVER_BANK_ID,
      name: "Silver",
      unit: "PER_KG",
      finalRate: 100_000,
      movementValue: 0,
      movementDirection: "FLAT",
    },
  ],
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("gallery upstream acceptance", () => {
  it("fetches the anonymous endpoint without a second cache", async () => {
    vi.stubEnv(
      "DDAJEWELS_RATES_SNAPSHOT_URL",
      "https://rates.ddajewels.com/other?view=admin#secret",
    );
    const fetcher = vi.fn().mockResolvedValue(Response.json(payload()));
    vi.stubGlobal("fetch", fetcher);
    expect(await fetchGalleryReference()).toMatchObject({
      value: 100_000,
      unit: "PER_KG",
      itemId: SILVER_BANK_ID,
    });
    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toBe(
      "https://rates.ddajewels.com/api/v1/rates/current",
    );
    expect(options).toMatchObject({
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      headers: { Accept: "application/json" },
    });
    expect(options).not.toHaveProperty("next");
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });
  it("rejects stale, private, zero, non-live and malformed responses", async () => {
    vi.stubEnv("DDAJEWELS_RATES_SNAPSHOT_URL", "https://rates.ddajewels.com/");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    for (const value of [
      { ...payload(), serverTime: new Date(Date.now() - 91_000).toISOString() },
      { ...payload(), view: "admin" },
      { ...payload(), feedStatus: { status: "closed" } },
      { ...payload(), items: [{ ...payload().items[0], finalRate: 0 }] },
      {},
    ]) {
      fetcher.mockResolvedValueOnce(Response.json(value));
      expect(await fetchGalleryReference()).toBeNull();
    }
    fetcher.mockRejectedValueOnce(
      new DOMException("Timed out", "TimeoutError"),
    );
    expect(await fetchGalleryReference()).toBeNull();
  });
});
