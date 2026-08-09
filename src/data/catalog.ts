import type { Category, Collection, Product } from "@/types/catalog";

const mockupImages = {
  bracelet: {
    src: "/images/mockup/featured-bracelet.png",
    alt: "Concept image of a braided silver bracelet on pale stone",
    width: 1122,
    height: 1402,
  },
  earrings: {
    src: "/images/mockup/featured-earrings.png",
    alt: "Concept image of floral silver stud earrings",
    width: 1122,
    height: 1402,
  },
  coin: {
    src: "/images/mockup/category-coins.png",
    alt: "Concept image of a classic silver coin",
    width: 1254,
    height: 1254,
  },
  gift: {
    src: "/images/mockup/category-gifts.png",
    alt: "Concept image of an elegant silver gift box",
    width: 1254,
    height: 1254,
  },
  purse: {
    src: "/images/mockup/category-gifts.png",
    alt: "Concept image representing an ornate silver purse",
    width: 1254,
    height: 1254,
  },
  necklace: {
    src: "/images/mockup/featured-chain.png",
    alt: "Concept image of a delicate silver chain on pale stone",
    width: 1122,
    height: 1402,
  },
  pooja: {
    src: "/images/mockup/category-pooja.png",
    alt: "Concept image of a small silver diya lamp",
    width: 1254,
    height: 1254,
  },
  tableware: {
    src: "/images/mockup/category-tableware.png",
    alt: "Concept image of an engraved silver bowl",
    width: 1254,
    height: 1254,
  },
  rings: {
    src: "/images/mockup/featured-ring.png",
    alt: "Concept image of an engraved silver ring",
    width: 1122,
    height: 1402,
  },
  jewellery: {
    src: "/images/mockup/category-jewellery.png",
    alt: "Concept image of a floral silver jewellery ornament",
    width: 1254,
    height: 1254,
  },
  jhula: {
    src: "/images/gallery-ingestion/new-folder-2-2026-08-09/proof/jh-01-ornate-peacock-floral-silver-jhula.png",
    alt: "Ornate 92.5% silver peacock and floral jhula with suspended seat",
    width: 1254,
    height: 1254,
  },
} satisfies Record<string, Category["image"]>;

export const fallbackCategories: Category[] = [
  {
    title: "Jewellery",
    slug: "jewellery",
    description: "Silver adornments for everyday wear and meaningful occasions.",
    image: mockupImages.jewellery,
    displayOrder: 1,
  },
  {
    title: "Coin",
    slug: "coin",
    description:
      "Silver coins in classic and contemporary shapes for gifting and milestones.",
    image: mockupImages.coin,
    displayOrder: 2,
  },
  {
    title: "Idols",
    slug: "idols",
    description:
      "Hollow, solid, and semi-solid silver devotional pieces for prayer and tradition.",
    image: mockupImages.pooja,
    displayOrder: 3,
  },
  {
    title: "Purse",
    slug: "purse",
    description:
      "Ornate 92.5% silver purses and clutches for celebrations and gifting.",
    image: mockupImages.purse,
    displayOrder: 4,
  },
  {
    title: "Gifts",
    slug: "gifts",
    description: "Memorable silver gifts for families, celebrations, and milestones.",
    image: mockupImages.gift,
    displayOrder: 5,
  },
  {
    title: "Jhula",
    slug: "jhula",
    description:
      "Ornate 92.5% silver jhulas for devotional settings, celebrations, and meaningful gifting.",
    image: mockupImages.jhula,
    displayOrder: 6,
  },
  {
    title: "Utensils",
    slug: "utensils",
    description:
      "Silver dining, serving, and home utensils for meaningful everyday use.",
    image: mockupImages.tableware,
    displayOrder: 7,
  },
];

