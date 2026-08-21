import { describe, expect, it } from "vitest";

import imageLoader from "@/lib/image-loader";
import {
  getCatalogImageWithSeo,
  getResponsiveSanityImageUrl,
  isSanityImageUrl,
  toImageVanityFilename,
  withSanityImageVanityFilename,
} from "@/lib/sanity-image";

const sanityImage =
  "https://cdn.sanity.io/images/project/production/abc123-1254x1254.png";

describe("Sanity image delivery", () => {
  it("recognizes only valid HTTPS Sanity asset URLs", () => {
    expect(isSanityImageUrl(sanityImage)).toBe(true);
    expect(
      isSanityImageUrl(
        "https://cdn.sanity.io.evil.example/images/project/production/abc123-1254x1254.png",
      ),
    ).toBe(false);
    expect(isSanityImageUrl("/images/product.png")).toBe(false);
  });

  it("adds a stable, sanitized vanity filename without changing the asset", () => {
    const result = withSanityImageVanityFilename(
      sanityImage,
      "Ganesha Silver Idol — Front View",
    );

    expect(result).toBe(
      `${sanityImage}/ganesha-silver-idol-front-view.png`,
    );
    expect(
      withSanityImageVanityFilename(result, "Updated Product Name"),
    ).toBe(`${sanityImage}/updated-product-name.png`);
    expect(toImageVanityFilename("  Silver & Gold  ")).toBe(
      "silver-and-gold",
    );
  });

  it("builds responsive Sanity CDN URLs and never requests an upscale", () => {
    const result = new URL(
      getResponsiveSanityImageUrl({
        src: sanityImage,
        width: 1920,
        quality: 88,
      }),
    );

    expect(result.origin).toBe("https://cdn.sanity.io");
    expect(result.searchParams.get("auto")).toBe("format");
    expect(result.searchParams.get("fit")).toBe("max");
    expect(result.searchParams.get("w")).toBe("1254");
    expect(result.searchParams.get("q")).toBe("88");
  });

  it("uses the Sanity loader globally while leaving local assets direct", () => {
    expect(
      imageLoader({ src: sanityImage, width: 640 }),
    ).toContain("cdn.sanity.io/images/");
    expect(imageLoader({ src: "/images/product.png", width: 640 })).toBe(
      "/images/product.png",
    );
  });

  it("preserves authored alt text and supplies a fallback when it is absent", () => {
    const authored = getCatalogImageWithSeo(
      {
        src: sanityImage,
        alt: "  Engraved silver idol on the DDA Silver background  ",
        width: 1254,
        height: 1254,
      },
      {
        fallbackAlt: "Fallback product alt",
        vanityFilename: "ganesha-silver-idol",
      },
    );
    const fallback = getCatalogImageWithSeo(
      { ...authored, alt: "   " },
      {
        fallbackAlt: "Ganesha Silver Idol from DDA Silver",
        vanityFilename: "ganesha-silver-idol",
      },
    );

    expect(authored.alt).toBe(
      "Engraved silver idol on the DDA Silver background",
    );
    expect(fallback.alt).toBe("Ganesha Silver Idol from DDA Silver");
  });
});
