// @vitest-environment node
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  INDEXNOW_KEY,
  MAX_URLS_PER_REQUEST,
  indexNowPayloads,
  parseArgs,
  parseSince,
  parseSitemap,
  selectUrls,
} from "./indexnow.mjs";

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://www.ddasilver.com/</loc><lastmod>2026-10-10T13:08:43Z</lastmod></url>
<url>
<loc>https://www.ddasilver.com/products/seated-guru-nanak-silver-idol</loc>
<lastmod>2026-10-18T09:00:00Z</lastmod>
</url>
<url><loc>https://www.ddasilver.com/rates</loc><changefreq>daily</changefreq></url>
<url><loc>https://www.ddasilver.com/products?category=coins&amp;page=2</loc></url>
<url><loc>https://ddajewels.com/</loc></url>
</urlset>`;

describe("IndexNow submission", () => {
  it("serves the key from the site root", () => {
    const served = readFileSync(
      new URL(`../../public/${INDEXNOW_KEY}.txt`, import.meta.url),
      "utf8",
    );
    expect(served.trim()).toBe(INDEXNOW_KEY);
    expect(INDEXNOW_KEY).toMatch(/^[a-f0-9]{32}$/);
  });

  it("reads locations and lastmod values from a sitemap", () => {
    expect(parseSitemap(SITEMAP)).toEqual([
      { loc: "https://www.ddasilver.com/", lastmod: "2026-10-10T13:08:43Z" },
      {
        loc: "https://www.ddasilver.com/products/seated-guru-nanak-silver-idol",
        lastmod: "2026-10-18T09:00:00Z",
      },
      { loc: "https://www.ddasilver.com/rates", lastmod: null },
      {
        loc: "https://www.ddasilver.com/products?category=coins&page=2",
        lastmod: null,
      },
      { loc: "https://ddajewels.com/", lastmod: null },
    ]);
  });

  it("keeps only same-host URLs and, with a cut-off, only recently modified ones", () => {
    const entries = parseSitemap(SITEMAP);
    expect(selectUrls(entries, { host: "www.ddasilver.com" })).toHaveLength(4);
    expect(
      selectUrls(entries, {
        host: "www.ddasilver.com",
        since: parseSince("2d", new Date("2026-10-19T09:00:00Z")),
      }),
    ).toEqual([
      "https://www.ddasilver.com/products/seated-guru-nanak-silver-idol",
    ]);
  });

  it("accepts ISO dates and hour or day lookbacks, and rejects anything else", () => {
    const now = new Date("2026-10-19T12:00:00.000Z");
    expect(parseSince("36h", now).toISOString()).toBe("2026-10-18T00:00:00.000Z");
    expect(parseSince("2026-10-01", now).toISOString()).toBe(
      "2026-10-01T00:00:00.000Z",
    );
    expect(() => parseSince("yesterday", now)).toThrow(/--since/);
  });

  it("splits large submissions at the protocol limit", () => {
    const urls = Array.from(
      { length: MAX_URLS_PER_REQUEST + 1 },
      (_, index) => `https://www.ddasilver.com/${index}`,
    );
    const payloads = indexNowPayloads({
      host: "www.ddasilver.com",
      key: INDEXNOW_KEY,
      urls,
    });
    expect(payloads.map((payload) => payload.urlList.length)).toEqual([
      MAX_URLS_PER_REQUEST,
      1,
    ]);
    expect(payloads[0]).toMatchObject({
      host: "www.ddasilver.com",
      key: INDEXNOW_KEY,
    });
  });

  it("stays a dry run unless --apply is passed", () => {
    expect(parseArgs([])).toMatchObject({
      apply: false,
      site: "https://www.ddasilver.com",
    });
    expect(
      parseArgs(["--apply", "--since=2d", "--site=https://example.test/"]),
    ).toMatchObject({ apply: true, since: "2d", site: "https://example.test" });
    expect(() => parseArgs(["--force"])).toThrow(/Unknown argument/);
  });
});
