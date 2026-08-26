import { defineArrayMember, defineField, defineType } from "sanity";
import { catalogLimits, catalogSlugSchema } from "@/lib/catalog-domain";

export const collectionType = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().max(100),
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
      validation: (rule) => rule.required().max(320),
    }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      description:
        "The website automatically creates responsive Sanity CDN URLs and a descriptive filename from the collection slug.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Required for accessibility and image search. Describe the visible silver products in this collection image.",
          validation: (rule) => rule.required().min(12).max(180),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "products",
      title: "Legacy selected products",
      type: "array",
      hidden: true,
      readOnly: true,
      description:
        "Legacy only. Manage membership using Collections on each Product.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "product" }] })],
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      initialValue: 100,
      validation: (rule) =>
        rule.required().integer().min(0).max(catalogLimits.displayOrder),
    }),
  ],
});
