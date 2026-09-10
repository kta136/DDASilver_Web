import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { getCliClient } from "sanity/cli";
import { pricingIssues } from "../../src/lib/pricing/model";
import { auditPricingCoverage, decodePricingProduct } from "../../src/lib/pricing/sanity-validation";
import { productPricingSchema } from "../../src/lib/pricing/validation";

// Owner-authorized, dated Box rate sheet. Dry run unless --apply is supplied.
const path = "docs/gallery-box-making-2026-09-10.json";
const client = getCliClient({ apiVersion: "2026-08-01" }).withConfig({
  useCdn: false,
  perspective: "published",
});
const args = process.argv.slice(2);
assert(args.every((arg) => arg === "--apply"), "Use optional --apply only.");

async function main() {
  const manifest = JSON.parse(await readFile(path, "utf8"));
  assert.equal(manifest.categoryId, "category-boxes");
  assert.equal(manifest.unit, "INR_PER_GRAM");
  assert.equal(manifest.products.length, 30);
  assert.equal(new Set(manifest.products.map((row: { productId: string }) => row.productId)).size, 30);
  const category = await client.fetch('*[_id == "category-boxes"][0]');
  const products = await client.fetch('*[_type == "product" && category._ref == "category-boxes"]');
  assert.equal(products.length, 30, "Category membership changed; recheck coverage.");
  const byId = new Map<string, Record<string, unknown>>(products.map((product: Record<string, unknown>) => [product._id, product]));
  let transaction = client.transaction();
  let changed = 0;
  for (const row of manifest.products) {
    const product = byId.get(row.productId);
    assert(product, `Missing ${row.productId}`);
    assert.equal(product.reference, row.catalogueReference);
    assert.equal(product.weightGrams ?? null, row.weightGrams);
    assert.deepEqual(product.sizeVariants ?? null, row.sizeVariants);
    assert([10, 15, 35].includes(row.makingChargePerGram));
    const previous = (product.pricing ?? {}) as Record<string, unknown>;
    assert(previous.mode !== "manual", `Manual pricing needs review: ${row.catalogueReference}`);
    assert(previous.makingChargePerPiece == null, `Per-piece charge needs review: ${row.catalogueReference}`);
    const pricing = { ...previous, mode: "automatic", makingChargePerGram: row.makingChargePerGram };
    productPricingSchema.parse(pricing);
    const issues = pricingIssues(decodePricingProduct({
      ...product, pricing,
      categoryPricingDeferred: false,
      categoryKind: category.productKind,
      categorySlug: category.slug.current,
      categoryMakingChargePerGram: category.makingChargePerGram,
      categoryMakingChargePerPiece: category.makingChargePerPiece,
      categoryMakingRules: category.makingRules,
    }));
    assert.deepEqual(issues, [], `${row.catalogueReference}: ${issues.join(" ")}`);
    if (previous.mode === "automatic" && previous.makingChargePerGram === row.makingChargePerGram) continue;
    assert.equal(product._rev, row.revision, `${row.catalogueReference} changed since review`);
    transaction = transaction.patch(row.productId, (patch) => patch.ifRevisionId(row.revision).set({ pricing }));
    changed++;
  }
  if (category.pricingDeferred !== false) {
    assert.equal(category._rev, manifest.categorySnapshot._rev, "Category changed since review");
    transaction = transaction.patch(category._id, (patch) => patch.ifRevisionId(category._rev).set({ pricingDeferred: false }));
    changed++;
  }
  console.log(JSON.stringify({ apply: args.includes("--apply"), validatedProducts: 30, documentChanges: changed }));
  if (!args.includes("--apply")) return;
  if (changed) await transaction.commit({ visibility: "sync" });
  const saved = await client.fetch('*[_type == "product" && category._ref == "category-boxes"]{_id,_rev,reference,pricing}');
  const savedCategory = await client.fetch('*[_id == "category-boxes"][0]');
  assert.equal(savedCategory.pricingDeferred, false);
  assert.equal(saved.length, 30);
  for (const row of manifest.products) {
    const product = saved.find((item: { _id: string }) => item._id === row.productId);
    assert.equal(product?.reference, row.catalogueReference);
    assert.equal(product?.pricing?.makingChargePerGram, row.makingChargePerGram);
    assert.equal(product?.pricing?.mode, "automatic");
    row.status = "applied";
    row.appliedRevision = product._rev;
  }
  manifest.status = "applied";
  manifest.appliedAt = new Date().toISOString();
  manifest.appliedCategoryRevision = savedCategory._rev;
  await writeFile(path, JSON.stringify(manifest, null, 2) + "\n");
  const audit = await auditPricingCoverage(client);
  console.log(JSON.stringify({ applied: true, verifiedProducts: saved.length, audit }, null, 2));
  assert.equal(audit.failures.length, 0, "Pricing coverage failed after application");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
