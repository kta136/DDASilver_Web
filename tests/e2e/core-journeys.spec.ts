import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "dda-consent-v1",
      JSON.stringify({
        analytics: false,
        advertising: false,
        updatedAt: new Date().toISOString(),
      }),
    );
  });
});

test("audit fixes keep phone enquiry visible and restore menu focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".collection-intro h2")).toHaveText("Timeless silver. For every moment.");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  await page.locator('article a[href^="/products/"]').first().click();
  const dialog = page.getByRole("dialog");
  const enquiry = dialog.getByRole("link", { name: "Confirm availability on WhatsApp" });
  await expect(enquiry).toBeVisible();
  const before = await enquiry.boundingBox();
  expect(before!.y + before!.height).toBeLessThanOrEqual(844);
  await page.locator(".product-dialog-content").evaluate((element) => { element.scrollTop = element.scrollHeight; });
  const after = await enquiry.boundingBox();
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(2);
});

test("phone filters expand and desktop category images align", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  await expect(page.getByRole("combobox", { name: "Filter by category" })).not.toBeVisible();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByRole("combobox", { name: "Filter by category" }).selectOption("coin");
  await expect(page).toHaveURL(/category=coin/);
  await page.getByRole("button", { name: "Hide filters" }).click();
  await expect(page.getByRole("combobox", { name: "Filter by category" })).not.toBeVisible();
  await page.setViewportSize({ width: 1536, height: 1024 });
  await page.goto("/");
  const heights = await page.locator(".collection-photo").evaluateAll((elements) => elements.map(e => e.getBoundingClientRect().height));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1);
  const hero = page.locator('.home-hero-photo img');
  await expect(hero).toHaveAttribute("loading", "eager");
  expect(await hero.evaluate((image) => (image as HTMLImageElement).currentSrc)).toMatch(/homepage-b-editorial-\d+w\.webp/);
});

test("unavailable rates offer a working retry and showroom contact", async ({ page }) => {
  let attempts = 0;
  await page.route("**/api/rates/snapshot", async (route) => {
    attempts += 1;
    await route.fulfill({ status: 503, contentType: "application/json", body: '{"error":"unavailable"}' });
  });
  await page.goto("/rates");
  const retry = page.getByRole("button", { name: "Retry live rates" });
  await expect(retry).toBeVisible();
  const before = attempts;
  await retry.click();
  await expect.poll(() => attempts).toBeGreaterThan(before);
  await expect(page.getByRole("link", { name: "Ask the showroom" })).toHaveAttribute("href", /wa\.me/);
});

test("header search submits a reloadable catalog query and closes with Escape", async ({
  page,
}) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Search the collection" });
  await toggle.click();
  const search = page.getByRole("searchbox", {
    name: "Find your next meaningful piece",
  });
  await expect(search).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(search).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await search.fill("coin");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/products\?q=coin/);
  await expect(
    page.getByRole("searchbox", { name: "Search products" }),
  ).toHaveValue("coin");
  await expect(page.locator("article").first()).toBeVisible();
});

test("mobile menu and category disclosure remain usable at phone width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  const categories = page.getByRole("button", {
    name: "Browse categories & collections",
  });
  await expect(categories).toHaveAttribute("aria-expanded", "false");
  await categories.click();
  await expect(
    page.getByRole("navigation", { name: "Browse the silver catalog" }),
  ).toBeVisible();
  await categories.click();
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Guides", exact: true }).click();
  await expect(page).toHaveURL(/\/guides$/);
  await expect(menu).not.toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("discovers a product and opens its enquiry path", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Silver, made meaningful/i,
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Explore products" }).first().click();
  await expect(page).toHaveURL(/\/products$/);
  await page.getByRole("searchbox", { name: "Search products" }).fill("silver");
  await expect(page).toHaveURL(/\/products\?q=silver$/);
  const catalogUrl = page.url();
  const firstProduct = page.locator('article a[href^="/products/"]').first();
  const productPath = await firstProduct.getAttribute("href");
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();

  await expect(page).toHaveURL(new RegExp(`${productPath}$`));
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("link", { name: "Confirm availability on WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me/);
  await expect(
    page.getByRole("searchbox", { name: "Search products" }),
  ).toHaveValue("silver");

  await page.getByRole("button", { name: "Close product details" }).click();
  await expect(page).toHaveURL(catalogUrl);
  await expect(dialog).not.toBeVisible();

  await firstProduct.click();
  await expect(dialog).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(catalogUrl);
  await expect(dialog).not.toBeVisible();

  await page.goForward();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(catalogUrl);
  await expect(dialog).not.toBeVisible();
});

test("product detail overlay fits a phone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  await page.locator('article a[href^="/products/"]').first().click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();

  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
});

test("keeps catalog filters in a reloadable share URL", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("searchbox", { name: "Search products" }).fill("silver");
  await expect(page).toHaveURL(/q=silver/);
  await page.reload();
  await expect(
    page.getByRole("searchbox", { name: "Search products" }),
  ).toHaveValue("silver");
  await expect(
    page.locator('article a[href^="/products/"]').first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).not.toHaveURL(/q=/);
});

test("rates never show fabricated zeroes when unconfigured", async ({
  page,
}) => {
  await page.route("**/api/rates/snapshot", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "The rate service is not configured." }),
    }),
  );
  await page.goto("/rates");
  await expect(
    page.getByRole("status").filter({
      hasText: /no valid rate snapshot is available/i,
    }),
  ).toBeVisible();
  await expect(page.getByRole("cell", { name: "—" }).first()).toBeVisible();
});

test("preview responses and robots policy remain noindex", async ({
  page,
  request,
}) => {
  const response = await request.get("/");
  expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");

  await page.goto("/robots.txt");
  await expect(page.locator("body")).toContainText("Disallow: /");
});

test("health reports dependency readiness without sensitive data", async ({
  request,
}) => {
  const response = await request.get("/api/health");
  expect([200, 503]).toContain(response.status());
  const payload = await response.json();

  expect(payload).toMatchObject({
    checks: {
      application: "ok",
    },
  });
  expect(JSON.stringify(payload)).not.toMatch(
    /token|secret|cookie|customer|email/i,
  );
});

test("approved click analytics send only public taxonomy fields", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.localStorage.setItem(
      "dda-consent-v1",
      JSON.stringify({
        analytics: true,
        advertising: false,
        updatedAt: new Date().toISOString(),
      }),
    );
  });
  await page.goto("/");
  await page.evaluate(() => {
    const analyticsWindow = window as typeof window & {
      capturedAnalytics: unknown[][];
    };
    analyticsWindow.capturedAnalytics = [];
    window.gtag = (...args: unknown[]) => {
      analyticsWindow.capturedAnalytics.push(args);
    };
  });
  const whatsapp = page.locator(
    '[data-analytics="whatsapp_click"][data-analytics-placement="home_visit"]',
  );
  await whatsapp.evaluate((element) => {
    element.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
  });
  await whatsapp.click();

  const events = await page.evaluate(
    () =>
      (
        window as typeof window & {
          capturedAnalytics: unknown[][];
        }
      ).capturedAnalytics,
  );
  expect(events).toContainEqual([
    "event",
    "whatsapp_click",
    { placement: "home_visit" },
  ]);
});

test("mobile navigation is keyboard and touch accessible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menuButton = page.getByRole("button", { name: "Open menu" });
  await menuButton.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Contact" }).last().click();
  await expect(page).toHaveURL(/\/contact$/);
});
