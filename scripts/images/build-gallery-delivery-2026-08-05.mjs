#!/usr/bin/env node

import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..", "..");
const sourceDirectory = "C:\\Users\\kk\\Desktop\\New folder (2)";
const deliveryDirectory = join(
  repoRoot,
  "public",
  "images",
  "gallery-ingestion",
  "new-folder-2-2026-08-05",
);
const idolDirectory = join(
  repoRoot,
  "public",
  "images",
  "silver-idols",
  "new-folder-2-2026-08-05",
);
const giftDirectory = join(
  repoRoot,
  "public",
  "images",
  "silver-gifts",
  "new-folder-2-2026-08-05",
);
const spoonDirectory = join(
  repoRoot,
  "public",
  "images",
  "silver-utensils",
  "spoon-gallery-2026-08-05",
);
const excludedSources = [
  {
    sourceFilename: "WhatsApp Image 2026-08-04 at 4.26.58 PM.jpeg",
    reason: "Removed from the prepared gallery at the owner's request.",
  },
];

const idolCatalogPath = join(
  repoRoot,
  "scripts",
  "images",
  "idol-batch-2026-08-05-new-folder-2.json",
);
const giftCatalogPath = join(
  repoRoot,
  "scripts",
  "images",
  "gift-batch-2026-08-05-new-folder-2.json",
);
const spoonCatalogPath = join(
  repoRoot,
  "scripts",
  "images",
  "utensil-batch-2026-08-05-spoons.json",
);
const idolManifestPath = join(idolDirectory, "sanity-idol-manifest.json");
const remoteDeitiesSeeded = process.argv.includes("--remote-deities-seeded");
const missingRemoteDeityIds = remoteDeitiesSeeded
  ? []
  : ["deity-sita", "deity-mahavir", "deity-buddha"];
const missingRemoteDeityBlocker =
  "Seed deity-sita, deity-mahavir, and deity-buddha in Sanity before publishing the Rama Sita pair, Mahavir idol, and Buddha idol.";

