import { defineArrayMember, defineField } from "sanity";

export const catalogEditorialField = defineField({
  name: "editorialSections",
  title: "Buying guidance",
  description:
    "Useful, verified selection advice displayed below the catalog. Do not add unsupported claims or repeat keywords.",
  type: "array",
  validation: (rule) => rule.max(6),
  of: [
    defineArrayMember({
      name: "catalogEditorialSection",
      type: "object",
      fields: [
        defineField({
          name: "heading",
          type: "string",
          validation: (rule) => rule.required().max(100),
        }),
        defineField({
          name: "body",
          type: "text",
          rows: 5,
          validation: (rule) => rule.required().max(1200),
        }),
      ],
    }),
  ],
});
