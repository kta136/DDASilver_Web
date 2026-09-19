import { expect, test } from "@playwright/test";

test.describe("production SEO output", () => {
  test.skip(
    process.env.NEXT_PUBLIC_SITE_ENV !== "production",
    "Production crawl output is intentionally disabled in preview mode.",
  );

  test("makes silver payal brands discoverable without inventing product offers", async ({
    request,
  }) => {
    const response = await request.get("/silver-payal-brands", {
      headers: { "User-Agent": "Googlebot" },
    });
    const html = await response.text();
    const pageUrl = "https://www.ddasilver.com/silver-payal-brands";
    expect(response.status()).toBe(200);
    expect(response.headers()["x-robots-tag"] ?? "").not.toContain("noindex");
    expect(html).toContain("Silver Payal &amp; Anklet Brands | DDA Silver");
    expect(html).toContain(`<link rel="canonical" href="${pageUrl}"`);
    expect(html).toContain('<meta name="robots" content="index, follow"');
    expect(html).toContain("silver anklets");

    const schemas = [...html.matchAll(
      /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    )].map((match) => JSON.parse(match[1]) as Record<string, unknown>);
    const collection = schemas.find((schema) => schema["@type"] === "CollectionPage");
    expect(collection).toMatchObject({
      url: pageUrl,
      publisher: { "@id": "https://www.ddasilver.com/#business" },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 5,
        itemListElement: ["Anand", "MD", "AGB", "DDA", "AKS"].map((brand, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `${brand} silver payal`,
          url: `${pageUrl}#${brand.toLowerCase()}`,
        })),
      },
    });
    expect(schemas.some((schema) => schema["@type"] === "BreadcrumbList")).toBe(true);
    expect(JSON.stringify(schemas)).not.toMatch(/"(?:offers|aggregateRating|review)":/);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain(`<loc>${pageUrl}</loc>`);
    const home = await (await request.get("/")).text();
    expect(home).toContain('href="/silver-payal-brands"');
    expect(home).toContain("Explore silver payal brands");
  });

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
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const socialImage = html.match(
      /<meta property="og:image" content="([^"]+)"/,
    )?.[1];
    const jsonLd = [
      ...html.matchAll(
        /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].map((match) => JSON.parse(match[1]) as Record<string, unknown>);
    const productSchema = jsonLd.find((entry) =>
      entry["@type"] === "WebPage" || entry["@type"] === "Product",
    );

    expect(productResponse.ok()).toBe(true);
    expect(html).toMatch(/<title>[^<]+ \| DDA Silver<\/title>/);
    expect(canonical).toBe(`https://www.ddasilver.com${productPath}`);
    expect(socialImage).toMatch(
      /^https:\/\/www\.ddasilver\.com\/api\/og\/product\//,
    );
    expect(productSchema).toMatchObject({
      "@context": "https://schema.org",
      url: `https://www.ddasilver.com${productPath}`,
    });
    const visiblePrice = html.includes("data-product-price");
    expect(productSchema?.["@type"] === "Product").toBe(visiblePrice);
    if (productSchema?.["@type"] === "Product") {
      const offers = productSchema.offers as Array<{
        availability: string;
        price: string;
        priceCurrency: string;
      }>;
      expect(offers.length).toBeGreaterThan(0);
      for (const offer of offers) {
        expect(offer.priceCurrency).toBe("INR");
        expect(offer.availability).toBe("https://schema.org/InStock");
        expect(Number(offer.price)).toBeGreaterThan(0);
        expect(html).toContain(new Intl.NumberFormat("en-IN", {
          style: "currency", currency: "INR", maximumFractionDigits: 0,
        }).format(Number(offer.price)));
      }
      expect(html).toContain('data-product-availability="in-stock"');
    } else {
      expect(productSchema?.mainEntity).toMatchObject({ "@type": "Thing" });
    }

    const socialImagePath = new URL(socialImage!).pathname;
    const socialImageResponse = await request.get(socialImagePath, {
      headers: crawlerHeaders,
    });

    expect(socialImageResponse.ok()).toBe(true);
    expect(socialImageResponse.headers()["content-type"]).toContain(
      "image/png",
    );
    expect((await socialImageResponse.body()).byteLength).toBeGreaterThan(
      10_000,
    );
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
    const businessProfile = "https://maps.app.goo.gl/MtSbKmvTjxZHNxdZ7";
    expect(contact).toContain(`href="${businessProfile}"`);
    expect(contact).toContain(`"hasMap":"${businessProfile}"`);
    expect(contact).toContain(`"sameAs":["${businessProfile}"]`);
    expect(contact).toContain('"postalCode":"282002"');
    const accountResponse = await request.get("/api/auth/me", {
      headers: crawlerHeaders,
    });
    expect(accountResponse.headers()["x-robots-tag"]).toContain("noindex");
    expect(robots).toContain("OAI-SearchBot");
    expect(robots).toContain("Claude-SearchBot");
    expect(filteredCatalog).toContain("max-image-preview:large");
  });

  test("renders real featured products and crawlable buying guides", async ({
    request,
  }) => {
    const home = await (await request.get("/")).text();
    expect(home).not.toContain(
      "Concept image of an ornate engraved silver bowl",
    );
    expect(home).toContain(
      "/products/multicolor-enamel-petal-thali-set-9in-765g",
    );
    const guide = await (
      await request.get("/guides/choosing-silver-gifts")
    ).text();
    expect(guide).toContain("How to choose a silver gift");
    expect(guide).toContain('href="/collections/silver-wedding-gifts"');
    const gold = await (await request.get("/category/gold")).text();
    expect(gold).toContain("Gold Coins &amp; Bars in Agra | DDA Silver");
    expect(gold).not.toContain("Silver Gold Coins");
  });
});