function pathForManifest(absolutePath) {
  const repoRelative = relative(repoRoot, absolutePath);
  if (
    repoRelative &&
    repoRelative !== ".." &&
    !repoRelative.startsWith(`..${sep}`) &&
    !repoRelative.startsWith("/")
  ) {
    return repoRelative.replaceAll("\\", "/");
  }
  return absolutePath.replaceAll("\\", "/");
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function toCsv(rows) {
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

function shortDescription(product) {
  if (!product.weightGrams || !product.heightInches) return product.description;
  if (/\b(?:weight|supplied)\b.*\bheight\b/i.test(product.description)) {
    return product.description;
  }
  return `${product.description} Weight: ${product.weightGrams} g. Height: ${product.heightInches} in.`;
}

function validateReadyProduct(product) {
  for (const field of ["number", "id", "title", "slug", "shortDescription", "alt", "purity", "weightGrams", "imagePath"]) {
    if (product[field] === undefined || product[field] === null || product[field] === "") {
      throw new Error(`${product.title ?? product.id} is missing ${field}.`);
    }
  }
  if (!Number.isFinite(product.weightGrams) || product.weightGrams <= 0) {
    throw new Error(`${product.title} has an invalid weight.`);
  }
  if (!Number.isFinite(product.heightInches) || product.heightInches <= 0) {
    throw new Error(`${product.title} has an invalid supplied height.`);
  }
  if (product.shortDescription.length < 20 || product.shortDescription.length > 240) {
    throw new Error(`${product.title} has an invalid shortDescription length.`);
  }
  if (product.alt.length < 12 || product.alt.length > 180) {
    throw new Error(`${product.title} has invalid alt text.`);
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function main() {
  const [idolCatalog, giftCatalog, spoonCatalog, processorIdolManifest] =
    await Promise.all([
      readJson(idolCatalogPath),
      readJson(giftCatalogPath),
      readJson(spoonCatalogPath),
      readJson(idolManifestPath),
    ]);
  const sourceFilenames = (await readdir(sourceDirectory))
    .filter((filename) => /\.(?:jpe?g|png)$/i.test(filename))
    .sort((left, right) => left.localeCompare(right, "en-IN"));
  const sourceSequence = new Map(
    sourceFilenames.map((filename, index) => [filename, index + 1]),
  );

  const idolProductByNumber = new Map(
    processorIdolManifest.products.map((product) => [product.number, product]),
  );
  const idolProducts = idolCatalog.products.map((catalogProduct) => {
    const generated = idolProductByNumber.get(catalogProduct.number);
    if (!generated) {
      throw new Error(`Missing generated idol product ${catalogProduct.number}.`);
    }
    return {
      ...generated,
      sourceSequence: sourceSequence.get(catalogProduct.sourceFilename),
      sourceFilename: catalogProduct.sourceFilename,
      shortDescription: shortDescription(catalogProduct),
      purity: "99.80",
      reference: catalogProduct.assignedItemCode,
    };
  });

  const giftProducts = giftCatalog.products.map((product) => ({
    sourceSequence: sourceSequence.get(product.sourceFilename),
    sourceFilename: product.sourceFilename,
    number: product.number,
    id: `product-dda-gift-${String(product.number).padStart(2, "0")}-${product.slug}`,
    title: product.title,
    slug: product.slug,
    shortDescription: shortDescription(product),
    alt: product.alt,
    utensilType: "figurine",
    purity: "99.80",
    weightGrams: product.weightGrams,
    heightInches: product.heightInches,
    reference: `DDA-GF-${product.codeFamily}-${String(product.number).padStart(2, "0")}`,
    imagePath: pathForManifest(join(giftDirectory, product.outputFilename)),
  }));

  const spoonProducts = spoonCatalog.products.map((product) => ({
    sourceSequence: sourceSequence.get(product.sourceFilename),
    sourceFilename: product.sourceFilename,
    number: product.number,
    id: `product-dda-utensil-${String(product.number).padStart(2, "0")}-${product.slug}`,
    title: product.title,
    slug: product.slug,
    shortDescription: shortDescription(product),
    alt: product.alt,
    utensilType: "spoon",
    purity: "92.5",
    ...(product.weightGrams ? { weightGrams: product.weightGrams } : {}),
    ...(product.heightInches ? { heightInches: product.heightInches } : {}),
    reference: `DDA-UT-${product.codeFamily}-${String(product.number).padStart(2, "0")}`,
    imagePath: pathForManifest(join(spoonDirectory, product.outputFilename)),
    readyForProductPublish: Boolean(product.weightGrams && product.heightInches),
    publishBlockers:
      product.weightGrams && product.heightInches
        ? []
        : ["Source overview photograph has no supplied weight or physical dimension."],
  }));
  const readySpoonProducts = spoonProducts
    .filter((product) => product.readyForProductPublish)
    .map((product) =>
      Object.fromEntries(
        Object.entries(product).filter(
          ([field]) =>
            field !== "readyForProductPublish" && field !== "publishBlockers",
        ),
      ),
    );

  for (const product of [...idolProducts, ...giftProducts, ...readySpoonProducts]) {
    validateReadyProduct(product);
  }

  const idolManifest = {
    ...processorIdolManifest,
    readyForUpload: missingRemoteDeityIds.length === 0,
    readyForSanityAssetUpload: true,
    readyForProductPublish: missingRemoteDeityIds.length === 0,
    publishBlockers:
      missingRemoteDeityIds.length === 0 ? [] : [missingRemoteDeityBlocker],
    requiredDeityIds: missingRemoteDeityIds,
    products: idolProducts,
  };
  const readyIdolProducts = idolProducts.filter(
    (product) =>
      !product.deityIds.some((deityId) => missingRemoteDeityIds.includes(deityId)),
  );
  const readyIdolManifest = {
    ...idolManifest,
    batchId: `${idolManifest.batchId}-seeded-deities-only`,
    readyForUpload: true,
    readyForProductPublish: true,
    publishBlockers: [],
    requiredDeityIds: [],
    review: idolManifest.review.filter((reviewItem) =>
      readyIdolProducts.some(
        (product) => product.outputFilename === reviewItem.outputFilename,
      ),
    ),
    products: readyIdolProducts,
  };
  const giftManifest = {
    schemaVersion: 1,
    batchId: giftCatalog.batchId,
    categoryId: "category-gifts",
    readyForSanityAssetUpload: true,
    readyForProductPublish: true,
    publishBlockers: [],
    products: giftProducts,
  };
  const utensilManifest = {
    schemaVersion: 1,
    batchId: spoonCatalog.batchId,
    categoryId: "category-utensils",
    readyForSanityAssetUpload: true,
    readyForProductPublish: true,
    publishBlockers: [],
    products: readySpoonProducts,
  };
  const utensilBatchManifest = {
    schemaVersion: 1,
    batchId: `${spoonCatalog.batchId}-approved-items`,
    categoryId: "category-utensils",
    readyForSanityAssetUpload: true,
    readyForProductPublish: spoonProducts.every(
      (product) => product.readyForProductPublish,
    ),
    publishBlockers: spoonProducts.flatMap((product) => product.publishBlockers),
    products: spoonProducts,
  };

  const masterProducts = [
    ...idolProducts.map((product) => {
      const missingDeities = product.deityIds.filter((deityId) =>
        missingRemoteDeityIds.includes(deityId),
      );
      return {
        ...product,
        categoryId: "category-idols",
        readyForProductPublish: missingDeities.length === 0,
        publishBlockers:
          missingDeities.length === 0
            ? []
            : [`Missing Sanity deity records: ${missingDeities.join(", ")}.`],
      };
    }),
    ...giftProducts.map((product) => ({
      ...product,
      categoryId: "category-gifts",
      readyForProductPublish: true,
      publishBlockers: [],
    })),
    ...spoonProducts.map((product) => ({
      ...product,
      categoryId: "category-utensils",
    })),
  ].sort((left, right) => left.sourceSequence - right.sourceSequence);
  const masterManifest = {
    schemaVersion: 1,
    batchId: "new-folder-2-mixed-gallery-2026-08-05",
    sourceDirectory,
    sourceCount: sourceFilenames.length,
    excludedSourceCount: excludedSources.length,
    excludedSources,
    finalImageCount: masterProducts.length,
    categoryCounts: {
      "category-idols": idolProducts.length,
      "category-gifts": giftProducts.length,
      "category-utensils": spoonProducts.length,
    },
    backgroundPath:
      "public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png",
    readyForSanityAssetUpload: true,
    readyForProductPublish:
      missingRemoteDeityIds.length === 0 &&
      utensilBatchManifest.publishBlockers.length === 0,
    publishBlockers: [
      ...(missingRemoteDeityIds.length === 0
        ? []
        : [missingRemoteDeityBlocker]),
      ...utensilBatchManifest.publishBlockers,
    ],
    requiredSanitySeeds: idolManifest.requiredDeityIds,
    products: masterProducts,
  };

  const expectedFinalImageCount = sourceFilenames.length - excludedSources.length;
  if (
    sourceFilenames.length !== 41 ||
    masterProducts.length !== expectedFinalImageCount
  ) {
    throw new Error(
      `Count mismatch: ${sourceFilenames.length} sources, ${excludedSources.length} exclusions, and ${masterProducts.length} manifest products.`,
    );
  }
  for (const excludedSource of excludedSources) {
    if (!sourceSequence.has(excludedSource.sourceFilename)) {
      throw new Error(`Excluded source was not found: ${excludedSource.sourceFilename}`);
    }
    if (
      masterProducts.some(
        (product) => product.sourceFilename === excludedSource.sourceFilename,
      )
    ) {
      throw new Error(
        `Excluded source remains in the delivery: ${excludedSource.sourceFilename}`,
      );
    }
  }
  const uniqueFields = ["id", "slug", "title", "reference"];
  for (const field of uniqueFields) {
    const values = masterProducts.map((product) => product[field]).filter(Boolean);
    if (new Set(values).size !== values.length) {
      throw new Error(`Master manifest contains duplicate ${field} values.`);
    }
  }
  for (const product of masterProducts) {
    const fileStats = await stat(resolve(repoRoot, product.imagePath));
    if (!fileStats.isFile()) {
      throw new Error(`Missing product image: ${product.imagePath}`);
    }
  }

  const reviewHeader = [
    "sourceSequence",
    "sourceFilename",
    "categoryId",
    "number",
    "id",
    "title",
    "slug",
    "purity",
    "weightGrams",
    "heightInches",
    "reference",
    "readyForProductPublish",
    "publishBlockers",
    "shortDescription",
    "alt",
    "imagePath",
  ];
  const reviewRows = masterProducts.map((product) => [
    product.sourceSequence,
    product.sourceFilename,
    product.categoryId,
    product.number,
    product.id,
    product.title,
    product.slug,
    product.purity,
    product.weightGrams,
    product.heightInches,
    product.reference,
    product.readyForProductPublish,
    product.publishBlockers.join("; "),
    product.shortDescription,
    product.alt,
    product.imagePath,
  ]);

  await mkdir(deliveryDirectory, { recursive: true });
  await Promise.all([
    writeFile(idolManifestPath, `${JSON.stringify(idolManifest, null, 2)}\n`),
    writeFile(
      join(idolDirectory, "sanity-idol-ready-manifest.json"),
      `${JSON.stringify(readyIdolManifest, null, 2)}\n`,
    ),
    writeFile(
      join(idolDirectory, "sanity-idol-review.csv"),
      toCsv([reviewHeader, ...reviewRows.filter((row) => row[2] === "category-idols")]),
    ),
    writeFile(
      join(giftDirectory, "sanity-gift-manifest.json"),
      `${JSON.stringify(giftManifest, null, 2)}\n`,
    ),
    writeFile(
      join(giftDirectory, "sanity-gift-review.csv"),
      toCsv([reviewHeader, ...reviewRows.filter((row) => row[2] === "category-gifts")]),
    ),
    writeFile(
      join(spoonDirectory, "sanity-utensil-manifest.json"),
      `${JSON.stringify(utensilManifest, null, 2)}\n`,
    ),
    writeFile(
      join(spoonDirectory, "sanity-utensil-batch-manifest.json"),
      `${JSON.stringify(utensilBatchManifest, null, 2)}\n`,
    ),
    writeFile(
      join(spoonDirectory, "sanity-utensil-review.csv"),
      toCsv([reviewHeader, ...reviewRows.filter((row) => row[2] === "category-utensils")]),
    ),
    writeFile(
      join(deliveryDirectory, "sanity-gallery-manifest.json"),
      `${JSON.stringify(masterManifest, null, 2)}\n`,
    ),
    writeFile(
      join(deliveryDirectory, "gallery-review.csv"),
      toCsv([reviewHeader, ...reviewRows]),
    ),
  ]);

  console.log(
    `Built master delivery with ${masterProducts.length} items from ${sourceFilenames.length} source images (${excludedSources.length} excluded).`,
  );
  console.log(`Master manifest: ${pathForManifest(join(deliveryDirectory, "sanity-gallery-manifest.json"))}`);
  console.log(`Publish-ready products: ${masterProducts.filter((product) => product.readyForProductPublish).length}`);
  console.log(`Blocked products: ${masterProducts.filter((product) => !product.readyForProductPublish).length}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
