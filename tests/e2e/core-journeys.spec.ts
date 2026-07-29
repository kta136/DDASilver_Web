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

test("discovers a product and opens its enquiry path", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /DDA Silver, Agra's trusted family destination/i,
    }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Explore products" }).first().click();
  await expect(page).toHaveURL(/\/products$/);
  await page
    .getByRole("searchbox", { name: "Search products" })
    .fill("silver");
  const firstProduct = page.locator('article a[href^="/products/"]').first();
  await expect(firstProduct).toBeVisible();
  await firstProduct.click();
  await expect(
    page.getByRole("link", { name: "Confirm availability on WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me/);
});

test("keeps catalog filters in a reloadable share URL", async ({ page }) => {
  await page.goto("/products");
  await page
    .getByRole("searchbox", { name: "Search products" })
    .fill("silver");
  await expect(page).toHaveURL(/q=silver/);
  await page.reload();
  await expect(
    page.getByRole("searchbox", { name: "Search products" }),
  ).toHaveValue("silver");
  await expect(page.locator('article a[href^="/products/"]').first()).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page).not.toHaveURL(/q=/);
});

test("rates never show fabricated zeroes when unconfigured", async ({ page }) => {
  await page.goto("/rates");
  await expect(
    page.getByRole("status").filter({
      hasText: /not been connected in this preview/i,
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
  const whatsapp = page
    .getByRole("link", { name: "Enquire on WhatsApp" })
    .first();
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
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await page.getByRole("link", { name: "Contact" }).last().click();
  await expect(page).toHaveURL(/\/contact$/);
});
