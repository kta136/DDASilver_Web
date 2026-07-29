import { describe, expect, it } from "vitest";

import {
  normalizeGoogleAnalyticsId,
  sanitizeAnalyticsParameters,
} from "@/lib/analytics";

describe("analytics configuration", () => {
  it("accepts GA4 measurement IDs and rejects executable input", () => {
    expect(normalizeGoogleAnalyticsId("g-abcd1234")).toBe("G-ABCD1234");
    expect(normalizeGoogleAnalyticsId("G-X');alert(1)//")).toBeNull();
    expect(normalizeGoogleAnalyticsId("UA-123")).toBeNull();
  });

  it("keeps only the approved parameters for an event", () => {
    expect(
      sanitizeAnalyticsParameters("catalog_search", {
        query_length: 12,
        result_count: 3,
        query: "private free-form text",
      }),
    ).toEqual({ query_length: 12, result_count: 3 });
  });
});
