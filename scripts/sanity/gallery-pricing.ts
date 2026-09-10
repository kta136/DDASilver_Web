import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getCliClient } from "sanity/cli";
import { z } from "zod";
import {
  auditPricingCoverage,
  validatePricingWrite,
} from "../../src/lib/pricing/sanity-validation";
import {
  makingChargeSchema,
  makingRulesSchema,
} from "../../src/lib/pricing/validation";

const client = getCliClient({ apiVersion: "2026-08-01" }).withConfig({
  useCdn: false,
  perspective: "published",
});
const args = process.argv.slice(2);
if (
  args.some(
    (arg) =>
      !["--apply", "--audit"].includes(arg) && !arg.startsWith("--output="),
  )
)
  throw new Error("Use --apply, --audit and/or --output=path.");
async function main() {
  const defaults = z
    .record(
      z.string(),
      z.object({
        source: z.string(),
        makingChargePerGram: makingChargeSchema.optional(),
        makingChargePerPiece: makingChargeSchema.optional(),
        makingRules: makingRulesSchema.optional(),
        pricingDeferred: z.boolean().optional(),
      }),
    )
    .parse(
      JSON.parse(
        await readFile(
          resolve(process.cwd(), "docs/gallery-pricing-defaults.json"),
          "utf8",
        ),
      ),
    );

  if (!args.includes("--audit")) {
    const categories = await client.fetch<Record<string, unknown>[]>(
      '*[_type == "category" && _id in $ids]',
      { ids: Object.keys(defaults) },
    );
    const proposed = categories.map((category) => {
      const { source, ...pricing } = defaults[String(category._id)];
      const unset = pricing.pricingDeferred
        ? []
        : ["makingChargePerGram", "makingChargePerPiece", "makingRules"].filter(
            (key) => pricing[key as keyof typeof pricing] === undefined,
          );
      return {
        category,
        source,
        unset,
        set: {
          pricingDeferred: false,
          ...pricing,
          ...(pricing.makingRules
            ? {
                makingRules: pricing.makingRules.map((rule, i) => ({
                  _key: `making-${i}`,
                  _type: "makingRule",
                  ...rule,
                })),
              }
            : {}),
        },
      };
    });
    if (proposed.length !== Object.keys(defaults).length)
      throw new Error("A configured category is missing. No changes applied.");
    for (const { category, source, set, unset } of proposed) {
      console.log(
        JSON.stringify({ category: category._id, source, set, unset }),
      );
      const document = { ...category, ...set };
      for (const key of unset) delete document[key as keyof typeof document];
      const valid = await validatePricingWrite(client, document);
      if (valid !== true) throw new Error(`${category._id}: ${valid}`);
    }
    if (args.includes("--apply")) {
      let transaction = client.transaction().createIfNotExists({
        _id: "gallery-pricing",
        _type: "galleryPricing",
        enabled: false,
      });
      for (const { category, set, unset } of proposed)
        transaction = transaction.patch(String(category._id), (patch) =>
          patch.ifRevisionId(String(category._rev)).unset(unset).set(set),
        );
      await transaction.commit({ visibility: "sync" });
      console.log(
        "Saved owner-confirmed category charges. Gallery activation was not changed.",
      );
    } else
      console.log("Dry run. Pass --apply to save these category settings.");
  }
  const audit = await auditPricingCoverage(client);
  const output = args.find((arg) => arg.startsWith("--output="))?.slice(9);
  if (output) await writeFile(resolve(output), JSON.stringify(audit, null, 2));
  console.log(
    JSON.stringify(
      {
        productsChecked: audit.total,
        productsNeedingReview: audit.failures.length,
        firstFailures: audit.failures.slice(0, 8),
      },
      null,
      2,
    ),
  );
  if (args.includes("--audit") && audit.failures.length) process.exitCode = 1;
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
