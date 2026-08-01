import { afterEach, describe, expect, it, vi } from "vitest";

import { isAllowedDdaJewelsUrl } from "@/lib/security/external-service";

afterEach(() => vi.unstubAllEnvs());

describe("DDA Jewels external service allowlist", () => {
  it("accepts only HTTPS DDA Jewels hosts outside development", () => {
    expect(
      isAllowedDdaJewelsUrl(
        "https://rates.ddajewels.com/api/v1/rates/current",
      ),
    ).toBe(true);
    expect(
      isAllowedDdaJewelsUrl("http://localhost:4020/api/v1/rates/current"),
    ).toBe(false);
  });

  it("allows HTTP loopback only for local development fixtures", () => {
    vi.stubEnv("NODE_ENV", "development");
    expect(
      isAllowedDdaJewelsUrl("http://localhost:4020/api/v1/rates/current"),
    ).toBe(true);
    expect(
      isAllowedDdaJewelsUrl("http://192.168.1.2:4020/api/v1/rates/current"),
    ).toBe(false);
  });
});
