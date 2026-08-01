import { cookies } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { proxyDdaJewelsRates } from "@/lib/rates/proxy";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();

describe("DDA Jewels rate proxy", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
    process.env.DDAJEWELS_RATES_SNAPSHOT_URL =
      "https://rates.ddajewels.com/api/v1/rates/current";
    process.env.DDAJEWELS_RATES_STREAM_URL =
      "https://rates.ddajewels.com/sse/rates";
    process.env.DDAJEWELS_AUTH_COOKIE_NAME = "dda_web_staging_session";
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => ({ value: "satellite-session" })),
    } as never);
    fetchMock.mockResolvedValue(
      Response.json({ schemaVersion: 1, items: [] }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    delete process.env.DDAJEWELS_RATES_SNAPSHOT_URL;
    delete process.env.DDAJEWELS_RATES_STREAM_URL;
    delete process.env.DDAJEWELS_AUTH_COOKIE_NAME;
  });

  it("translates the Silver session into the DDA Jewels rates cookie", async () => {
    const response = await proxyDdaJewelsRates(
      new Request("https://silver.example/api/rates/snapshot"),
      "snapshot",
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("https://rates.ddajewels.com/api/v1/rates/current"),
      expect.objectContaining({
        headers: expect.objectContaining({}),
      }),
    );
    const requestHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(requestHeaders.get("cookie")).toBe(
      "dda_web_staging_session=satellite-session; dda_session=satellite-session; __Host-dda_session=satellite-session",
    );
  });

  it("derives and allowlists an authenticated history request", async () => {
    await proxyDdaJewelsRates(
      new Request(
        "https://silver.example/api/rates/history?itemId=silver%20bank&range=7D&ignored=value",
      ),
      "history",
    );

    const upstream = fetchMock.mock.calls[0]?.[0] as URL;
    expect(upstream.toString()).toBe(
      "https://rates.ddajewels.com/api/v1/rates/history?itemId=silver+bank&range=7D",
    );
  });

  it("fails closed when the configured service is outside DDA Jewels", async () => {
    process.env.DDAJEWELS_RATES_SNAPSHOT_URL =
      "https://attacker.example/api/v1/rates/current";

    const response = await proxyDdaJewelsRates(
      new Request("https://silver.example/api/rates/snapshot"),
      "snapshot",
    );

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
