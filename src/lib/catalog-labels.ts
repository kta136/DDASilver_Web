import type {
  CoinShape,
  IdolConstruction,
  ProductPurity,
} from "@/types/catalog";

export const purityLabels: Record<ProductPurity, string> = {
  "92.5": "92.5%",
  "99.80": "99.80%",
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
};
