import { categoryType } from "@/sanity/schemaTypes/category";
import { collectionType } from "@/sanity/schemaTypes/collection";
import { deityType } from "@/sanity/schemaTypes/deity";
import { pageType } from "@/sanity/schemaTypes/page";
import { productType } from "@/sanity/schemaTypes/product";
import { siteSettingsType } from "@/sanity/schemaTypes/siteSettings";

export const schemaTypes = [
  productType,
  categoryType,
  deityType,
  collectionType,
  pageType,
  siteSettingsType,
];
