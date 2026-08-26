import { afterEach, describe, expect, it, vi } from "vitest";
import {
  decodePublicRateSnapshot,
  getPublicRateSnapshot,
} from "./public-snapshot";

function payload() {
  return {
    schemaVersion: 1,
    view: "default",
    serverTime: new Date().toISOString(),
    sequence: 1,
    feedStatus: { status: "live" },
    items: [
      {
        itemId: "cmomrj7er000004l5137q5fx4",
        name: "Silver",
        unit: "PER_KG",
        finalRate: 123456,
        movementValue: 0,
        movementDirection: "FLAT",
        buyingRate: 100000,
        premiumTotal: 250,
      },
    ],
  };
}
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
describe("public HTML rate snapshot boundary", () => {
  it("publishes only allowlisted public fields and known units", () => {
    expect(decodePublicRateSnapshot(payload())?.items).toEqual([
      {
        id: "cmomrj7er000004l5137q5fx4",
        name: "Silver Bank",
        unit: "PER_KG",
        value: 123456,
      },
    ]);
    const wrongUnit = payload();
    wrongUnit.items[0].unit = "PER_GRAM";
    expect(decodePublicRateSnapshot(wrongUnit)).toBeNull();
    const privateItem = payload();
    privateItem.items[0].itemId = "CustomerRate";
    expect(decodePublicRateSnapshot(privateItem)).toBeNull();
  });
  it("rejects privileged views, old or future timestamps, and closed feeds", () => {
    expect(
      decodePublicRateSnapshot({ ...payload(), view: "admin" }),
    ).toBeNull();
    expect(
      decodePublicRateSnapshot({
        ...payload(),
        serverTime: new Date(Date.now() - 91_000).toISOString(),
      }),
    ).toBeNull();
    expect(
      decodePublicRateSnapshot({
        ...payload(),
        serverTime: new Date(Date.now() + 31_000).toISOString(),
      }),
    ).toBeNull();
    expect(
      decodePublicRateSnapshot({
        ...payload(),
        feedStatus: { status: "closed" },
      }),
    ).toBeNull();
    expect(decodePublicRateSnapshot({})).toBeNull();
  });
  it("uses an anonymous fixed endpoint without inherited view or session headers", async () => {
    vi.stubEnv(
      "DDAJEWELS_RATES_SNAPSHOT_URL",
      "https://rates.ddajewels.com/other?view=admin#secret",
    );
    const fetchMock = vi.fn().mockResolvedValue(Response.json(payload()));
    vi.stubGlobal("fetch", fetchMock);
    expect(await getPublicRateSnapshot()).not.toBeNull();
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.toString()).toBe(
      "https://rates.ddajewels.com/api/v1/rates/current",
    );
    expect(options.headers).toEqual({ Accept: "application/json" });
    expect(options.credentials).toBe("omit");
    expect(options.redirect).toBe("error");
  });
  it("fails closed for untrusted hosts, credentials, errors and malformed upstream data", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    for (const url of [
      "https://ddajewels.com.evil.example/",
      "https://user:pass@rates.ddajewels.com/",
    ]) {
      vi.stubEnv("DDAJEWELS_RATES_SNAPSHOT_URL", url);
      expect(await getPublicRateSnapshot()).toBeNull();
    }
    expect(fetchMock).not.toHaveBeenCalled();
    vi.stubEnv("DDAJEWELS_RATES_SNAPSHOT_URL", "https://rates.ddajewels.com/");
    fetchMock.mockRejectedValueOnce(new Error("timeout"));
    expect(await getPublicRateSnapshot()).toBeNull();
    fetchMock.mockResolvedValueOnce(Response.json({}, { status: 503 }));
    expect(await getPublicRateSnapshot()).toBeNull();
    fetchMock.mockResolvedValueOnce(new Response("invalid"));
    expect(await getPublicRateSnapshot()).toBeNull();
  });
});
