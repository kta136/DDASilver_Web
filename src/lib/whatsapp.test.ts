import { describe, expect, it } from "vitest";

import {
  buildGeneralWhatsAppUrl,
  buildWhatsAppPayalBrandUrl,
  buildWhatsAppProductUrl,
} from "@/lib/whatsapp";

describe("WhatsApp URLs", () => {
  it("includes the product title, reference, and canonical URL", () => {
    const url = new URL(
      buildWhatsAppProductUrl(
        {
          title: "Silver Bowl",
          reference: "DS-H-007",
          slug: "silver-bowl",
        },
        "https://preview.example",
      ),
    );

    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/917060001491");
    expect(url.searchParams.get("text")).toContain("Silver Bowl");
    expect(url.searchParams.get("text")).toContain("DS-H-007");
    expect(url.searchParams.get("text")).toContain(
      "https://preview.example/products/silver-bowl",
    );
  });

  it("creates a general enquiry without personal data", () => {
    const url = new URL(buildGeneralWhatsAppUrl());
    expect(url.searchParams.get("text")).toContain("exploring your silver");
  });

  it.each([
    ["Anand", "anand", "silver payal & chains"],
    ["MD", "md", "silver payal"],
    ["AGB", "agb", "silver payal"],
    ["DDA 92.5", "dda", "silver jewellery"],
    ["AKS", "aks", "silver payal"],
    ["AND", "and", "silver payal & chains"],
  ])("builds a %s enquiry with its product range and page URL", (brand, slug, productRange) => {
    const url = new URL(
      buildWhatsAppPayalBrandUrl(brand, "https://www.ddasilver.com"),
    );

    expect(url.hostname).toBe("wa.me");
    expect(url.pathname).toBe("/917060001491");
    expect(url.searchParams.get("text")).toContain(`${brand} ${productRange}`);
    expect(url.searchParams.get("text")).toContain("current designs and pricing");
    expect(url.searchParams.get("text")).toContain(
      `https://www.ddasilver.com/silver-payal-brands/${slug}`,
    );
  });

  it("creates a general payal enquiry when no brand is selected", () => {
    const url = new URL(buildWhatsAppPayalBrandUrl());
    expect(url.searchParams.get("text")?.split("\n")[0]).toBe(
      "Hello DDA Silver, I would like to enquire about silver payals.",
    );
  });
});
