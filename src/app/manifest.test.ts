import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("web app manifest", () => {
  it("uses DDA Silver branding and the DDA app icon", () => {
    expect(manifest()).toMatchObject({
      name: "DDA Silver",
      short_name: "DDA Silver",
      start_url: "/",
      icons: [
        {
          src: "/icons/dda-silver-app-icon-512-v1.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    });
  });
});
