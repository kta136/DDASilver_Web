import { defineField, defineType } from "sanity";

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
      validation: (rule) => rule.required(),
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
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
});
