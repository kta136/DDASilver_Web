import { defineArrayMember, defineField, defineType } from "sanity";

function getCategoryReference(document: unknown) {
  if (!document || typeof document !== "object") {
    return undefined;
  }

  const category = (document as { category?: unknown }).category;
  if (!category || typeof category !== "object") {
    return undefined;
  }

  const reference = (category as { _ref?: unknown })._ref;
  return typeof reference === "string" ? reference : undefined;
}

function hasNumericField(document: unknown, field: string) {
  return Boolean(
    document &&
      typeof document === "object" &&
      typeof (document as Record<string, unknown>)[field] === "number",
  );
}

export const productType = defineType({
  name: "product",
  title: "Product",
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(240),
    }),
    defineField({
      name: "gallery",
      title: "Image gallery",
      type: "array",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              description:
                "Describe the visible product and important context. Do not repeat the product title alone.",
              validation: (rule) => rule.required().min(12).max(180),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "utensilType",
      title: "Utensil item type",
      type: "string",
      description:
        "Choose the customer-facing item type. This powers the Utensils catalog filter.",
      hidden: ({ document }) =>
        getCategoryReference(document) !== "category-utensils",
      options: {
        list: [
          { title: "Glass", value: "glass" },
          { title: "Bowl", value: "bowl" },
          { title: "Plate", value: "plate" },
          { title: "Jug", value: "jug" },
          { title: "Kalash", value: "kalash" },
          { title: "Spoon", value: "spoon" },
        ],
        layout: "dropdown",
      },
      validation: (rule) =>
        rule.custom((value, context) => {
          const categoryReference = getCategoryReference(context.document);

          if (categoryReference === "category-utensils") {
            return value ? true : "Choose a Utensils item type.";
          }

          return value
            ? "Utensil item type is only valid for the Utensils category."
            : true;
        }),
    }),
    defineField({
      name: "purity",
      title: "Purity",
      type: "string",
      options: {
        list: [
          { title: "92.5%", value: "92.5" },
          { title: "99.80%", value: "99.80" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "weightGrams",
      title: "Weight (grams)",
      type: "number",
      description:
        "Enter the product weight in grams. This is required for products in the Purse category.",
      validation: (rule) =>
        rule.min(1).max(100_000).custom((value, context) => {
          const categoryReference = getCategoryReference(context.document);

          if (categoryReference === "category-purse") {
            return typeof value === "number" && Number.isFinite(value)
              ? true
              : "Enter the purse weight in grams.";
          }

          return true;
        }),
    }),
    defineField({
      name: "heightInches",
      title: "Height (inches)",
      type: "number",
      description: "Verified physical height supplied with the product.",
      validation: (rule) => rule.positive().max(1_000).precision(2),
    }),
    defineField({
      name: "widthInches",
      title: "Width (inches)",
      type: "number",
      description: "Verified physical width supplied with the product.",
      validation: (rule) => rule.positive().max(1_000).precision(2),
    }),
    defineField({
      name: "diameterInches",
      title: "Diameter (inches)",
      type: "number",
      description:
        "Verified diameter for round products such as bowls; use this instead of width.",
      validation: (rule) => rule.positive().max(1_000).precision(2),
    }),
    defineField({
      name: "singhasanWidthInches",
      title: "Singhasan width (inches)",
      type: "number",
      description:
        "Verified left-to-right width of the jhula singhasan. This is not the overall jhula width.",
      hidden: ({ document }) =>
        getCategoryReference(document) !== "category-gifts",
      validation: (rule) =>
        rule.positive().max(1_000).precision(2).custom((value, context) => {
          const categoryReference = getCategoryReference(context.document);
          const hasWidth = typeof value === "number";

          if (hasWidth && categoryReference !== "category-gifts") {
            return "Singhasan measurements are only valid for the Gifts category.";
          }

          return hasWidth ===
            hasNumericField(context.document, "singhasanDepthInches")
            ? true
            : "Enter both singhasan width and depth.";
        }),
    }),
    defineField({
      name: "singhasanDepthInches",
      title: "Singhasan depth (inches)",
      type: "number",
      description:
        "Verified back-to-front depth of the jhula singhasan. This is not the overall jhula depth.",
      hidden: ({ document }) =>
        getCategoryReference(document) !== "category-gifts",
      validation: (rule) =>
        rule.positive().max(1_000).precision(2).custom((value, context) => {
          const categoryReference = getCategoryReference(context.document);
          const hasDepth = typeof value === "number";

          if (hasDepth && categoryReference !== "category-gifts") {
            return "Singhasan measurements are only valid for the Gifts category.";
          }

          return hasDepth ===
            hasNumericField(context.document, "singhasanWidthInches")
            ? true
            : "Enter both singhasan width and depth.";
        }),
    }),
    defineField({
      name: "idolConstruction",
      title: "Idol Construction",
      type: "string",
      description:
        "Choose how the idol is constructed. Complete this only for products in the Idols category.",
      hidden: ({ document }) =>
        getCategoryReference(document) !== "category-idols",
      options: {
        list: [
          { title: "Hollow", value: "hollow" },
          { title: "Solid", value: "solid" },
          { title: "Semi-solid", value: "semi-solid" },
        ],
        layout: "radio",
      },
      validation: (rule) =>
        rule.custom((value, context) => {
          const categoryReference = getCategoryReference(context.document);

          if (categoryReference === "category-idols") {
            return value ? true : "Choose an Idols subcategory.";
          }

          return value
            ? "Idol Construction is only valid for the Idols category."
            : true;
        }),
    }),
    defineField({
      name: "deities",
      title: "Deities",
      type: "array",
      description:
        "Choose every God or deity represented by this idol. This powers the customer-facing Deity filter.",
      hidden: ({ document }) =>
        getCategoryReference(document) !== "category-idols",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "deity" }],
        }),
      ],
      validation: (rule) =>
        rule.unique().custom((value, context) => {
          const categoryReference = getCategoryReference(context.document);
          const hasDeities = Array.isArray(value) && value.length > 0;

          if (categoryReference === "category-idols") {
            return hasDeities
              ? true
              : "Choose at least one deity for an Idol product.";
          }

          return hasDeities
            ? "Deities are only valid for the Idols category."
            : true;
        }),
    }),
    defineField({
      name: "coinShape",
      title: "Coin shape",
      type: "string",
      description: "Complete this field only for products in the Coin category.",
      hidden: ({ document }) =>
        getCategoryReference(document) !== "category-coin",
      options: {
        list: [
          { title: "Round", value: "round" },
          { title: "Oval", value: "oval" },
          { title: "Square", value: "square" },
          { title: "Rectangle", value: "rectangle" },
        ],
      },
      validation: (rule) =>
        rule.custom((value, context) => {
          const categoryReference = getCategoryReference(context.document);

          if (categoryReference === "category-coin") {
            return value ? true : "Choose a Coin shape.";
          }

          return value
            ? "Coin shape is only valid for the Coin category."
            : true;
        }),
    }),
    defineField({
      name: "collections",
      title: "Collections",
      type: "array",
      of: [defineArrayMember({ type: "reference", to: [{ type: "collection" }] })],
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      initialValue: 100,
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "reference",
      title: "Internal reference",
      type: "string",
      description: "Optional. Included in WhatsApp enquiries.",
      validation: (rule) => rule.max(60),
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
      media: "gallery.0",
      subtitle: "category.title",
    },
  },
});
