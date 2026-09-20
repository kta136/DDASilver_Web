export type SilverPayalBrand = {
  name: string;
  slug: string;
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  identity: string;
  introduction: string;
  metaDescription: string;
};

export const silverPayalBrands = [
  {
    name: "Anand",
    slug: "anand",
    logo: {
      src: "/images/payal-brands/anand-70.webp",
      alt: "Anand-70 Exclusive Payal Collection logo",
      width: 720,
      height: 240,
    },
    identity: "Anand-70 is presented as an Exclusive Payal Collection.",
    introduction:
      "Looking for Anand payal or Anand silver anklets? Ask the DDA Silver showroom team about current Anand-70 designs and compare the available sizes, weights, purity details and pricing before you decide.",
    metaDescription:
      "Explore Anand silver payal at DDA Silver in Agra. Enquire about current Anand-70 designs, sizes, weights, purity details and prices.",
  },
  {
    name: "MD",
    slug: "md",
    logo: {
      src: "/images/payal-brands/md-fancy-payal.webp",
      alt: "MD Fancy Payal logo",
      width: 720,
      height: 540,
    },
    identity: "MD is presented as MD Fancy Payal.",
    introduction:
      "Looking for MD payal or MD Fancy Payal? DDA Silver can help you check the current designs available to discuss and compare their sizes, weights, purity details and pricing.",
    metaDescription:
      "Explore MD silver payal and MD Fancy Payal at DDA Silver in Agra. Ask about current designs, sizes, weights, purity details and prices.",
  },
  {
    name: "AGB",
    slug: "agb",
    logo: {
      src: "/images/payal-brands/agb-dda-silver.webp",
      alt: "AGB, a product of DDA Silver, logo",
      width: 720,
      height: 540,
    },
    identity: "AGB is presented as a product of DDA Silver.",
    introduction:
      "Looking for AGB payal? Start with an enquiry to DDA Silver for the latest AGB silver payal designs available to discuss, then compare size, weight, purity details and current pricing.",
    metaDescription:
      "Explore AGB silver payal at DDA Silver in Agra. Enquire about current AGB designs, sizes, weights, purity details and prices.",
  },
  {
    name: "DDA 92.5",
    slug: "dda",
    logo: {
      src: "/images/payal-brands/dda-925.webp",
      alt: "DDA 92.5 Fancy Chain and Bracelet Collection logo",
      width: 720,
      height: 360,
    },
    identity: "DDA 92.5 is presented as a Fancy Chain & Bracelet Collection.",
    introduction:
      "Looking for DDA 92.5 payal? Ask the Agra showroom team about current DDA 92.5 designs and compare the available sizes, weights, purity details and pricing for the pieces under discussion.",
    metaDescription:
      "Explore DDA 92.5 silver payal in Agra. Ask the DDA Silver showroom about current designs, sizes, weights, purity details and prices.",
  },
  {
    name: "AKS",
    slug: "aks",
    logo: {
      src: "/images/payal-brands/aks-gola-payal.webp",
      alt: "AKS Gola Payal logo",
      width: 600,
      height: 600,
    },
    identity: "AKS is presented as AKS Gola Payal.",
    introduction:
      "Looking for AKS payal or AKS Gola Payal? Enquire with DDA Silver to check current designs and compare the sizes, weights, purity details and pricing available to discuss.",
    metaDescription:
      "Explore AKS silver payal and AKS Gola Payal at DDA Silver in Agra. Ask about current designs, sizes, weights, purity details and prices.",
  },
  {
    name: "AND",
    slug: "and",
    logo: {
      src: "/images/payal-brands/and-70.webp",
      alt: "AND-70, a product of DDA, logo",
      width: 720,
      height: 540,
    },
    identity: "AND-70 is presented as a product of DDA.",
    introduction:
      "Looking for AND payal or AND-70 silver anklets? Ask DDA Silver about the current AND designs available to discuss, including their sizes, weights, purity details and pricing.",
    metaDescription:
      "Explore AND silver payal and AND-70 anklets at DDA Silver in Agra. Enquire about current designs, sizes, weights, purity details and prices.",
  },
] as const satisfies readonly SilverPayalBrand[];

export function getSilverPayalBrand(slug: string) {
  return silverPayalBrands.find((brand) => brand.slug === slug);
}

export function getSilverPayalBrandPath(slug: string) {
  return `/silver-payal-brands/${slug}` as const;
}
