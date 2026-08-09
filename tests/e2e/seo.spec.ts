import { expect, test } from "@playwright/test";

test.describe("production SEO output", () => {
  test.skip(
    process.env.NEXT_PUBLIC_SITE_ENV !== "production",
    "Production crawl output is intentionally disabled in preview mode.",
  );

  test("serves indexable product metadata, structured data, and social images", async ({
    request,
  }) => {
    const crawlerHeaders = { "User-Agent": "Googlebot" };
    const sitemapResponse = await request.get("/sitemap.xml", {
      headers: crawlerHeaders,
    });
    const sitemap = await sitemapResponse.text();
    const productPath = sitemap.match(
      /<loc>https:\/\/www\.ddasilver\.com(\/products\/[^<]+)<\/loc>/,
    )?.[1];

    expect(sitemapResponse.ok()).toBe(true);
    expect(sitemap).toContain(
      'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    );
    expect(sitemap).toContain("<image:image>");
    expect(productPath).toBeTruthy();

    const productResponse = await request.get(productPath!, {
      headers: crawlerHeaders,
    });
    const html = await productResponse.text();
    const canonical = html.match(
      /<link rel="canonical" href="([^"]+)"/,
    )?.[1];
    const socialImage = html.match(
      /<meta property="og:image" content="([^"]+)"/,
    )?.[1];
    const jsonLd = [...html.matchAll(
      /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    )].map((match) => JSON.parse(match[1]) as Record<string, unknown>);
    const productSchema = jsonLd.find(
      (entry) => entry["@type"] === "Product",
    );

    expect(productResponse.ok()).toBe(true);
    expect(html).toMatch(/<title>[^<]+ \| DDA Silver<\/title>/);
    expect(canonical).toBe(`https://www.ddasilver.com${productPath}`);
    expect(socialImage).toMatch(
      /^https:\/\/www\.ddasilver\.com\/api\/og\/product\//,
    );
    expect(productSchema).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Product",
      material: "Silver",
    });
    expect(productSchema?.additionalProperty).toBeTruthy();

    const socialImagePath = new URL(socialImage!).pathname;
    const socialImageResponse = await request.get(socialImagePath, {
      headers: crawlerHeaders,
    });

    expect(socialImageResponse.ok()).toBe(true);
    expect(socialImageResponse.headers()["content-type"]).toContain("image/png");
    expect((await socialImageResponse.body()).byteLength).toBeGreaterThan(10_000);
  });

  test("keeps crawler directives and filtered canonicals consistent", async ({
    request,
  }) => {
    const crawlerHeaders = { "User-Agent": "Googlebot" };
    const robots = await (
      await request.get("/robots.txt", { headers: crawlerHeaders })
    ).text();
    const filteredCatalog = await (
      await request.get("/products?category=coin&sort=title-asc", {
        headers: crawlerHeaders,
      })
    ).text();
    const contact = await (
      await request.get("/contact", { headers: crawlerHeaders })
    ).text();

    expect(robots).toContain("Allow: /api/og/product/");
    expect(robots).toContain("Disallow: /api/");
    expect(filteredCatalog).toContain(
      '<link rel="canonical" href="https://www.ddasilver.com/products"',
    );
    expect(contact).not.toContain("still required before launch");
  });
});
