import { defineField, defineType } from "sanity";
import { catalogLimits, catalogSlugSchema } from "@/lib/catalog-domain";

export const deityType = defineType({
  name: "deity",
  title: "Deities",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Name",
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
      name: "displayOrder",
      title: "Display order",
      type: "number",
      initialValue: 100,
      validation: (rule) =>
        rule.required().integer().min(0).max(catalogLimits.displayOrder),
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrderAsc",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
});
