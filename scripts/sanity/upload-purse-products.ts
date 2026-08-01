import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-28" });
const applyChanges = process.argv.includes("--apply");
const overwriteExisting = process.argv.includes("--overwrite");
const manifestPath = resolve(
  process.cwd(),
  "public/images/silver-purses/ai-cleaned-2026-08-01/sanity-purse-manifest.json",
);
const expectedProductCount = 17;
const assetUploadConcurrency = 3;

type PurseProduct = {
  number: number;
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  alt: string;
  weightGrams: number;
  imagePath: string;
  reference: string;
  referenceStatus: "confirmed";
  purity: "92.5";
};

type PurseManifest = {
  schemaVersion: number;
  batchId: string;
  categoryId: "category-purse";
  readyForSanityAssetUpload: boolean;
  readyForProductPublish: boolean;
  publishBlockers: string[];
  products: PurseProduct[];
};

type ExistingDocument = {
  _id: string;
  title: string;
  reference?: string;
};

type ExistingAsset = {
  _id: string;
  originalFilename?: string;
};

type Summary = {
  uploadedAssets: number;
  reusedAssets: number;
  createdProducts: number;
  replacedProducts: number;
  skippedProducts: number;
};

function getItemName(product: PurseProduct) {
  return `${product.reference} — ${product.title}`;
}

function getGalleryKey(product: PurseProduct) {
  return `purse-${String(product.number).padStart(2, "0")}-primary`;
}

async function loadManifest() {
  const payload = JSON.parse(await readFile(manifestPath, "utf8")) as unknown;

  if (!payload || typeof payload !== "object") {
    throw new Error("Purse manifest must be a JSON object.");
  }

  return payload as PurseManifest;
}

