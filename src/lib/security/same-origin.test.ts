import { describe, expect, it } from "vitest";

import { isSameOriginRequest } from "@/lib/security/same-origin";

describe("same-origin request validation", () => {
  it("accepts matching origins and same-origin fetch metadata", () => {
    expect(
      isSameOriginRequest(
        new Request("https://ddasilver.example/api", {
          headers: { origin: "https://ddasilver.example" },
        }),
      ),
    ).toBe(true);
    expect(
      isSameOriginRequest(
        new Request("https://ddasilver.example/api", {
          headers: { "sec-fetch-site": "same-origin" },
        }),
      ),
    ).toBe(true);
  });

  it("rejects cross-site or provenance-free mutations", () => {
    expect(
      isSameOriginRequest(
        new Request("https://ddasilver.example/api", {
          headers: { origin: "https://attacker.example" },
        }),
      ),
    ).toBe(false);
    expect(
      isSameOriginRequest(
        new Request("https://ddasilver.example/api"),
      ),
    ).toBe(false);
  });
});
