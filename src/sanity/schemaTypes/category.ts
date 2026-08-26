import { defineField, defineType } from "sanity";
import {
  catalogLimits,
  catalogSlugSchema,
  categoryKinds,
} from "@/lib/catalog-domain";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(80),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) =>
        rule
          .required()
          .custom(
            (value) =>
              !value ||
              catalogSlugSchema.safeParse(value.current).success ||
              "Use lowercase letters, numbers and hyphens.",
          ),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description:
        "The website automatically creates responsive Sanity CDN URLs and a descriptive filename from the category slug.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Required for accessibility and image search. Describe the visible silver item represented by this category.",
          validation: (rule) => rule.required().min(12).max(180),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      initialValue: 100,
      validation: (rule) =>
        rule.required().integer().min(0).max(catalogLimits.displayOrder),
    }),
    defineField({
      name: "productKind",
      title: "Product fields",
      type: "string",
      description:
        "Choose which specifications and filters apply. Set this before changing an existing category slug. Legacy categories keep their current behavior until this is set.",
      options: {
        list: categoryKinds.map((value) => ({
          title: value === "general" ? "General products" : value,
          value,
        })),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "showOnHomepage",
      title: "Show on homepage",
      type: "boolean",
      initialValue: true,
      description:
        "Only populated categories appear. Existing categories are shown unless this is disabled.",
    }),
    defineField({
      name: "homepageOrder",
      title: "Homepage order",
      type: "number",
      description: "Optional override; otherwise uses Display order.",
      validation: (rule) =>
        rule.integer().min(0).max(catalogLimits.displayOrder),
    }),
    defineField({
      name: "homepageImageSource",
      title: "Homepage image",
      type: "string",
      initialValue: "product",
      options: {
        list: [
          { title: "First product image", value: "product" },
          { title: "Category image", value: "category" },
        ],
      },
    }),
  ],
});
