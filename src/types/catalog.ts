export type CatalogImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  objectPosition?: string;
};

export type Category = {
  title: string;
  slug: string;
  description: string;
  image: CatalogImage;
  displayOrder: number;
  updatedAt?: string;
};

export type Collection = {
  title: string;
  slug: string;
  description: string;
  heroImage: CatalogImage;
  productSlugs: string[];
  displayOrder: number;
  updatedAt?: string;
};

export type ProductPurity = "92.5" | "99.80";
export type IdolConstruction = "hollow" | "solid" | "semi-solid";
export type CoinShape = "round" | "oval" | "square" | "rectangle";

export type Deity = {
  title: string;
  slug: string;
};

export type Product = {
  title: string;
  slug: string;
  shortDescription: string;
  images: CatalogImage[];
  categorySlug: string;
  collectionSlugs: string[];
  featured: boolean;
  displayOrder: number;
  reference?: string;
  purity?: ProductPurity;
  idolConstruction?: IdolConstruction;
  deities: Deity[];
  coinShape?: CoinShape;
  updatedAt?: string;
};
