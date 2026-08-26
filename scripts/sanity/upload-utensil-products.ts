import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { getCliClient } from "sanity/cli";
import { assertProductDocument } from "../../src/lib/catalog-domain";

const client = getCliClient({ apiVersion: "2026-07-28" });
const applyChanges =
  process.argv.includes("--apply") || process.env.SANITY_GALLERY_APPLY === "1";
const overwriteExisting =
  process.argv.includes("--overwrite") ||
  process.env.SANITY_GALLERY_OVERWRITE === "1";
const manifestArgument = process.argv.find((argument) =>
  argument.startsWith("--manifest="),
);
const manifestPath = resolve(
  process.cwd(),
  manifestArgument?.slice("--manifest=".length) ??
    process.env.SANITY_GALLERY_MANIFEST ??
    "public/images/silver-utensils/ai-gallery-2026-08-02/sanity-utensil-manifest.json",
);
const assetUploadConcurrency = 3;

type UtensilProduct = {
  number: number;
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  alt: string;
  utensilType:
    | "tumbler"
    | "glass"
    | "bowl"
    | "plate"
    | "jug"
    | "kalash"
    | "bottle"
    | "spoon"
    | "figurine";
  purity: "92.5" | "99.80";
  weightGrams: number;
  heightInches?: number;
  widthInches?: number;
  diameterInches?: number;
  imagePath: string;
  reference?: string;
};

type UtensilManifest = {
  schemaVersion: number;
  batchId: string;
  categoryId: "category-utensils" | "category-gifts";
  readyForSanityAssetUpload: boolean;
  readyForProductPublish: boolean;
  publishBlockers: string[];
  products: UtensilProduct[];
};

