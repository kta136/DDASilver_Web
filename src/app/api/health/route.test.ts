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

  it("reports a draining container as unhealthy without changing the response shape", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "dda-production");
    vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
    vi.stubEnv("DDA_CONTAINER_DRAINING", "1");

    const response = await GET(healthRequest("198.51.100.14"));
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload).toMatchObject({
      status: "degraded",
      checks: {
        application: "draining",
        sanity: "ok",
      },
    });
  });

  it("prefers the Coolify application version and shortens commit hashes", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "dda-production");
    vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
    vi.stubEnv("APP_VERSION", "0123456789abcdef0123456789abcdef01234567");
    vi.stubEnv("SOURCE_COMMIT", "fedcba9876543210");

    const response = await GET(healthRequest("198.51.100.12"));
    const payload = await response.json();

    expect(payload.version).toBe("0123456789ab");
  });

  it("uses the source commit when the application version is unavailable", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "dda-production");
    vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
    vi.stubEnv("APP_VERSION", "");
    vi.stubEnv("SOURCE_COMMIT", "abcdef0123456789abcdef");

    const response = await GET(healthRequest("198.51.100.13"));
    const payload = await response.json();

    expect(payload.version).toBe("abcdef012345");
  });
});

function healthRequest(address: string) {
  return new Request("https://preview.example/api/health", {
    headers: { "x-forwarded-for": address },
  });
}
