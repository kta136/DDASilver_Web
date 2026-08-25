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

  it("accepts the configured public origin behind a trusted reverse proxy", () => {
    const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://www.ddasilver.com";
    try {
      expect(
        isSameOriginRequest(
          new Request("http://0.0.0.0:3000/api/auth/logout", {
            headers: { origin: "https://www.ddasilver.com" },
          }),
        ),
      ).toBe(true);
      expect(
        isSameOriginRequest(
          new Request("http://0.0.0.0:3000/api/auth/logout", {
            headers: { origin: "https://attacker.example" },
          }),
        ),
      ).toBe(false);
    } finally {
      if (previousSiteUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
      }
    }
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
