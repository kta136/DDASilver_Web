import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-28" });
const applyChanges = process.argv.includes("--apply");
const spoonProductIds = [
  "product-dda-utensil-33-ornate-floral-mini-silver-spoon",
  "product-dda-utensil-34-beaded-scroll-mini-silver-spoon",
  "product-dda-utensil-35-linear-scroll-silver-spoon",
  "product-dda-utensil-36-classic-scroll-silver-spoon",
  "product-dda-utensil-37-floral-engraved-silver-spoon",
  "product-dda-utensil-38-smooth-rounded-handle-silver-spoon",
  "product-dda-utensil-39-broad-tapered-handle-silver-spoon",
  "product-dda-utensil-40-classic-rounded-handle-silver-spoon",
  "product-dda-utensil-41-wide-serving-silver-spoon",
] as const;
const targetPurity = "92.5";
const localJsonPaths = [
  "public/images/silver-utensils/spoon-gallery-2026-08-05/sanity-utensil-manifest.json",
  "public/images/silver-utensils/spoon-gallery-2026-08-05/sanity-utensil-batch-manifest.json",
  "public/images/gallery-ingestion/new-folder-2-2026-08-05/sanity-gallery-manifest.json",
] as const;
const localCsvPaths = [
  "public/images/silver-utensils/spoon-gallery-2026-08-05/sanity-utensil-review.csv",
  "public/images/gallery-ingestion/new-folder-2-2026-08-05/gallery-review.csv",
] as const;

type SpoonDocument = {
  _id: string;
  _rev: string;
  title: string;
  shortDescription: string;
  purity: string;
  reference?: string;
};

function updateDescription(description: string) {
  return description.replaceAll("99.80%", "92.5%");
}

type LocalProduct = {
  id?: string;
  purity?: string;
  description?: string;
  shortDescription?: string;
};

type LocalManifest = {
  purity?: string;
  products?: LocalProduct[];
};

async function syncLocalMetadata() {
  const productIds = new Set<string>(spoonProductIds);
  for (const path of localJsonPaths) {
    const absolutePath = resolve(process.cwd(), path);
    const manifest = JSON.parse(await readFile(absolutePath, "utf8")) as LocalManifest;
    let updatedProducts = 0;
    for (const product of manifest.products ?? []) {
      if (!product.id || !productIds.has(product.id)) continue;
      product.purity = targetPurity;
      if (product.description) {
        product.description = updateDescription(product.description);
      }
      if (product.shortDescription) {
        product.shortDescription = updateDescription(product.shortDescription);
      }
      updatedProducts += 1;
    }
    if (updatedProducts !== spoonProductIds.length) {
      throw new Error(
        `Expected ${spoonProductIds.length} spoon products in ${path}; found ${updatedProducts}.`,
      );
    }
    if (path.includes("gallery-ingestion")) delete manifest.purity;
    await writeFile(absolutePath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  for (const path of localCsvPaths) {
    const absolutePath = resolve(process.cwd(), path);
    const original = await readFile(absolutePath, "utf8");
    let updatedRows = 0;
    const updated = original
      .split(/\r?\n/)
      .map((line) => {
        if (!spoonProductIds.some((id) => line.includes(id))) return line;
        updatedRows += 1;
        return line
          .replace('"99.80"', '"92.5"')
          .replaceAll("99.80%", "92.5%");
      })
      .join("\n");
    if (updatedRows !== spoonProductIds.length) {
      throw new Error(
        `Expected ${spoonProductIds.length} spoon rows in ${path}; found ${updatedRows}.`,
      );
    }
    await writeFile(absolutePath, updated);
  }
  console.log("Updated the generated spoon manifests and review CSV files.");
}

async function assertConfiguredTarget() {
  const { projectId, dataset } = client.config();
  if (
    process.env.SANITY_EXPECTED_PROJECT_ID &&
    process.env.SANITY_EXPECTED_PROJECT_ID !== projectId
  ) {
    throw new Error("Sanity project does not match SANITY_EXPECTED_PROJECT_ID");
  }
  if (
    process.env.SANITY_EXPECTED_DATASET &&
    process.env.SANITY_EXPECTED_DATASET !== dataset
  ) {
    throw new Error("Sanity dataset does not match SANITY_EXPECTED_DATASET");
  }
  return { projectId, dataset };
}

async function fetchSpoons() {
  return client.fetch<SpoonDocument[]>(
    `*[_type == "product" && _id in $productIds]{
      _id,
      _rev,
      title,
      shortDescription,
      purity,
      reference
    } | order(_id asc)`,
    { productIds: [...spoonProductIds] },
  );
}

function assertCompleteBatch(documents: SpoonDocument[]) {
  const foundIds = new Set(documents.map((document) => document._id));
  const missingIds = spoonProductIds.filter((id) => !foundIds.has(id));
  if (missingIds.length > 0) {
    throw new Error(`Uploaded spoon products not found: ${missingIds.join(", ")}`);
  }
}

async function main() {
  const target = await assertConfiguredTarget();
  const documents = await fetchSpoons();
  assertCompleteBatch(documents);

  const changes = documents
    .map((document) => ({
      document,
      shortDescription: updateDescription(document.shortDescription),
    }))
    .filter(
      ({ document, shortDescription }) =>
        document.purity !== targetPurity ||
        document.shortDescription !== shortDescription,
    );

  console.log(`Target: ${target.projectId}/${target.dataset}`);
  console.log(`Uploaded spoon documents: ${documents.length}`);
  for (const { document } of changes) {
    console.log(
      `${applyChanges ? "UPDATE" : "WOULD UPDATE"} ${document.reference ?? document._id}: ${document.purity} -> ${targetPurity}`,
    );
  }

  if (!applyChanges) {
    console.log("Dry run only. Add --apply to write the changes.");
    return;
  }

  for (const { document, shortDescription } of changes) {
    await client
      .patch(document._id)
      .ifRevisionId(document._rev)
      .set({ purity: targetPurity, shortDescription })
      .commit();
  }

  const verifiedDocuments = await fetchSpoons();
  const invalidDocuments = verifiedDocuments.filter(
    (document) =>
      document.purity !== targetPurity ||
      document.shortDescription.includes("99.80%"),
  );
  if (invalidDocuments.length > 0) {
    throw new Error(
      `Verification failed for: ${invalidDocuments.map((document) => document._id).join(", ")}`,
    );
  }
  console.log(`Verified ${verifiedDocuments.length} spoon documents at 92.5% purity.`);
  await syncLocalMetadata();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