export const fallbackProducts: Product[] = [
  {
    title: "Braided Silver Bracelet",
    slug: "braided-silver-bracelet",
    shortDescription:
      "A softly braided silver bracelet presented as a provisional concept.",
    images: [mockupImages.bracelet],
    categorySlug: "jewellery",
    collectionSlugs: ["everyday-silver"],
    featured: true,
    displayOrder: 1,
    reference: "DS-J-001",
    purity: "92.5",
    deities: [],
  },
  {
    title: "Delicate Silver Chain",
    slug: "delicate-silver-chain",
    shortDescription:
      "A delicate silver chain presented as a provisional concept.",
    images: [mockupImages.necklace],
    categorySlug: "jewellery",
    collectionSlugs: ["celebration-edit"],
    featured: true,
    displayOrder: 4,
    reference: "DS-J-002",
    purity: "92.5",
    deities: [],
  },
  {
    title: "Floral Silver Stud Earrings",
    slug: "floral-silver-stud-earrings",
    shortDescription:
      "Floral silver stud earrings presented as a provisional concept.",
    images: [mockupImages.earrings],
    categorySlug: "jewellery",
    collectionSlugs: ["celebration-edit", "thoughtful-gifts"],
    featured: true,
    displayOrder: 3,
    reference: "DS-J-003",
    purity: "92.5",
    deities: [],
  },
  {
    title: "Classic Silver Coin",
    slug: "classic-silver-coin",
    shortDescription:
      "A classic silver coin presented as a provisional gifting concept.",
    images: [mockupImages.coin],
    categorySlug: "coin",
    collectionSlugs: ["thoughtful-gifts"],
    featured: false,
    displayOrder: 4,
    reference: "DS-C-001",
    purity: "99.80",
    deities: [],
    coinShape: "round",
  },
  {
    title: "Silver Diya Lamp",
    slug: "silver-diya-lamp",
    shortDescription:
      "A small silver diya lamp presented as a provisional pooja concept.",
    images: [mockupImages.pooja],
    categorySlug: "idols",
    collectionSlugs: ["blessings"],
    featured: false,
    displayOrder: 5,
    reference: "DS-P-001",
    purity: "92.5",
    idolConstruction: "semi-solid",
    deities: [],
  },
  {
    title: "Silver Gift Box",
    slug: "silver-gift-box",
    shortDescription:
      "An elegant silver gift box presented as a provisional concept.",
    images: [mockupImages.gift],
    categorySlug: "gifts",
    collectionSlugs: ["blessings", "thoughtful-gifts"],
    featured: false,
    displayOrder: 6,
    reference: "DS-G-001",
    purity: "92.5",
    deities: [],
  },
  {
    title: "Engraved Silver Bowl",
    slug: "engraved-silver-bowl",
    shortDescription:
      "An engraved silver bowl presented as a provisional tableware concept.",
    images: [mockupImages.tableware],
    categorySlug: "utensils",
    collectionSlugs: ["thoughtful-gifts"],
    featured: false,
    displayOrder: 7,
    reference: "DS-H-001",
    purity: "92.5",
    utensilType: "bowl",
    deities: [],
  },
  {
    title: "Engraved Silver Ring",
    slug: "engraved-silver-ring",
    shortDescription:
      "An engraved silver ring presented as a provisional concept.",
    images: [mockupImages.rings],
    categorySlug: "jewellery",
    collectionSlugs: ["everyday-silver"],
    featured: true,
    displayOrder: 2,
    reference: "DS-J-004",
    purity: "92.5",
    deities: [],
  },
];

export const fallbackCollections: Collection[] = [
  {
    title: "Everyday Silver",
    slug: "everyday-silver",
    description:
      "Considered silver pieces designed to become part of everyday rituals.",
    heroImage: mockupImages.bracelet,
    productSlugs: ["braided-silver-bracelet", "engraved-silver-ring"],
    displayOrder: 1,
  },
  {
    title: "Celebration Edit",
    slug: "celebration-edit",
    description:
      "Statement pieces selected for festivals, weddings, and family occasions.",
    heroImage: mockupImages.necklace,
    productSlugs: ["delicate-silver-chain", "floral-silver-stud-earrings"],
    displayOrder: 2,
  },
  {
    title: "Thoughtful Gifts",
    slug: "thoughtful-gifts",
    description:
      "Silver gifts chosen to mark milestones with warmth and permanence.",
    heroImage: mockupImages.tableware,
    productSlugs: [
      "floral-silver-stud-earrings",
      "classic-silver-coin",
      "silver-gift-box",
      "engraved-silver-bowl",
    ],
    displayOrder: 3,
  },
  {
    title: "Blessings",
    slug: "blessings",
    description:
      "Devotional silver for auspicious beginnings and cherished traditions.",
    heroImage: mockupImages.pooja,
    productSlugs: [
      "silver-diya-lamp",
      "silver-gift-box",
    ],
    displayOrder: 4,
  },
];
