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
    .fill("bracelet");
  await expect(
    page.getByRole("heading", { name: "Braided Silver Bracelet" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /Braided Silver Bracelet/ })
    .click();
  await expect(
    page.getByRole("link", { name: "Confirm availability on WhatsApp" }),
  ).toHaveAttribute("href", /wa\.me/);
});

test("rates never show fabricated zeroes when unconfigured", async ({ page }) => {
  await page.goto("/rates");
  await expect(page.getByText(/not been connected in this preview/i)).toBeVisible();
  await expect(page.getByRole("cell", { name: "—" }).first()).toBeVisible();
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
