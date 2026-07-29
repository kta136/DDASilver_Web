import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("GET /api/health", () => {
  it("keeps application and Sanity as the only critical checks", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "dda-preview");
    vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(healthRequest("198.51.100.10"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toMatchObject({
      status: "ok",
      checks: {
        application: "ok",
        sanity: "ok",
      },
    });
    expect(payload.checks).not.toHaveProperty("rates");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("still degrades when Sanity is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "");
    vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "");

    const response = await GET(healthRequest("198.51.100.11"));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.checks).toEqual({
      application: "ok",
      sanity: "not_configured",
    });
  });
});

function healthRequest(address: string) {
  return new Request("https://preview.example/api/health", {
    headers: { "x-forwarded-for": address },
  });
}
