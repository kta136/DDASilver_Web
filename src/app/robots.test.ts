import { describe, expect, it } from "vitest";

import { createRobots } from "@/app/robots";

describe("robots metadata route", () => {
  it("blocks all crawling outside production", () => {
    expect(createRobots(false)).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });

  it("keeps product social images crawlable in production", () => {
    expect(createRobots(true)).toMatchObject({
      rules: [
        {
          userAgent: "*",
          allow: ["/", "/api/og/product/"],
          disallow: ["/studio", "/studio/", "/api/", "/auth/"],
        },
      ],
      sitemap: "http://localhost:3000/sitemap.xml",
      host: "http://localhost:3000",
    });
  });
});
