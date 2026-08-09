import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-08-09" });
const applyChanges = process.argv.includes("--apply");
const overwriteExisting = process.argv.includes("--overwrite");
const manifestPath = resolve(
  process.cwd(),
  "scripts/images/mixed-gallery-new-folder-2-2026-08-09.json",
);
const assetMappingPath = resolve(
  process.cwd(),
  "scripts/images/mixed-gallery-new-folder-2-2026-08-09-sanity-assets.json",
);
const displayOrderBase = 5_000;

type ManifestProduct = {
  number: number;
  id: string;
  reference: string;
  title: string;
  slug: string;
  shortDescription: string;
  alt: string;
  categoryId: "category-gifts" | "category-purse" | "category-idols";
  purity: "92.5";
  weightGrams?: number;
  heightInches?: number;
  widthInches?: number;
  diameterInches?: number;
  singhasanWidthInches?: number;
  singhasanDepthInches?: number;
  idolConstruction?: "semi-solid";
  deityIds?: string[];
  publishBlockers: string[];
};

type Manifest = {
  schemaVersion: number;
  batchId: string;
  sourceCount: number;
  readyForSanityAssetUpload: boolean;
  readyForProductPublish: boolean;
  publishBlockers: string[];
  products: ManifestProduct[];
};

type AssetMappingRow = {
  number: number;
  productId: string;
  reference: string;
  sanityAssetId: string;
};

type AssetMapping = {
  schemaVersion: number;
  batchId: string;
  projectId: string;
  dataset: string;
  productCount: number;
  uniqueAssetCount: number;
  assets: AssetMappingRow[];
};

type ExistingProduct = {
  _id: string;
  title: string;
  slug?: string;
  reference?: string;
};

type ExistingReference = {
  _id: string;
};

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

function assertUnique(values: string[], label: string) {
  if (new Set(values).size !== values.length) {
    throw new Error(`${label} values must be unique.`);
  }
}

function validateBatch(manifest: Manifest, mapping: AssetMapping) {
  if (manifest.schemaVersion !== 1 || mapping.schemaVersion !== 1) {
    throw new Error("Unsupported mixed-gallery schema version.");
  }
  if (manifest.batchId !== mapping.batchId) {
    throw new Error("Manifest and asset mapping batch IDs do not match.");
  }
  if (!manifest.readyForSanityAssetUpload || !manifest.readyForProductPublish) {
    throw new Error("The mixed-gallery manifest is not ready for publication.");
  }
  if (manifest.publishBlockers.length > 0) {
    throw new Error("The mixed-gallery manifest still has publish blockers.");
  }
  if (
    manifest.products.length !== 53 ||
    manifest.sourceCount !== 53 ||
    mapping.productCount !== 53 ||
    mapping.uniqueAssetCount !== 53 ||
    mapping.assets.length !== 53
  ) {
    throw new Error("Expected a one-to-one 53-product batch and asset mapping.");
  }

  assertUnique(manifest.products.map(({ id }) => id), "Product ID");
  assertUnique(manifest.products.map(({ slug }) => slug), "Product slug");
  assertUnique(manifest.products.map(({ reference }) => reference), "Product reference");
  assertUnique(mapping.assets.map(({ sanityAssetId }) => sanityAssetId), "Sanity asset ID");

  const mappingByProductId = new Map(
    mapping.assets.map((row) => [row.productId, row]),
  );

  for (const product of manifest.products) {
    if (product.publishBlockers.length > 0) {
      throw new Error(`${product.reference} still has publish blockers.`);
    }
    if (product.purity !== "92.5") {
      throw new Error(`${product.reference} must use 92.5 purity.`);
    }
    if (product.categoryId === "category-idols") {
      if (
        product.idolConstruction !== "semi-solid" ||
        !product.deityIds?.length
      ) {
        throw new Error(
          `${product.reference} must have semi-solid construction and at least one deity.`,
        );
      }
    }

    const mappingRow = mappingByProductId.get(product.id);
    if (
      !mappingRow ||
      mappingRow.number !== product.number ||
      mappingRow.reference !== product.reference
    ) {
      throw new Error(`Missing or mismatched asset mapping for ${product.reference}.`);
    }
  }
}

function getProductDocument(product: ManifestProduct, assetId: string) {
  return {
    _id: product.id,
    _type: "product",
    title: product.title,
    slug: {
      _type: "slug",
      current: product.slug,
    },
    shortDescription: product.shortDescription,
    gallery: [
      {
        _key: `gallery-${product.reference.toLowerCase()}`,
        _type: "image",
        asset: {
          _type: "reference",
          _ref: assetId,
        },
        alt: product.alt,
      },
    ],
    category: {
      _type: "reference",
      _ref: product.categoryId,
    },
    purity: product.purity,
    weightGrams: product.weightGrams,
    heightInches: product.heightInches,
    widthInches: product.widthInches,
    diameterInches: product.diameterInches,
    singhasanWidthInches: product.singhasanWidthInches,
    singhasanDepthInches: product.singhasanDepthInches,
    idolConstruction: product.idolConstruction,
    deities: product.deityIds?.map((deityId) => ({
      _key: deityId.replace(/^deity-/, ""),
      _type: "reference",
      _ref: deityId,
    })),
    collections: [],
    featured: false,
    displayOrder: displayOrderBase + product.number,
    reference: product.reference,
  };
}

