import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { getCliClient } from "sanity/cli";
import { z } from "zod";
import { productFinishes } from "../../src/lib/pricing/model";
import { validatePricingWrite } from "../../src/lib/pricing/sanity-validation";

const client = getCliClient({ apiVersion: "2026-08-01" }).withConfig({
  useCdn: false,
  perspective: "published",
});
const args = process.argv.slice(2);
const manifestPath = args
  .find((arg) => arg.startsWith("--manifest="))
  ?.slice(11);
if (
  !manifestPath ||
  args.some((arg) => arg !== "--apply" && !arg.startsWith("--manifest="))
)
  throw new Error("Use --manifest=path and optional --apply.");
const manifestSchema = z.object({
  reviewedAt: z.iso.datetime({ offset: true }),
  products: z.array(
    z.object({
      productId: z.string(),
      revision: z.string(),
      photoAssetId: z.string(),
      proposedFinish: z.enum(productFinishes).nullable(),
      confidence: z.enum(["high", "medium", "uncertain"]),
      visualEvidence: z.string(),
      needsOwnerReview: z.boolean(),
    }),
  ),
});
async function main() {
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(resolve(manifestPath!), "utf8")),
  );
  const approved = manifest.products.filter(
    (product) =>
      product.proposedFinish &&
      product.confidence === "high" &&
      !product.needsOwnerReview,
  );
  if (new Set(approved.map((row) => row.productId)).size !== approved.length)
    throw new Error("Duplicate product IDs in review.");
  const existing = await client.fetch<Record<string, unknown>[]>(
    '*[_type == "product" && _id in $ids]',
    { ids: approved.map((product) => product.productId) },
  );
  const byId = new Map(existing.map((product) => [product._id, product]));
  let transaction = client.transaction();
  let changed = 0;
  for (const review of approved) {
    const product = byId.get(review.productId);
    const oldPricing = product?.pricing as
      Record<string, unknown> | null | undefined;
    if (
      oldPricing?.finish === review.proposedFinish &&
      oldPricing?.finishPhotoAssetId === review.photoAssetId
    )
      continue;
    if (!product || product._rev !== review.revision)
      throw new Error(
        `${review.productId}: product changed since the photo review. Recheck it before applying.`,
      );
    const images = product.gallery as
      { asset?: { _ref?: string } }[] | undefined;
    if (!images?.some((image) => image.asset?._ref === review.photoAssetId))
      throw new Error(
        `${review.productId}: reviewed photo is no longer attached.`,
      );
    const pricing = {
      ...oldPricing,
      finish: review.proposedFinish,
      finishReviewedAt: manifest.reviewedAt,
      finishPhotoAssetId: review.photoAssetId,
      finishReviewNotes: review.visualEvidence,
    };
    const valid = await validatePricingWrite(client, { ...product, pricing });
    if (valid !== true) throw new Error(`${review.productId}: ${valid}`);
    transaction = transaction.patch(review.productId, (patch) =>
      patch.ifRevisionId(review.revision).set({ pricing }),
    );
    changed++;
  }
  if (args.includes("--apply") && changed)
    await transaction.commit({ visibility: "sync" });
  console.log(
    JSON.stringify(
      {
        applied: args.includes("--apply"),
        changed,
        reviewed: manifest.products.length,
        pendingReview: manifest.products.length - approved.length,
      },
      null,
      2,
    ),
  );
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
