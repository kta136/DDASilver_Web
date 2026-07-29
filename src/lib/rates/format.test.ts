import { describe, expect, it } from "vitest";

import { formatIndianNumber, formatRateTime } from "@/lib/rates/format";

describe("rate formatting", () => {
  it("uses Indian digit grouping", () => {
    expect(formatIndianNumber(1234567.5)).toBe("12,34,567.50");
  });

  it("shows an em dash for unavailable values", () => {
    expect(formatIndianNumber(null)).toBe("—");
  });

  it("rejects invalid timestamps", () => {
    expect(formatRateTime("not-a-date")).toBe("Not updated");
  });
});
