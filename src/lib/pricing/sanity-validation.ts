import type { SanityClient } from "@sanity/client";
import { pricingIssues, type PricingProduct } from "./model";
import {
  decodeMakingCharge,
  decodeMakingRules,
  decodePricing,
} from "./validation";
import { z } from "zod";

type PricingClient = Pick<SanityClient, "fetch">;

type WriteDocument = {
  _id: string;
  _type?: string;
  category?: { _ref: string };
  pricing?: unknown;
  [key: string]: unknown;
};
const projection = `_id, title, material, purity, idolConstruction, weightGrams, sizeVariants, pricing,
  "categorySlug": category->slug.current, "categoryKind": category->productKind,
  "categoryMakingChargePerGram": category->makingChargePerGram,
  "categoryMakingChargePerPiece": category->makingChargePerPiece,
  "categoryPricingDeferred": coalesce(category->pricingDeferred, false),
  "categoryMakingRules": category->makingRules`;

export function decodePricingProduct(
  raw: Record<string, unknown>,
): PricingProduct {
  const variants = z
    .array(
      z.object({
        weightGrams: z.number().positive(),
        diameterInches: z.number().positive(),
      }),
    )
    .nullish()
    .safeParse(raw.sizeVariants);
  return {
    ...raw,
    sizeVariants: variants.success ? (variants.data ?? undefined) : [],
    pricing: variants.success ? decodePricing(raw.pricing) : null,
    categoryMakingChargePerGram: decodeMakingCharge(
      raw.categoryMakingChargePerGram,
    ),
    categoryMakingChargePerPiece: decodeMakingCharge(
      raw.categoryMakingChargePerPiece,
    ),
    categoryMakingRules: decodeMakingRules(raw.categoryMakingRules),
  } as PricingProduct;
}

export async function auditPricingCoverage(
  client: PricingClient,
  category?: Record<string, unknown>,
) {
  const failures: { id: string; title: string; issues: string[] }[] = [];
  let afterId = "";
  let total = 0;
  for (;;) {
    const rows = await client.fetch<Record<string, unknown>[]>(
      `*[_type == "product" && _id > $afterId &&
      !(_id in path("drafts.**")) && !(_id in path("versions.**")) && ($category == "" || category._ref == $category)]
      | order(_id asc)[0...200]{${projection}}`,
      { afterId, category: category?._id ?? "" },
    );
    for (const source of rows) {
      const row = { ...source };
      if (category) {
        row.categoryMakingChargePerGram = category.makingChargePerGram;
        row.categoryMakingChargePerPiece = category.makingChargePerPiece;
        row.categoryMakingRules = category.makingRules;
        row.categoryPricingDeferred = category.pricingDeferred === true;
        row.categoryKind = category.productKind;
        row.categorySlug = (category.slug as { current?: string } | undefined)
          ?.current;
      }
      const issues = pricingIssues(decodePricingProduct(row));
      if (issues.length)
        failures.push({
          id: String(row._id),
          title: String(row.title),
          issues,
        });
    }
    total += rows.length;
    if (rows.length < 200) break;
    afterId = String(rows.at(-1)!._id);
  }
  return { total, failures };
}

export async function validatePricingWrite(
  client: PricingClient,
  document: Record<string, unknown>,
): Promise<string | true> {
  try {
    const enabled =
      document._type === "galleryPricing"
        ? document.enabled
        : await client.fetch<boolean | null>(
            '*[_id == "gallery-pricing" && _type == "galleryPricing"][0].enabled',
          );
    if (!enabled) return true;
    if (document._type === "category" || document._type === "galleryPricing") {
      const category =
        document._type === "category"
          ? { ...document, _id: String(document._id).replace(/^drafts\./, "") }
          : undefined;
      const audit = await auditPricingCoverage(client, category);
      return audit.failures.length
        ? `${audit.failures.length} products need pricing: ${audit.failures
            .slice(0, 5)
            .map((row) => `${row.title}: ${row.issues.join(" ")}`)
            .join("; ")}`
        : true;
    }
    const id = (document.category as { _ref?: string } | undefined)?._ref;
    const category = await client.fetch<Record<string, unknown> | null>(
      '*[_id == $id][0]{makingChargePerGram,makingChargePerPiece,makingRules,pricingDeferred,productKind,"slug":slug.current}',
      { id: id ?? "" },
    );
    const issues = pricingIssues(
      decodePricingProduct({
        ...document,
        categoryKind: category?.productKind,
        categorySlug: category?.slug,
        categoryPricingDeferred: category?.pricingDeferred === true,
        categoryMakingChargePerPiece: category?.makingChargePerPiece,
        categoryMakingChargePerGram: category?.makingChargePerGram,
        categoryMakingRules: category?.makingRules,
      }),
    );
    return issues.length ? issues.join(" ") : true;
  } catch {
    return "Pricing coverage could not be verified. Retry before publishing.";
  }
}

/** Importers must call this on final documents before creating/replacing them. */
export async function preparePricingWrites<T extends { _id: string }>(
  client: PricingClient,
  documents: T[],
): Promise<void> {
  if (!documents.length) return;
  const existing = await client.fetch<{ _id: string; pricing?: unknown }[]>(
    "*[_id in $ids]{_id,pricing}",
    { ids: documents.map((doc) => doc._id) },
  );
  const byId = new Map(existing.map((doc) => [doc._id, doc.pricing]));
  for (const raw of documents) {
    const doc = raw as unknown as WriteDocument;
    if (doc.pricing === undefined && byId.get(doc._id) != null)
      doc.pricing = byId.get(doc._id);
    const valid = await validatePricingWrite(client, doc);
    if (valid !== true) throw new Error(`${doc._id}: ${valid}`);
  }
}

/** Validate the complete stored product with a patch applied, including existing manual prices. */
export async function validatePricingPatch(
  client: PricingClient,
  id: string,
  set: Record<string, unknown>,
) {
  const existing = await client.fetch<Record<string, unknown> | null>(
    "*[_id == $id][0]",
    { id },
  );
  if (!existing) throw new Error(`Cannot validate missing document ${id}.`);
  const valid = await validatePricingWrite(client, { ...existing, ...set });
  if (valid !== true) throw new Error(`${id}: ${valid}`);
}

export async function preserveCategoryPricing(
  client: PricingClient,
  document: Record<string, unknown>,
) {
  const existing = await client.fetch<Record<string, unknown> | null>(
    "*[_id == $id][0]{makingChargePerGram,makingChargePerPiece,makingRules,pricingDeferred}",
    { id: document._id },
  );
  for (const key of [
    "makingChargePerGram",
    "makingChargePerPiece",
    "makingRules",
    "pricingDeferred",
  ])
    if (document[key] === undefined && existing?.[key] != null)
      document[key] = existing[key];
  const valid = await validatePricingWrite(client, document);
  if (valid !== true) throw new Error(`${document._id}: ${valid}`);
}
