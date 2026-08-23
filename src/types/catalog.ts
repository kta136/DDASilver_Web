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

export type ProductMaterial = "silver" | "gold";
export type ProductPurity = "91.60" | "92.5" | "99.50" | "99.80";
export type IdolConstruction = "hollow" | "solid" | "semi-solid";
export type CoinShape = "round" | "oval" | "square" | "rectangle" | "scalloped";
export type UtensilType =
  | "glass"
  | "bowl"
  | "plate"
  | "jug"
  | "kalash"
  | "bottle"
  | "spoon"
  | "pooja-thali-set";

export type Deity = {
  title: string;
  slug: string;
};

export type ProductSizeVariant = {
  weightGrams: number;
  diameterInches: number;
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
  material?: ProductMaterial;
  purity?: ProductPurity;
  weightGrams?: number;
  heightInches?: number;
  widthInches?: number;
  depthInches?: number;
  diameterInches?: number;
  singhasanWidthInches?: number;
  singhasanDepthInches?: number;
  sizeVariants?: ProductSizeVariant[];
  utensilType?: UtensilType;
  idolConstruction?: IdolConstruction;
  deities: Deity[];
  coinShape?: CoinShape;
  updatedAt?: string;
};
