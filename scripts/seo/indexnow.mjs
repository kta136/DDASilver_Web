#!/usr/bin/env node
// Tell IndexNow search engines (Bing, Yandex, Seznam, Naver, Yep) which public
// URLs changed. URLs come from the live sitemap; the key is public by design and
// must be served at /<key>.txt (public/). Dry run unless --apply.
import path from "node:path";
import { fileURLToPath } from "node:url";

export const INDEXNOW_KEY = "cfd69a299ecfaad71402600ae4475bef";
export const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";
export const MAX_URLS_PER_REQUEST = 10_000;
const DEFAULT_SITE = "https://www.ddasilver.com";
const SCRIPT_PATH = fileURLToPath(import.meta.url);

/** `<url>` entries of a sitemap urlset, with their optional `<lastmod>`. */
export function parseSitemap(xml) {
  const entries = [];
  for (const match of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = /<loc>\s*([^<\s]+)\s*<\/loc>/.exec(match[1])?.[1];
    if (!loc) continue;
    const lastmod =
      /<lastmod>\s*([^<\s]+)\s*<\/lastmod>/.exec(match[1])?.[1] ?? null;
    entries.push({ loc: decodeXml(loc), lastmod });
  }
  return entries;
}

/** `--since` as an ISO date, or a lookback such as `36h` or `2d`. */
export function parseSince(value, now = new Date()) {
  const lookback = /^(\d+)([hd])$/.exec(value);
  if (lookback) {
    const hours = Number(lookback[1]) * (lookback[2] === "d" ? 24 : 1);
    return new Date(now.getTime() - hours * 3_600_000);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `--since must be an ISO date or a lookback such as 36h or 2d, not '${value}'.`,
    );
  }
  return date;
}

/**
 * Unique URLs on the site's host; with `since`, only entries modified at or after it.
 * @param {{ loc: string, lastmod: string | null }[]} entries
 * @param {{ host: string, since?: Date | null }} options
 */
export function selectUrls(entries, { host, since = null }) {
  const urls = new Set();
  for (const entry of entries) {
    if (new URL(entry.loc).host !== host) continue;
    if (since) {
      const modified = entry.lastmod ? new Date(entry.lastmod) : null;
      if (!modified || Number.isNaN(modified.getTime()) || modified < since) {
        continue;
      }
    }
    urls.add(entry.loc);
  }
  return [...urls];
}

export function indexNowPayloads({ host, key, urls }) {
  const payloads = [];
  for (let start = 0; start < urls.length; start += MAX_URLS_PER_REQUEST) {
    payloads.push({
      host,
      key,
      urlList: urls.slice(start, start + MAX_URLS_PER_REQUEST),
    });
  }
  return payloads;
}

export function parseArgs(argv) {
  const options = { apply: false, site: DEFAULT_SITE, since: null, urls: [] };
  for (const arg of argv) {
    if (arg === "--apply") options.apply = true;
    else if (arg.startsWith("--site=")) options.site = arg.slice("--site=".length);
    else if (arg.startsWith("--since=")) options.since = arg.slice("--since=".length);
    else if (arg.startsWith("--url=")) options.urls.push(arg.slice("--url=".length));
    else throw new Error(`Unknown argument '${arg}'.`);
  }
  options.site = options.site.replace(/\/+$/, "");
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const host = new URL(options.site).host;

  let urls;
  if (options.urls.length > 0) {
    urls = selectUrls(
      options.urls.map((loc) => ({
        loc: new URL(loc, options.site).href,
        lastmod: null,
      })),
      { host },
    );
  } else {
    const sitemapUrl = `${options.site}/sitemap.xml`;
    const entries = parseSitemap(await fetchText(sitemapUrl));
    const since = options.since ? parseSince(options.since) : null;
    urls = selectUrls(entries, { host, since });
    console.log(
      `${sitemapUrl}: ${entries.length} URLs, ${urls.length} selected` +
        (since ? ` (modified since ${since.toISOString()})` : ""),
    );
  }

  for (const url of urls.slice(0, 10)) console.log(`  ${url}`);
  if (urls.length > 10) console.log(`  … and ${urls.length - 10} more`);
  if (urls.length === 0) {
    console.log("Nothing to submit.");
    return;
  }
  if (!options.apply) {
    console.log("Dry run. Pass --apply to submit these URLs to IndexNow.");
    return;
  }

  const keyUrl = `${options.site}/${INDEXNOW_KEY}.txt`;
  const servedKey = (await fetchText(keyUrl)).trim();
  if (servedKey !== INDEXNOW_KEY) {
    throw new Error(
      `${keyUrl} does not serve the IndexNow key; deploy the key file first.`,
    );
  }

  for (const payload of indexNowPayloads({ host, key: INDEXNOW_KEY, urls })) {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    // 200 and 202 both mean accepted; 202 means the key is still being verified.
    if (response.status !== 200 && response.status !== 202) {
      throw new Error(
        `IndexNow rejected ${payload.urlList.length} URLs: HTTP ${response.status} ${await response.text()}`,
      );
    }
    console.log(
      `IndexNow accepted ${payload.urlList.length} URLs (HTTP ${response.status}).`,
    );
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { "User-Agent": "dda-indexnow/1.0" },
  });
  if (!response.ok) throw new Error(`GET ${url} failed: HTTP ${response.status}`);
  return response.text();
}

function decodeXml(value) {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

if (path.resolve(process.argv[1] ?? "") === SCRIPT_PATH) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
