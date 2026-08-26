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
          .items(
            S.documentTypeListItems().filter(
              (item) => !["page", "siteSettings"].includes(item.getId() ?? ""),
            ),
          ),
    }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
    templates: (templates) =>
      templates.filter(
        (template) => !["page", "siteSettings"].includes(template.schemaType),
      ),
  },
  document: {
    actions: (actions, context) =>
      ["page", "siteSettings"].includes(context.schemaType) ? [] : actions,
  },
});
