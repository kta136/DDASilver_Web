import { categoryType } from "@/sanity/schemaTypes/category";
import { collectionType } from "@/sanity/schemaTypes/collection";
import { deityType } from "@/sanity/schemaTypes/deity";
import { pageType } from "@/sanity/schemaTypes/page";
import { productType } from "@/sanity/schemaTypes/product";
import { siteSettingsType } from "@/sanity/schemaTypes/siteSettings";
import { galleryPricingType } from "./galleryPricing";

export const schemaTypes = [
  galleryPricingType,
  productType,
  categoryType,
  deityType,
  collectionType,
  pageType,
  siteSettingsType,
];
