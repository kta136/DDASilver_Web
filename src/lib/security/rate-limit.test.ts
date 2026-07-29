import { beforeEach, describe, expect, it, vi } from "vitest";

describe("rate limiter", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useRealTimers();
  });

  it("removes expired buckets before applying a new request", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const { checkRateLimit } = await import("@/lib/security/rate-limit");
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.1" },
    });

    expect(checkRateLimit(request, "test", 1, 1_000).allowed).toBe(true);
    expect(checkRateLimit(request, "test", 1, 1_000).allowed).toBe(false);

    vi.setSystemTime(1_001);
    expect(checkRateLimit(request, "test", 1, 1_000).allowed).toBe(true);
  });

  it("bounds retained address buckets", async () => {
    const { checkRateLimit } = await import("@/lib/security/rate-limit");
    const makeRequest = (address: string) =>
      new Request("https://example.com", {
        headers: { "x-forwarded-for": address },
      });

    const first = makeRequest("2001:db8::0");
    expect(checkRateLimit(first, "test", 1, 60_000).allowed).toBe(true);
    for (let index = 1; index <= 2_048; index += 1) {
      checkRateLimit(
        makeRequest(`2001:db8::${index.toString(16)}`),
        "test",
        1,
        60_000,
      );
    }

    expect(checkRateLimit(first, "test", 1, 60_000).allowed).toBe(true);
  });
});
