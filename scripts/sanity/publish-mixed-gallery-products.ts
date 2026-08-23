import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-08-09" });
const projectRoot = resolve(import.meta.dirname, "../..");
const applyChanges =
  process.argv.includes("--apply") ||
  process.env.SANITY_MIXED_GALLERY_PUBLISH_APPLY === "1";
const overwriteExisting =
  process.argv.includes("--overwrite") ||
  process.env.SANITY_MIXED_GALLERY_PUBLISH_OVERWRITE === "1";

function getArgumentValue(name: string) {
  const inline = process.argv.find((argument) =>
    argument.startsWith(`${name}=`),
  );
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function resolveInputPath(value: string | undefined, fallback: string) {
  return value ? resolve(projectRoot, value) : fallback;
}

const manifestPath = resolveInputPath(
  getArgumentValue("--manifest") ??
    process.env.SANITY_MIXED_GALLERY_MANIFEST,
  resolve(projectRoot, "scripts/images/mixed-gallery-new-folder-2-2026-08-09.json"),
);
const assetMappingPath = resolveInputPath(
  getArgumentValue("--mapping") ??
    process.env.SANITY_MIXED_GALLERY_MAPPING,
  resolve(
    projectRoot,
    "scripts/images/mixed-gallery-new-folder-2-2026-08-09-sanity-assets.json",
  ),
);
const displayOrderBase = Number(getArgumentValue("--display-order-base") ?? 5_000);
const supportedCategories = new Set([
  "category-coin",
  "category-gold",
  "category-gifts",
  "category-jhula",
  "category-purse",
  "category-idols",
  "category-utensils",
]);
const supportedCoinShapes = new Set([
  "round",
  "oval",
  "square",
  "rectangle",
  "scalloped",
]);

type ManifestProduct = {
  number: number;
  originalNumber?: number;
  id: string;
  reference: string;
  title: string;
  slug: string;
  shortDescription: string;
  alt: string;
  categoryId:
    | "category-coin"
    | "category-gold"
    | "category-gifts"
    | "category-jhula"
    | "category-purse"
    | "category-idols"
    | "category-utensils";
  utensilType?:
    | "glass"
    | "bowl"
    | "plate"
    | "jug"
    | "kalash"
    | "bottle"
    | "spoon"
    | "pooja-thali-set";
  material?: "silver" | "gold";
  purity: "91.60" | "92.5" | "99.50" | "99.80";
  coinShape?: "round" | "oval" | "square" | "rectangle" | "scalloped";
  weightGrams?: number;
  heightInches?: number;
  widthInches?: number;
  depthInches?: number;
  diameterInches?: number;
  singhasanWidthInches?: number;
  singhasanDepthInches?: number;
  sizeVariants?: Array<{
    weightGrams: number;
    diameterInches: number;
  }>;
  idolConstruction?: "semi-solid";
  deityIds?: string[];
  publishBlockers: string[];
  recordType?: "alternateGalleryImage";
  createProduct?: boolean;
  parentProductId?: string;
  parentReference?: string;
  updateParentMetadata?: boolean;
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
  _rev: string;
  title: string;
  slug?: string;
  reference?: string;
  gallery?: Array<{
    _key: string;
    alt?: string;
    assetId?: string;
  }>;
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
  const sourceRecordCount = manifest.products.length;
  const productRecords = manifest.products.filter(
    (product) => product.createProduct !== false,
  );
  if (sourceRecordCount === 0 || manifest.sourceCount !== sourceRecordCount) {
    throw new Error("Expected one manifest record for every source image.");
  }
  if (
    mapping.productCount !== mapping.assets.length ||
    mapping.uniqueAssetCount !== mapping.assets.length ||
    mapping.assets.length !== sourceRecordCount
  ) {
    throw new Error("Asset mapping must contain one unique asset for every source record.");
  }

  assertUnique(manifest.products.map(({ id }) => id), "Manifest record ID");
  assertUnique(productRecords.map(({ slug }) => slug), "Product slug");
  assertUnique(manifest.products.map(({ reference }) => reference), "Product reference");
  assertUnique(mapping.assets.map(({ sanityAssetId }) => sanityAssetId), "Sanity asset ID");

  const mappingByProductId = new Map(
    mapping.assets.map((row) => [row.productId, row]),
  );

  for (const product of manifest.products) {
    if (product.publishBlockers.length > 0) {
      throw new Error(`${product.reference} still has publish blockers.`);
    }
    if (!supportedCategories.has(product.categoryId)) {
      throw new Error(`${product.reference} has an unsupported category.`);
    }
    if (
      product.purity !== "91.60" &&
      product.purity !== "92.5" &&
      product.purity !== "99.50" &&
      product.purity !== "99.80"
    ) {
      throw new Error(`${product.reference} has an unsupported purity.`);
    }
    const material = product.material ?? "silver";
    if (product.categoryId === "category-gold" && material !== "gold") {
      throw new Error(`${product.reference} must use gold material.`);
    }
    if (product.categoryId !== "category-gold" && material === "gold") {
      throw new Error(`${product.reference} cannot use gold material outside the Gold category.`);
    }
    if (product.recordType === "alternateGalleryImage") {
      if (
        product.createProduct !== false ||
        !product.parentProductId ||
        !product.parentReference
      ) {
        throw new Error(
          `${product.reference} must identify its parent product and disable product creation.`,
        );
      }
    } else if (product.createProduct === false) {
      throw new Error(
        `${product.reference} disables product creation without being an alternate gallery image.`,
      );
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
    if (
      product.categoryId === "category-jhula" &&
      !/^JH-[0-9]{2}$/.test(product.reference)
    ) {
      throw new Error(`${product.reference} must use the JH-NN reference format.`);
    }
    if (
      product.reference.startsWith("JH-") &&
      product.categoryId !== "category-jhula"
    ) {
      throw new Error(`${product.reference} must use the Jhula category.`);
    }
    if (product.categoryId === "category-utensils" && !product.utensilType) {
      throw new Error(`${product.reference} must define a utensil type.`);
    }
    if (
      product.categoryId !== "category-utensils" &&
      product.utensilType !== undefined
    ) {
      throw new Error(`${product.reference} cannot define a utensil type.`);
    }
    if (
      (product.categoryId === "category-coin" ||
        product.categoryId === "category-gold") &&
      !supportedCoinShapes.has(product.coinShape ?? "")
    ) {
      throw new Error(`${product.reference} must define a supported coin or bar shape.`);
    }
    if (
      product.categoryId !== "category-coin" &&
      product.categoryId !== "category-gold" &&
      product.coinShape !== undefined
    ) {
      throw new Error(`${product.reference} cannot define a coin or bar shape.`);
    }

    const mappingRow = mappingByProductId.get(product.id);
    if (
      !mappingRow ||
      mappingRow.number !== (product.originalNumber ?? product.number) ||
      mappingRow.reference !== product.reference
    ) {
      throw new Error(`Missing or mismatched asset mapping for ${product.reference}.`);
    }
  }
}

function getGalleryImage(product: ManifestProduct, assetId: string) {
  return {
    _key: `gallery-${product.reference.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    _type: "image",
    asset: {
      _type: "reference",
      _ref: assetId,
    },
    alt: product.alt,
  };
}

function getProductDocument(
  product: ManifestProduct,
  gallery: ReturnType<typeof getGalleryImage>[],
) {
  return {
    _id: product.id,
    _type: "product",
    title: product.title,
    slug: {
      _type: "slug",
      current: product.slug,
    },
    shortDescription: product.shortDescription,
    gallery,
    category: {
      _type: "reference",
      _ref: product.categoryId,
    },
    material: product.material ?? "silver",
    utensilType: product.utensilType,
    purity: product.purity,
    coinShape: product.coinShape,
    weightGrams: product.weightGrams,
    heightInches: product.heightInches,
    widthInches: product.widthInches,
    depthInches: product.depthInches,
    diameterInches: product.diameterInches,
    singhasanWidthInches: product.singhasanWidthInches,
    singhasanDepthInches: product.singhasanDepthInches,
    sizeVariants: product.sizeVariants?.map((variant) => ({
      _key: `${variant.weightGrams}g-${variant.diameterInches}in`.replace(".", "-"),
      _type: "productSizeVariant",
      weightGrams: variant.weightGrams,
      diameterInches: variant.diameterInches,
    })),
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

  const productRecords = manifest.products.filter(
    (product) => product.createProduct !== false,
  );
  const alternateRecords = manifest.products.filter(
    (product) => product.recordType === "alternateGalleryImage",
  );
  const productIds = productRecords.map(({ id }) => id);
  const draftIds = productIds.map((id) => `drafts.${id}`);
  const slugs = productRecords.map(({ slug }) => slug);
  const references = productRecords.map(({ reference }) => reference);
  const parentProductIds = [
    ...new Set(
      alternateRecords.flatMap((product) =>
        product.parentProductId ? [product.parentProductId] : [],
      ),
    ),
  ];
  const parentReferences = [
    ...new Set(
      alternateRecords.flatMap((product) =>
        product.parentReference ? [product.parentReference] : [],
      ),
    ),
  ];
  const categoryIds = [...new Set(productRecords.map(({ categoryId }) => categoryId))];
  const deityIds = [
    ...new Set(productRecords.flatMap(({ deityIds: ids }) => ids ?? [])),
  ];
  const mappingByRecordId = new Map(
    mapping.assets.map((row) => [row.productId, row]),
  );
  const assetIds = manifest.products.map(
    (product) => mappingByRecordId.get(product.id)!.sanityAssetId,
  );

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
        _rev,
        title,
        "slug": slug.current,
        reference,
        "gallery": gallery[]{_key, alt, "assetId": asset._ref}
      }`,
      {
        candidateIds: [...productIds, ...draftIds, ...parentProductIds],
        slugs,
        references: [...references, ...parentReferences],
      },
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

  const productById = new Map(productRecords.map((product) => [product.id, product]));
  const productBySlug = new Map(productRecords.map((product) => [product.slug, product]));
  const productByReference = new Map(
    productRecords.map((product) => [product.reference, product]),
  );
  const parentReferenceById = new Map(
    alternateRecords.map((product) => [
      product.parentProductId!,
      product.parentReference!,
    ]),
  );
  const existingById = new Map<string, ExistingProduct>();
  const existingParentById = new Map<string, ExistingProduct>();

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

    const expectedParentReference = parentReferenceById.get(existing._id);
    if (expectedParentReference) {
      if (existing.reference !== expectedParentReference) {
        throw new Error(
          `Existing parent ${existing._id} has reference ${existing.reference ?? "(missing)"}; expected ${expectedParentReference}.`,
        );
      }
      existingParentById.set(existing._id, existing);
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

  for (const alternate of alternateRecords) {
    if (
      !productById.has(alternate.parentProductId!) &&
      !existingParentById.has(alternate.parentProductId!)
    ) {
      throw new Error(
        `Parent product ${alternate.parentProductId} (${alternate.parentReference}) was not found for ${alternate.reference}.`,
      );
    }
  }

  const actions = productRecords.map((product) => {
    const exists = existingById.has(product.id);
    const galleryRecords = [
      product,
      ...alternateRecords.filter(
        (alternate) => alternate.parentProductId === product.id,
      ),
    ];
    return {
      product,
      action: exists ? (overwriteExisting ? "REPLACE" : "SKIP") : "CREATE",
      gallery: galleryRecords.map((record) =>
        getGalleryImage(
          record,
          mappingByRecordId.get(record.id)!.sanityAssetId,
        ),
      ),
    } as const;
  });
  const parentGalleryActions = alternateRecords
    .filter((product) => !productById.has(product.parentProductId!))
    .map((product) => {
      const existing = existingParentById.get(product.parentProductId!)!;
      const assetId = mappingByRecordId.get(product.id)!.sanityAssetId;
      const galleryContainsAsset = existing.gallery?.some(
        (image) => image.assetId === assetId,
      );
      return {
        product,
        existing,
        assetId,
        action: galleryContainsAsset ? "UPDATE_METADATA" : "ATTACH",
      } as const;
    });

  console.log(
    `Target: ${projectId}/${dataset}; batch: ${manifest.batchId}; source images: ${manifest.products.length}; new product candidates: ${actions.length}`,
  );
  if (parentGalleryActions.length > 0) {
    console.table(
      parentGalleryActions.map(({ product, existing, action }) => ({
        action,
        reference: existing.reference,
        imageRecord: product.reference,
        title: existing.title,
      })),
    );
  }
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
  if (mutations.length === 0 && parentGalleryActions.length === 0) {
    console.log("All batch products and gallery images already exist; no mutations were required.");
    return;
  }

  let transaction = client.transaction();
  for (const { product, action, gallery } of mutations) {
    const document = getProductDocument(product, gallery);
    transaction =
      action === "REPLACE"
        ? transaction.createOrReplace(document)
        : transaction.create(document);
  }
  for (const { product, existing, assetId, action } of parentGalleryActions) {
    transaction = transaction.patch(existing._id, (patch) => {
      let nextPatch = patch.ifRevisionId(existing._rev);
      if (product.updateParentMetadata) {
        nextPatch = nextPatch.set({
          shortDescription: product.shortDescription,
          material: product.material ?? "silver",
          utensilType: product.utensilType,
          purity: product.purity,
          coinShape: product.coinShape,
          weightGrams: product.weightGrams,
          heightInches: product.heightInches,
          widthInches: product.widthInches,
          depthInches: product.depthInches,
          diameterInches: product.diameterInches,
          singhasanWidthInches: product.singhasanWidthInches,
          singhasanDepthInches: product.singhasanDepthInches,
        });
      }
      if (action === "ATTACH") {
        nextPatch = nextPatch
          .setIfMissing({ gallery: [] })
          .append("gallery", [getGalleryImage(product, assetId)]);
      }
      return nextPatch;
    });
  }

  await transaction.commit({ visibility: "sync" });
  console.log(
    `Published ${mutations.filter(({ action }) => action === "CREATE").length} new products, replaced ${mutations.filter(({ action }) => action === "REPLACE").length}, and updated ${parentGalleryActions.length} existing gallery parent products.`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
