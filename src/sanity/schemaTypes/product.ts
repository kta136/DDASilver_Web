import { defineArrayMember, defineField, defineType } from "sanity";
import {
  catalogLimits,
  catalogSlugSchema,
  coinShapes,
  getCategoryKind,
  getProductAttributeIssues,
  idolConstructions,
  productDocumentSchema,
  productMaterials,
  productPurities,
  utensilTypes,
} from "@/lib/catalog-domain";
import { sanityApiVersion } from "@/sanity/env";

const options = (values: readonly string[]) =>
  values.map((value) => ({ title: value, value }));

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "images", title: "Images" },
    { name: "specifications", title: "Specifications" },
    { name: "organization", title: "Organization" },
  ],
  validation: (rule) =>
    rule.custom(async (document, context) => {
      if (!document) return true;
      const parsed = productDocumentSchema.safeParse(document);
      if (!parsed.success)
        return {
          message: "Complete the product fields before publishing.",
          paths: parsed.error.issues.map(
            (issue) => issue.path as (string | number)[],
          ),
        };
      const category = await context
        .getClient({ apiVersion: sanityApiVersion })
        .withConfig({ perspective: "published", useCdn: false })
        .fetch(
          '*[_type == "category" && _id == $id][0]{productKind, "slug": slug.current}',
          { id: parsed.data.category._ref },
        );
      if (!category)
        return {
          message: "Publish the referenced category first.",
          paths: [["category"]],
        };
      const issues = getProductAttributeIssues(
        parsed.data,
        getCategoryKind(category),
      );
      return issues.length
        ? {
            message: issues.map((issue) => issue.message).join(" "),
            paths: issues.map((issue) => [issue.field]),
          }
        : true;
    }),
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (rule) => rule.required().max(catalogLimits.title),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: catalogLimits.slug },
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
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      group: "content",
      validation: (rule) => rule.required().max(catalogLimits.description),
    }),
    defineField({
      name: "gallery",
      title: "Image gallery",
      type: "array",
      group: "images",
      description:
        "Upload approved gallery images. Keep the full branded frame and review the alt text before publishing.",
      of: [
        defineArrayMember({
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alternative text",
              type: "string",
              validation: (rule) =>
                rule.required().min(12).max(catalogLimits.alt),
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1).max(catalogLimits.gallery),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      group: "organization",
      description:
        "The category's Product fields setting determines the required specifications; document IDs do not matter.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "material",
      title: "Material",
      type: "string",
      initialValue: "silver",
      group: "specifications",
      options: { list: options(productMaterials), layout: "radio" },
    }),
    defineField({
      name: "purity",
      title: "Purity",
      type: "string",
      group: "specifications",
      options: {
        list: productPurities.map((value) => ({ title: `${value}%`, value })),
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "weightGrams",
      title: "Weight (grams)",
      type: "number",
      group: "specifications",
      description:
        "Enter a verified weight only. Required for Purse product fields.",
      validation: (rule) => rule.positive().max(catalogLimits.weight),
    }),
    ...[
      ["heightInches", "Height"],
      ["widthInches", "Width"],
      ["depthInches", "Depth"],
      ["diameterInches", "Diameter"],
      ["singhasanWidthInches", "Singhasan width"],
      ["singhasanDepthInches", "Singhasan depth"],
    ].map(([name, title]) =>
      defineField({
        name,
        title: `${title} (inches)`,
        type: "number",
        group: "specifications",
        description: name.startsWith("singhasan")
          ? "For Jhula product fields only; enter both seat dimensions."
          : "Verified physical measurement; use diameter for round items.",
        validation: (rule) => rule.positive().max(catalogLimits.dimension),
      }),
    ),
    defineField({
      name: "sizeVariants",
      title: "Weight and diameter variants",
      type: "array",
      group: "specifications",
      of: [
        defineArrayMember({
          type: "object",
          name: "productSizeVariant",
          fields: [
            defineField({
              name: "weightGrams",
              title: "Weight (grams)",
              type: "number",
              validation: (rule) =>
                rule.required().positive().max(catalogLimits.weight),
            }),
            defineField({
              name: "diameterInches",
              title: "Diameter (inches)",
              type: "number",
              validation: (rule) =>
                rule.required().positive().max(catalogLimits.dimension),
            }),
          ],
          preview: {
            select: { weight: "weightGrams", diameter: "diameterInches" },
            prepare: ({ weight, diameter }) => ({
              title: `${weight} g / ${diameter} in`,
            }),
          },
        }),
      ],
      validation: (rule) => rule.unique().max(catalogLimits.variants),
    }),
    defineField({
      name: "utensilType",
      title: "Utensil item type",
      type: "string",
      group: "specifications",
      description: "Complete only for Utensil product fields.",
      options: { list: options(utensilTypes) },
    }),
    defineField({
      name: "idolConstruction",
      title: "Idol construction",
      type: "string",
      group: "specifications",
      description: "Complete only for Idol product fields.",
      options: { list: options(idolConstructions) },
    }),
    defineField({
      name: "deities",
      title: "Deities",
      type: "array",
      group: "specifications",
      description: "Complete only for Idol product fields.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "deity" }] })],
      validation: (rule) => rule.unique().max(catalogLimits.deities),
    }),
    defineField({
      name: "coinShape",
      title: "Coin or bar shape",
      type: "string",
      group: "specifications",
      description: "Complete only for Coin or Gold product fields.",
      options: { list: options(coinShapes) },
    }),
    defineField({
      name: "collections",
      title: "Collections",
      type: "array",
      group: "organization",
      description:
        "Manage collection membership here. Collection pages and their product lists are derived from these references.",
      of: [
        defineArrayMember({ type: "reference", to: [{ type: "collection" }] }),
      ],
      validation: (rule) => rule.unique().max(catalogLimits.collections),
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      group: "organization",
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      group: "organization",
      initialValue: 100,
      validation: (rule) =>
        rule.required().integer().min(0).max(catalogLimits.displayOrder),
    }),
    defineField({
      name: "reference",
      title: "Internal reference",
      type: "string",
      group: "organization",
      description: "Canonical item code included in WhatsApp enquiries.",
      validation: (rule) => rule.max(catalogLimits.reference),
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
    select: { title: "title", media: "gallery.0", subtitle: "category.title" },
  },
});