function validateManifest(manifest: PurseManifest) {
  if (manifest.schemaVersion !== 1) {
    throw new Error(`Unsupported manifest schema: ${manifest.schemaVersion}`);
  }
  if (manifest.categoryId !== "category-purse") {
    throw new Error(`Unexpected purse category: ${manifest.categoryId}`);
  }
  if (!manifest.readyForSanityAssetUpload || !manifest.readyForProductPublish) {
    throw new Error("Purse manifest is not marked ready for upload and publishing.");
  }
  if (manifest.publishBlockers.length > 0) {
    throw new Error(
      `Purse manifest still has publish blockers: ${manifest.publishBlockers.join(", ")}`,
    );
  }
  if (manifest.products.length !== expectedProductCount) {
    throw new Error(
      `Expected ${expectedProductCount} purse products, received ${manifest.products.length}.`,
    );
  }

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const references = new Set<string>();
  const descriptions = new Set<string>();

  for (const product of manifest.products) {
    const itemName = getItemName(product);

    if (!Number.isInteger(product.number) || product.number < 1) {
      throw new Error(`Invalid purse number: ${product.number}`);
    }
    if (product.reference !== `PR-${product.number}`) {
      throw new Error(
        `Purse ${product.number} must use reference PR-${product.number}; received ${product.reference}.`,
      );
    }
    if (product.referenceStatus !== "confirmed") {
      throw new Error(`Purse reference is not confirmed: ${product.reference}`);
    }
    if (product.purity !== "92.5") {
      throw new Error(`Purse purity must be 92.5%: ${product.reference}`);
    }
    if (!Number.isFinite(product.weightGrams) || product.weightGrams <= 0) {
      throw new Error(`Invalid purse weight: ${product.reference}`);
    }
    if (ids.has(product.id)) {
      throw new Error(`Duplicate purse product ID: ${product.id}`);
    }
    if (slugs.has(product.slug)) {
      throw new Error(`Duplicate purse slug: ${product.slug}`);
    }
    if (references.has(product.reference)) {
      throw new Error(`Duplicate purse reference: ${product.reference}`);
    }
    if (descriptions.has(product.shortDescription)) {
      throw new Error(`Duplicate purse description: ${product.reference}`);
    }
    if (itemName.length > 100) {
      throw new Error(`Purse item name exceeds 100 characters: ${itemName}`);
    }
    if (
      product.shortDescription.length < 20 ||
      product.shortDescription.length > 240
    ) {
      throw new Error(`Purse description is invalid: ${product.reference}`);
    }
    if (product.alt.length < 12 || product.alt.length > 180) {
      throw new Error(`Purse image alt text is invalid: ${product.reference}`);
    }

    ids.add(product.id);
    slugs.add(product.slug);
    references.add(product.reference);
    descriptions.add(product.shortDescription);
  }
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

async function validateInputs(manifest: PurseManifest) {
  const productIds = manifest.products.map((product) => product.id);
  const slugs = manifest.products.map((product) => product.slug);
  const references = manifest.products.map((product) => product.reference);
  const [category, conflicts] = await Promise.all([
    client.fetch<{ _id: string; title: string } | null>(
      `*[_id == $categoryId && _type == "category"][0]{_id, title}`,
      { categoryId: manifest.categoryId },
    ),
    client.fetch<ExistingDocument[]>(
      `*[
        _type == "product" &&
        (slug.current in $slugs || reference in $references) &&
        !(_id in $productIds)
      ]{_id, title, reference}`,
      { productIds, slugs, references },
    ),
  ]);

  if (!category) {
    throw new Error(
      `Required category "${manifest.categoryId}" was not found in the configured dataset.`,
    );
  }
  if (conflicts.length > 0) {
    throw new Error(
      `Purse slugs or references conflict with existing products: ${conflicts
        .map(
          (document) =>
            `${document.title} (${document.reference ?? document._id})`,
        )
        .join(", ")}`,
    );
  }

  for (const product of manifest.products) {
    const absolutePath = resolve(process.cwd(), product.imagePath);
    const fileStats = await stat(absolutePath);

    if (!fileStats.isFile()) {
      throw new Error(`Purse image path is not a file: ${absolutePath}`);
    }
  }

  console.log(`Using category ${category.title} (${category._id})`);
}

async function getFileSha1(filePath: string) {
  const contents = await readFile(filePath);
  return createHash("sha1").update(contents).digest("hex");
}

async function findExistingAsset(filePath: string) {
  const sha1hash = await getFileSha1(filePath);

  return client.fetch<ExistingAsset | null>(
    `*[_type == "sanity.imageAsset" && sha1hash == $sha1hash][0]{
      _id,
      originalFilename
    }`,
    { sha1hash },
  );
}

async function getOrUploadImage(
  filePath: string,
  title: string,
  summary: Summary,
) {
  const existingAsset = await findExistingAsset(filePath);

  if (existingAsset) {
    summary.reusedAssets += 1;
    console.log(
      `  Reusing image asset ${existingAsset._id} (${existingAsset.originalFilename ?? basename(filePath)})`,
    );
    return existingAsset._id;
  }

  const asset = await client.assets.upload("image", createReadStream(filePath), {
    filename: basename(filePath),
    title,
  });

  summary.uploadedAssets += 1;
  console.log(`  Uploaded image asset ${asset._id}`);
  return asset._id;
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  operation: (item: T, index: number) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= items.length) {
        return;
      }
      results[index] = await operation(items[index], index);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

async function main() {
  const manifest = await loadManifest();
  validateManifest(manifest);
  const { projectId, dataset } = await assertConfiguredTarget();
  await validateInputs(manifest);

  const existingDocuments = await client.fetch<ExistingDocument[]>(
    `*[_id in $productIds]{_id, title, reference}`,
    { productIds: manifest.products.map((product) => product.id) },
  );
  const existingById = new Map(
    existingDocuments.map((document) => [document._id, document]),
  );

  console.log(`Target: ${projectId}/${dataset}`);
  console.log(`Manifest: ${manifestPath}`);

  if (!applyChanges) {
    console.log("\nDry run only. No assets or documents will be written.");
    console.log("Run `npm run sanity:upload-purses:apply` to upload and publish.");
    console.log(
      "Run `npm run sanity:upload-purses:overwrite` only when existing purse products should be replaced.\n",
    );

    for (const product of manifest.products) {
      const absolutePath = resolve(process.cwd(), product.imagePath);
      const existingAsset = await findExistingAsset(absolutePath);
      const existingProduct = existingById.get(product.id);
      const action = existingProduct
        ? overwriteExisting
          ? "REPLACE"
          : "SKIP"
        : "CREATE";

      console.log(
        `${action} ${product.reference}: ${getItemName(product)}; ${product.weightGrams} g; 92.5% purity; image ${
          existingAsset ? "already uploaded" : "would be uploaded"
        }`,
      );
    }
    return;
  }

  const summary: Summary = {
    uploadedAssets: 0,
    reusedAssets: 0,
    createdProducts: 0,
    replacedProducts: 0,
    skippedProducts: 0,
  };
  const uploadProducts = manifest.products.filter((product) => {
    if (existingById.has(product.id) && !overwriteExisting) {
      summary.skippedProducts += 1;
      console.log(
        `Skipped ${getItemName(product)} (${product.id}); use --overwrite to replace it.`,
      );
      return false;
    }
    return true;
  });

  const documents = await mapWithConcurrency(
    uploadProducts,
    assetUploadConcurrency,
    async (product) => {
      const itemName = getItemName(product);
      const absolutePath = resolve(process.cwd(), product.imagePath);
      const assetId = await getOrUploadImage(
        absolutePath,
        `${itemName} catalog image`,
        summary,
      );

      return {
        _id: product.id,
        _type: "product" as const,
        title: itemName,
        slug: {
          _type: "slug" as const,
          current: product.slug,
        },
        shortDescription: product.shortDescription,
        gallery: [
          {
            _key: getGalleryKey(product),
            _type: "image" as const,
            asset: {
              _type: "reference" as const,
              _ref: assetId,
            },
            alt: product.alt,
          },
        ],
        category: {
          _type: "reference" as const,
          _ref: manifest.categoryId,
        },
        purity: product.purity,
        weightGrams: product.weightGrams,
        featured: false,
        displayOrder: 2000 + product.number * 10,
        reference: product.reference,
      };
    },
  );

  if (documents.length > 0) {
    let transaction = client.transaction();
    for (const document of documents) {
      transaction = transaction.createOrReplace(document);
    }
    await transaction.commit();
  }

  for (const product of uploadProducts) {
    if (existingById.has(product.id)) {
      summary.replacedProducts += 1;
      console.log(`Replaced ${getItemName(product)} (${product.id})`);
    } else {
      summary.createdProducts += 1;
      console.log(`Created ${getItemName(product)} (${product.id})`);
    }
  }

  console.log("\nUpload complete.");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