async function main() {
  if (overwriteExisting && !applyChanges) {
    throw new Error("--overwrite requires --apply.");
  }

  const [manifest, mapping] = await Promise.all([
    readJson<Manifest>(manifestPath),
    readJson<AssetMapping>(assetMappingPath),
  ]);
  validateBatch(manifest, mapping);

  const { projectId, dataset } = client.config();
  if (projectId !== mapping.projectId || dataset !== mapping.dataset) {
    throw new Error(
      `Sanity target ${projectId}/${dataset} does not match mapping target ${mapping.projectId}/${mapping.dataset}.`,
    );
  }

  const productIds = manifest.products.map(({ id }) => id);
  const draftIds = productIds.map((id) => `drafts.${id}`);
  const slugs = manifest.products.map(({ slug }) => slug);
  const references = manifest.products.map(({ reference }) => reference);
  const categoryIds = [...new Set(manifest.products.map(({ categoryId }) => categoryId))];
  const deityIds = [
    ...new Set(manifest.products.flatMap(({ deityIds: ids }) => ids ?? [])),
  ];
  const assetIds = mapping.assets.map(({ sanityAssetId }) => sanityAssetId);

  const [categories, deities, assets, existingProducts] = await Promise.all([
    client.fetch<ExistingReference[]>(
      `*[_type == "category" && _id in $categoryIds]{_id}`,
      { categoryIds },
    ),
    client.fetch<ExistingReference[]>(
      `*[_type == "deity" && _id in $deityIds]{_id}`,
      { deityIds },
    ),
    client.fetch<ExistingReference[]>(
      `*[_type == "sanity.imageAsset" && _id in $assetIds && metadata.dimensions.width == 1254 && metadata.dimensions.height == 1254]{_id}`,
      { assetIds },
    ),
    client.fetch<ExistingProduct[]>(
      `*[_type == "product" && (_id in $candidateIds || slug.current in $slugs || reference in $references)]{
        _id,
        title,
        "slug": slug.current,
        reference
      }`,
      { candidateIds: [...productIds, ...draftIds], slugs, references },
    ),
  ]);

  const assertAllReferencesExist = (
    expectedIds: string[],
    rows: ExistingReference[],
    label: string,
  ) => {
    const found = new Set(rows.map(({ _id }) => _id));
    const missing = expectedIds.filter((id) => !found.has(id));
    if (missing.length > 0) {
      throw new Error(`Missing ${label}: ${missing.join(", ")}`);
    }
  };

  assertAllReferencesExist(categoryIds, categories, "categories");
  assertAllReferencesExist(deityIds, deities, "deities");
  assertAllReferencesExist(assetIds, assets, "1254x1254 image assets");

  const productById = new Map(manifest.products.map((product) => [product.id, product]));
  const productBySlug = new Map(manifest.products.map((product) => [product.slug, product]));
  const productByReference = new Map(
    manifest.products.map((product) => [product.reference, product]),
  );
  const existingById = new Map<string, ExistingProduct>();

  for (const existing of existingProducts) {
    if (existing._id.startsWith("drafts.")) {
      throw new Error(
        `Draft product conflicts with this batch: ${existing._id}. Resolve it in Studio first.`,
      );
    }

    const expectedById = productById.get(existing._id);
    if (expectedById) {
      existingById.set(existing._id, existing);
      continue;
    }

    const slugConflict = existing.slug
      ? productBySlug.get(existing.slug)
      : undefined;
    const referenceConflict = existing.reference
      ? productByReference.get(existing.reference)
      : undefined;
    const conflict = slugConflict ?? referenceConflict;
    if (conflict) {
      throw new Error(
        `Existing product ${existing._id} conflicts with ${conflict.reference} by slug or reference.`,
      );
    }
  }

  const mappingByProductId = new Map(
    mapping.assets.map((row) => [row.productId, row]),
  );
  const actions = manifest.products.map((product) => {
    const exists = existingById.has(product.id);
    return {
      product,
      action: exists ? (overwriteExisting ? "REPLACE" : "SKIP") : "CREATE",
      assetId: mappingByProductId.get(product.id)!.sanityAssetId,
    } as const;
  });

  console.log(
    `Target: ${projectId}/${dataset}; batch: ${manifest.batchId}; products: ${actions.length}`,
  );
  console.table(
    actions.map(({ product, action }) => ({
      action,
      reference: product.reference,
      title: product.title,
      category: product.categoryId,
    })),
  );

  if (!applyChanges) {
    console.log("Dry run complete. No Sanity documents were written.");
    console.log(
      "Run `npm run sanity:publish-mixed-gallery-products:apply` to publish the CREATE rows.",
    );
    return;
  }

  const mutations = actions.filter(({ action }) => action !== "SKIP");
  if (mutations.length === 0) {
    console.log("All batch products already exist; no mutations were required.");
    return;
  }

  let transaction = client.transaction();
  for (const { product, action, assetId } of mutations) {
    const document = getProductDocument(product, assetId);
    transaction =
      action === "REPLACE"
        ? transaction.createOrReplace(document)
        : transaction.create(document);
  }

  await transaction.commit({ visibility: "sync" });
  console.log(
    `Published ${mutations.filter(({ action }) => action === "CREATE").length} new products and replaced ${mutations.filter(({ action }) => action === "REPLACE").length}.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
