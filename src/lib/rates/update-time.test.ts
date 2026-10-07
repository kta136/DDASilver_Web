import { describe, expect, it } from "vitest";

import { getRateUpdateTime } from "@/lib/rates/update-time";

describe("visible rate update time", () => {
  it("uses the oldest displayed item's timestamp and formats it in IST", () => {
    const oldest = Date.parse("2026-10-07T07:30:00Z");
    const result = getRateUpdateTime({ silver: oldest, gold: oldest + 60_000 });
    expect(result?.dateTime).toBe("2026-10-07T07:30:00.000Z");
    expect(result?.label).toMatch(/7 Oct 2026.*01:00:00.*pm IST/i);
  });

  it("omits a timestamp when no usable rates have been received", () => {
    expect(getRateUpdateTime({})).toBeNull();
    expect(getRateUpdateTime({ invalid: Number.NaN, infinite: Infinity })).toBeNull();
    expect(getRateUpdateTime({ invalid: 9e15 })).toBeNull();
  });
});
