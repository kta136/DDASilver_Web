"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { sanityDataset, sanityProjectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "dda-silver",
  title: "DDA Silver",
  projectId: sanityProjectId,
  dataset: sanityDataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Catalog")
          .items([
            S.listItem().id("galleryPricing").title("Gallery Pricing").child(S.document().schemaType("galleryPricing").documentId("gallery-pricing")),
            S.listItem()
              .id("pursesByItemCode")
              .title("Purses — item code order")
              .schemaType("product")
              .child(
                S.documentTypeList("product")
                  .id("pursesByItemCode")
                  .title("Purses — item code order")
                  .filter('_type == "product" && category._ref == "category-purse"')
                  .defaultOrdering([
                    { field: "displayOrder", direction: "asc" },
                    { field: "_id", direction: "asc" },
                  ]),
              ),
            ...
            S.documentTypeListItems().filter(
              (item) => !["page", "siteSettings", "galleryPricing"].includes(item.getId() ?? ""),
            ),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(
        (template) => !["page", "siteSettings", "galleryPricing"].includes(template.schemaType),
      ),
  },
  document: {
    actions: (actions, context) =>
      ["page", "siteSettings"].includes(context.schemaType) ? [] : context.schemaType === "galleryPricing" ? actions.filter((action) => !["duplicate", "delete", "unpublish"].includes(action.action ?? "")) : actions,
  },
});
