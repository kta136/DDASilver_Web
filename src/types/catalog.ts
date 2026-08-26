import type {
  CategoryKind,
  productMaterials,
  productPurities,
  idolConstructions,
  coinShapes,
  utensilTypes,
} from "@/lib/catalog-domain";

export type CatalogImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  objectPosition?: string;
};

export type Category = {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  image: CatalogImage;
  displayOrder: number;
  updatedAt?: string;
  productKind?: CategoryKind;
  showOnHomepage?: boolean;
  homepageOrder?: number;
  homepageImageSource?: "category" | "product";
  firstProductImage?: CatalogImage;
  productCount?: number;
};

export type Collection = {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  heroImage: CatalogImage;
  productSlugs: string[];
  displayOrder: number;
  updatedAt?: string;
  productCount?: number;
};

export type ProductMaterial = (typeof productMaterials)[number];
export type ProductPurity = (typeof productPurities)[number];
export type IdolConstruction = (typeof idolConstructions)[number];
export type CoinShape = (typeof coinShapes)[number];
export type UtensilType = (typeof utensilTypes)[number];

export type Deity = {
  title: string;
  slug: string;
};

export type ProductSizeVariant = {
  weightGrams: number;
  diameterInches: number;
};

export type Product = {
  _id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  images: CatalogImage[];
  categorySlug: string;
  categoryKind?: CategoryKind;
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

export type CatalogFacet = {
  categorySlug: string;
  productCount: number;
  purities: ProductPurity[];
  idolConstructions: IdolConstruction[];
  deities: Deity[];
  coinShapes: CoinShape[];
  utensilTypes: UtensilType[];
};

export type CatalogPage = {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  facets: CatalogFacet[];
  degraded: boolean;
};
