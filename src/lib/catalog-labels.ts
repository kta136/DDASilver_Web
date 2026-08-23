import type {
  CoinShape,
  IdolConstruction,
  ProductMaterial,
  ProductPurity,
  UtensilType,
} from "@/types/catalog";

export const purityLabels: Record<ProductPurity, string> = {
  "91.60": "91.60%",
  "92.5": "92.5%",
  "99.50": "99.50%",
  "99.80": "99.80%",
};

export const materialLabels: Record<ProductMaterial, string> = {
  silver: "Silver",
  gold: "Gold",
};

export const idolConstructionLabels: Record<IdolConstruction, string> = {
  hollow: "Hollow",
  solid: "Solid",
  "semi-solid": "Semi-solid",
};

export const coinShapeLabels: Record<CoinShape, string> = {
  round: "Round",
  oval: "Oval",
  square: "Square",
  rectangle: "Rectangle",
  scalloped: "Scalloped",
};

export const utensilTypeLabels: Record<UtensilType, string> = {
  glass: "Glass",
  bowl: "Bowl",
  plate: "Plate",
  jug: "Jug",
  kalash: "Kalash",
  bottle: "Bottle",
  spoon: "Spoon",
  "pooja-thali-set": "Pooja Thali Set",
};
