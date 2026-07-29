import { categoryType } from "@/sanity/schemaTypes/category";
import { collectionType } from "@/sanity/schemaTypes/collection";
import { pageType } from "@/sanity/schemaTypes/page";
import { productType } from "@/sanity/schemaTypes/product";
import { siteSettingsType } from "@/sanity/schemaTypes/siteSettings";

export const schemaTypes = [
  productType,
  categoryType,
  collectionType,
  pageType,
  siteSettingsType,
];