type ExistingDocument = {
  _id: string;
  title: string;
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

async function loadManifest() {
  const payload = JSON.parse(await readFile(manifestPath, "utf8")) as unknown;
  if (!payload || typeof payload !== "object") {
    throw new Error("Utensil manifest must be a JSON object.");
  }
  return payload as UtensilManifest;
}

function validateManifest(manifest: UtensilManifest) {
  if (manifest.schemaVersion !== 1) {
    throw new Error(`Unsupported manifest schema: ${manifest.schemaVersion}`);
  }
  if (!["category-utensils", "category-gifts"].includes(manifest.categoryId)) {
    throw new Error(`Unexpected gallery category: ${manifest.categoryId}`);
  }
  if (!manifest.readyForSanityAssetUpload || !manifest.readyForProductPublish) {
    throw new Error("Utensil manifest is not marked ready for upload and publishing.");
  }
  if (manifest.publishBlockers.length > 0) {
    throw new Error(
      `Utensil manifest has publish blockers: ${manifest.publishBlockers.join(", ")}`,
    );
  }
  if (manifest.products.length === 0) {
    throw new Error("Gallery manifest must contain at least one product.");
  }

  const ids = new Set<string>();
  const slugs = new Set<string>();
  const descriptions = new Set<string>();
  for (const product of manifest.products) {
    if (!Number.isInteger(product.number) || product.number < 1) {
      throw new Error(`Invalid utensil number: ${product.number}`);
    }
    const expectedPurity = ["spoon", "bottle"].includes(product.utensilType)
      ? "92.5"
      : "99.80";
    if (product.purity !== expectedPurity) {
      throw new Error(
        `${product.title} must use confirmed ${expectedPurity}% purity.`,
      );
    }
    if (!Number.isFinite(product.weightGrams) || product.weightGrams <= 0) {
      throw new Error(`${product.title} has an invalid weight.`);
    }
    const allowedTypes =
      manifest.categoryId === "category-utensils"
        ? ["tumbler", "glass", "bowl", "plate", "jug", "kalash", "bottle", "spoon"]
        : ["figurine"];
    if (!allowedTypes.includes(product.utensilType)) {
      throw new Error(
        `${product.title} has invalid type ${product.utensilType} for ${manifest.categoryId}.`,
      );
    }
    if (
      ["tumbler", "glass", "jug", "kalash", "bottle", "spoon", "figurine"].includes(
        product.utensilType,
      ) &&
      (!Number.isFinite(product.heightInches) || product.heightInches! <= 0)
    ) {
      throw new Error(`${product.title} requires a verified height.`);
    }
    if (
      ["bowl", "plate"].includes(product.utensilType) &&
      (!Number.isFinite(product.diameterInches) || product.diameterInches! <= 0)
    ) {
      throw new Error(`${product.title} requires a verified diameter.`);
    }
    if (
      [product.heightInches, product.widthInches, product.diameterInches].some(
        (value) => value !== undefined && (!Number.isFinite(value) || value <= 0),
      )
    ) {
      throw new Error(`${product.title} has an invalid physical dimension.`);
    }
    if (product.title.length < 2 || product.title.length > 100) {
      throw new Error(`${product.title} has an invalid title length.`);
    }
    if (product.shortDescription.length < 20 || product.shortDescription.length > 240) {
      throw new Error(`${product.title} has an invalid description length.`);
    }
    if (product.alt.length < 12 || product.alt.length > 180) {
      throw new Error(`${product.title} has invalid alt text.`);
    }
    if (product.reference && product.reference.length > 60) {
      throw new Error(`${product.title} has an invalid reference.`);
    }
    if (ids.has(product.id) || slugs.has(product.slug)) {
      throw new Error(`${product.title} duplicates an ID or slug.`);
    }
    if (descriptions.has(product.shortDescription)) {
      throw new Error(`${product.title} duplicates another description.`);
    }
    ids.add(product.id);
    slugs.add(product.slug);
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

async function validateInputs(manifest: UtensilManifest) {
  const productIds = manifest.products.map((product) => product.id);
  const slugs = manifest.products.map((product) => product.slug);
  const [category, conflicts] = await Promise.all([
    client.fetch<{ _id: string; title: string } | null>(
      `*[_id == $categoryId && _type == "category"][0]{_id, title}`,
      { categoryId: manifest.categoryId },
    ),
    client.fetch<ExistingDocument[]>(
      `*[_type == "product" && slug.current in $slugs && !(_id in $productIds)]{_id, title}`,
      { productIds, slugs },
    ),
  ]);

  if (!category) {
    throw new Error(
      `Required category "${manifest.categoryId}" was not found in the configured dataset.`,
    );
  }
  if (conflicts.length > 0) {
    throw new Error(
      `Gallery slugs conflict with existing products: ${conflicts
        .map((document) => `${document.title} (${document._id})`)
        .join(", ")}`,
    );
  }
  for (const product of manifest.products) {
    const absolutePath = resolve(process.cwd(), product.imagePath);
    const fileStats = await stat(absolutePath);
    if (!fileStats.isFile()) {
      throw new Error(`Gallery image path is not a file: ${absolutePath}`);
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
    `*[_type == "sanity.imageAsset" && sha1hash == $sha1hash][0]{_id, originalFilename}`,
    { sha1hash },
  );
}

async function getOrUploadImage(
  filePath: string,
  product: UtensilProduct,
  summary: Summary,
) {
  const existingAsset = await findExistingAsset(filePath);
  if (existingAsset) {
    summary.reusedAssets += 1;
    console.log(`  Reusing image ${existingAsset.originalFilename ?? existingAsset._id}`);
    return existingAsset._id;
  }
  const asset = await client.assets.upload("image", createReadStream(filePath), {
    filename: basename(filePath),
    title: `${product.title} catalog image`,
  });
  summary.uploadedAssets += 1;
  console.log(`  Uploaded image ${asset._id}`);
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
      const index = nextIndex++;
      if (index >= items.length) return;
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
    `*[_id in $productIds]{_id, title}`,
    { productIds: manifest.products.map((product) => product.id) },
  );
  const existingById = new Map(
    existingDocuments.map((document) => [document._id, document]),
  );

  console.log(`Target: ${projectId}/${dataset}`);
  console.log(`Manifest: ${manifestPath}`);
  if (!applyChanges) {
    console.log("\nDry run only. No assets or product documents will be written.");
    console.log("Re-run this manifest with --apply after review to upload and publish.\n");
    for (const product of manifest.products) {
      const imagePath = resolve(process.cwd(), product.imagePath);
      const existingAsset = await findExistingAsset(imagePath);
      const action = existingById.has(product.id) ? "SKIP" : "CREATE";
      const dimension =
        ["bowl", "plate"].includes(product.utensilType)
          ? `${product.diameterInches} in diameter`
          : `${product.heightInches} in high`;
      console.log(
        `${action} ${product.title}; ${product.weightGrams} g; ${dimension}; image ${
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
      console.log(`Skipped ${product.title}; use --overwrite to replace it.`);
      return false;
    }
    return true;
  });
  const documents = await mapWithConcurrency(
    uploadProducts,
    assetUploadConcurrency,
    async (product) => {
      const imagePath = resolve(process.cwd(), product.imagePath);
      const assetId = await getOrUploadImage(imagePath, product, summary);
      const canonicalUtensilType =
        product.utensilType === "tumbler" ? "glass" : product.utensilType;
      return {
        _id: product.id,
        _type: "product" as const,
        title: product.title,
        slug: { _type: "slug" as const, current: product.slug },
        shortDescription: product.shortDescription,
        gallery: [
          {
            _key: `catalog-${String(product.number).padStart(2, "0")}-primary`,
            _type: "image" as const,
            asset: { _type: "reference" as const, _ref: assetId },
            alt: product.alt,
          },
        ],
        category: { _type: "reference" as const, _ref: manifest.categoryId },
        ...(manifest.categoryId === "category-utensils"
          ? { utensilType: canonicalUtensilType }
          : {}),
        purity: product.purity,
        weightGrams: product.weightGrams,
        ...(product.heightInches ? { heightInches: product.heightInches } : {}),
        ...(product.widthInches ? { widthInches: product.widthInches } : {}),
        ...(product.diameterInches
          ? { diameterInches: product.diameterInches }
          : {}),
        ...(product.reference ? { reference: product.reference } : {}),
        featured: false,
        displayOrder: 4000 + product.number * 10,
      };
    },
  );

  if (documents.length > 0) {
    let transaction = client.transaction();
    for (const document of documents) {
      assertProductDocument(document, document.utensilType ? "utensil" : "general");
      transaction = transaction.createOrReplace(document);
    }
    await transaction.commit();
  }
  for (const product of uploadProducts) {
    if (existingById.has(product.id)) summary.replacedProducts += 1;
    else summary.createdProducts += 1;
  }
  console.log("\nUpload complete.");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
