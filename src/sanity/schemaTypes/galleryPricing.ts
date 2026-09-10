import { defineField, defineType } from "sanity";
import { validatePricingWrite } from "@/lib/pricing/sanity-validation";
import { sanityApiVersion } from "@/sanity/env";

export const galleryPricingType = defineType({
  name: "galleryPricing",
  title: "Gallery Pricing",
  type: "document",
  fields: [
    defineField({
      name: "enabled",
      title: "Show gallery price estimates",
      type: "boolean",
      initialValue: false,
      description:
        "Enable only after the production persistent rate record is seeded and the pricing audit passes. Weight × Silver Bank / 1,000, plus making per gram or per piece. Tax is already included.",
    }),
  ],
  validation: (rule) =>
    rule.custom(async (document, context) =>
      !document
        ? true
        : validatePricingWrite(
            context
              .getClient({ apiVersion: sanityApiVersion })
              .withConfig({ perspective: "published", useCdn: false }),
            document,
          ),
    ),
  preview: { prepare: () => ({ title: "Gallery Pricing" }) },
});
