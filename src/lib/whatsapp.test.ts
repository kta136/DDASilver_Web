import { describe, expect, it } from "vitest";

import {
  buildGeneralWhatsAppUrl,
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
});
