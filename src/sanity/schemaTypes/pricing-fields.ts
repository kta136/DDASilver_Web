import { defineArrayMember, defineField } from "sanity";
import { idolConstructions, productPurities } from "@/lib/catalog-taxonomy";

const finishes = [
  { title: "Plain / white silver", value: "silver" },
  { title: "Gold polish", value: "gold-polish" },
  { title: "Antique polish", value: "antique" },
  { title: "Colour", value: "colour" },
  { title: "Steel polish (including gold accents)", value: "steel-polish" },
];
const charge = () =>
  defineField({
    name: "makingChargePerGram",
    title: "Making charge (₹/g, tax included)",
    type: "number",
    validation: (rule) => rule.min(0).max(1_000_000),
  });
const pieceCharge = () =>
  defineField({
    name: "makingChargePerPiece",
    title: "Making charge (₹/piece, tax included)",
    description:
      "Use instead of a per-gram charge. Added once to the silver value.",
    type: "number",
    validation: (rule) => rule.min(0).max(1_000_000),
  });

export const categoryMakingFields = [
  defineField({
    name: "pricingDeferred",
    title: "Keep pricing on enquiry for this category",
    type: "boolean",
    initialValue: false,
    description:
      "Use while category charges are being reviewed. Products remain visible without an estimate. Turning this off requires complete pricing inputs when gallery pricing is enabled.",
  }),
  charge(),
  pieceCharge(),
  defineField({
    name: "makingRules",
    title: "Making charges by weight and finish",
    type: "array",
    description:
      "When rules exist, a product must match a rule. More matching attributes take priority, then the highest applicable minimum weight. A product's own charge overrides these rules.",
    validation: (rule) => rule.max(50),
    of: [
      defineArrayMember({
        name: "makingRule",
        type: "object",
        fields: [
          defineField({
            name: "minimumWeightGrams",
            title: "Minimum weight (g)",
            type: "number",
            initialValue: 0,
            validation: (rule) => rule.required().min(0),
          }),
          defineField({
            name: "minimumExclusive",
            title: "Weight must be strictly above this minimum",
            type: "boolean",
            initialValue: false,
          }),
          defineField({
            name: "finish",
            title: "Finish (leave empty for all)",
            type: "string",
            options: { list: finishes },
          }),
          defineField({
            name: "purity",
            title: "Purity (leave empty for all)",
            type: "string",
            options: { list: [...productPurities] },
          }),
          defineField({
            name: "idolConstruction",
            title: "Idol construction (optional)",
            type: "string",
            options: { list: [...idolConstructions] },
          }),
          charge(),
          pieceCharge(),
        ],
        validation: (rule) =>
          rule.custom((value) =>
            value &&
            Number(value.makingChargePerGram != null) +
              Number(value.makingChargePerPiece != null) !==
              1
              ? "Enter exactly one making charge: per gram or per piece."
              : true,
          ),
        preview: {
          select: {
            charge: "makingChargePerGram",
            piece: "makingChargePerPiece",
            weight: "minimumWeightGrams",
            finish: "finish",
            construction: "idolConstruction",
          },
          prepare: ({ charge, piece, weight, finish, construction }) => ({
            title: `${piece != null ? `₹${piece}/piece` : `₹${charge}/g`} — ${finish ?? "all finishes"}`,
            subtitle: `${weight} g minimum${construction ? ` · ${construction}` : ""}`,
          }),
        },
      }),
    ],
  }),
];

export const productPricingField = defineField({
  name: "pricing",
  title: "Gallery pricing",
  type: "object",
  group: "pricing",
  fields: [
    defineField({
      name: "mode",
      title: "Price calculation",
      type: "string",
      initialValue: "automatic",
      options: {
        list: [
          { title: "Automatic", value: "automatic" },
          { title: "Manual total", value: "manual" },
        ],
        layout: "radio",
      },
    }),
    defineField({
      name: "finish",
      title: "Verified finish",
      description:
        "Required when the category has finish-specific making charges. Do not infer the finish from missing metadata.",
      type: "string",
      options: { list: finishes },
    }),
    defineField({
      name: "finishReviewedAt",
      title: "Finish last reviewed",
      type: "datetime",
      readOnly: true,
    }),
    defineField({
      name: "finishPhotoAssetId",
      title: "Photo used for finish review",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "finishReviewNotes",
      title: "Finish review evidence",
      type: "text",
      rows: 2,
      readOnly: true,
    }),
    {
      ...charge(),
      description:
        "Optional override of category charges. Leave empty to inherit; enter 0 only when making is free.",
    },
    pieceCharge(),
    defineField({
      name: "manualTotalInr",
      title: "Manual total (₹, tax included)",
      type: "number",
      validation: (rule) => rule.positive().max(1_000_000_000),
    }),
    defineField({
      name: "manualSizes",
      title: "Manual totals for each size",
      type: "array",
      validation: (rule) => rule.max(50),
      of: [
        defineArrayMember({
          name: "manualSizePrice",
          type: "object",
          fields: [
            defineField({
              name: "weightGrams",
              title: "Weight (g)",
              type: "number",
              validation: (rule) => rule.required().positive(),
            }),
            defineField({
              name: "diameterInches",
              title: "Diameter (in)",
              type: "number",
              validation: (rule) => rule.required().positive(),
            }),
            defineField({
              name: "totalInr",
              title: "Total (₹)",
              type: "number",
              validation: (rule) =>
                rule.required().positive().max(1_000_000_000),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "reviewedAt",
      title: "Manual price reviewed on",
      type: "datetime",
      description:
        "Required for manual totals. This date is shown to customers.",
    }),
    defineField({
      name: "reviewDueAt",
      title: "Next manual price review",
      type: "datetime",
      description:
        "A reminder only. The price remains visible after this date.",
      validation: (rule) =>
        rule
          .custom(
            (value) =>
              !value ||
              Date.parse(value) >= Date.now() ||
              "This manual price is due for review.",
          )
          .warning(),
    }),
  ],
});
