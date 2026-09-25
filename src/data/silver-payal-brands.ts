export type SilverPayalBrand = {
  name: string;
  slug: string;
  productLabel: string;
  silverPurity: number;
  logo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
  identity: string;
  introduction: string;
  metaDescription: string;
  editorialSections?: readonly { heading: string; body: string }[];
  productSlugs?: readonly string[];
};

export const silverPayalBrands = [
  {
    name: "Anand",
    slug: "anand",
    productLabel: "Silver Payal & Chains",
    silverPurity: 70,
    logo: {
      src: "/images/payal-brands/anand-70.webp",
      alt: "Anand-70 Exclusive Payal Collection logo",
      width: 720,
      height: 240,
    },
    identity: "Anand, a DDA brand.",
    introduction:
      "Discover Anand payal and chains, manufactured by DDA with 70% silver purity. Visit our Agra showroom or enquire about current designs, sizes, weights and pricing.",
    metaDescription:
      "Explore Anand payal and chains with 70% silver purity, manufactured by DDA (Deen Dayal Anand Kumar Sarraf). Enquire at DDA Silver in Agra.",
  },
  {
    name: "MD",
    slug: "md",
    productLabel: "Silver Payal",
    silverPurity: 45,
    logo: {
      src: "/images/payal-brands/md-fancy-payal.webp",
      alt: "MD Fancy Payal logo",
      width: 720,
      height: 540,
    },
    identity: "MD, a DDA brand.",
    introduction:
      "Discover MD payal, manufactured by DDA with 45% silver purity. Visit our Agra showroom or enquire about current designs, sizes, weights and pricing.",
    metaDescription:
      "Explore MD payal with 45% silver purity, manufactured by DDA (Deen Dayal Anand Kumar Sarraf). Enquire at DDA Silver in Agra.",
  },
  {
    name: "AGB",
    slug: "agb",
    productLabel: "Silver Payal",
    silverPurity: 40,
    logo: {
      src: "/images/payal-brands/agb-dda-silver.webp",
      alt: "AGB, a product of DDA Silver, logo",
      width: 720,
      height: 540,
    },
    identity: "AGB, a DDA brand.",
    introduction:
      "Discover AGB payal, manufactured by DDA with 40% silver purity. Visit our Agra showroom or enquire about current designs, sizes, weights and pricing.",
    metaDescription:
      "Explore AGB payal with 40% silver purity, manufactured by DDA (Deen Dayal Anand Kumar Sarraf). Enquire at DDA Silver in Agra.",
  },
  {
    name: "DDA 92.5",
    slug: "dda",
    productLabel: "Silver Jewellery",
    silverPurity: 92.5,
    logo: {
      src: "/images/payal-brands/dda-925.webp",
      alt: "DDA 92.5 Fancy Chain and Bracelet Collection logo",
      width: 720,
      height: 360,
    },
    identity: "DDA 92.5, a DDA brand.",
    introduction:
      "Discover DDA 92.5 chains, bracelets, rings, payal, fancy jewellery and necklaces, manufactured by DDA with 92.5% silver purity. Visit our Agra showroom or enquire about current designs, sizes, weights and pricing.",
    metaDescription:
      "Explore DDA 92.5 silver jewellery: chains, bracelets, rings, payal and necklaces with 92.5% silver purity. Manufactured by DDA. Enquire in Agra.",
  },
  {
    name: "AKS",
    slug: "aks",
    productLabel: "Silver Payal",
    silverPurity: 45,
    logo: {
      src: "/images/payal-brands/aks-gola-payal.webp",
      alt: "AKS Gola Payal logo",
      width: 600,
      height: 600,
    },
    identity: "AKS, a DDA brand.",
    introduction:
      "Discover AKS payal, manufactured by DDA with 45% silver purity. Visit our Agra showroom or enquire about current designs, sizes, weights and pricing.",
    metaDescription:
      "Explore AKS payal with 45% silver purity, manufactured by DDA (Deen Dayal Anand Kumar Sarraf). Enquire at DDA Silver in Agra.",
  },
  {
    name: "AND",
    slug: "and",
    productLabel: "Silver Payal & Chains",
    silverPurity: 60,
    logo: {
      src: "/images/payal-brands/and-70.webp",
      alt: "AND-70, a product of DDA, logo",
      width: 720,
      height: 540,
    },
    identity: "AND, a DDA brand.",
    introduction:
      "Discover AND payal and chains, manufactured by DDA with 60% silver purity. Visit our Agra showroom or enquire about current designs, sizes, weights and pricing.",
    metaDescription:
      "Explore AND payal and chains with 60% silver purity, manufactured by DDA (Deen Dayal Anand Kumar Sarraf). Enquire at DDA Silver in Agra.",
  },
] as const satisfies readonly SilverPayalBrand[];

export function getSilverPayalBrand(
  slug: string,
): SilverPayalBrand | undefined {
  return silverPayalBrands.find((brand) => brand.slug === slug);
}

export function getSilverPayalBrandPath(slug: string) {
  return `/silver-payal-brands/${slug}` as const;
}
