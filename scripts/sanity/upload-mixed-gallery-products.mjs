import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const defaultManifestPath = path.join(
  projectRoot,
  "scripts/images/mixed-gallery-new-folder-2-2026-08-09.json",
);
const defaultReviewCsvPath = path.join(
  projectRoot,
  "scripts/images/mixed-gallery-new-folder-2-2026-08-09-review.csv",
);
const supportedCategories = new Set([
  "category-coin",
  "category-gold",
  "category-gifts",
  "category-jhula",
  "category-purse",
  "category-idols",
  "category-utensils",
]);
const utensilReferenceCodeByType = new Map([
  ["glass", "GL"],
  ["bowl", "BW"],
  ["plate", "PL"],
  ["jug", "JG"],
  ["kalash", "KL"],
  ["bottle", "BT"],
  ["spoon", "SP"],
  ["pooja-thali-set", "PT"],
]);
const supportedPurities = new Set(["91.60", "92.5", "99.50", "99.80"]);
const supportedMaterials = new Set(["silver", "gold"]);
const supportedCoinShapes = new Set([
  "round",
  "oval",
  "square",
  "rectangle",
  "scalloped",
]);
const supportedSeedDeityIds = new Set([
  "deity-krishna",
  "deity-ganesha",
  "deity-khatu-shyam",
  "deity-shiva",
  "deity-parvati",
  "deity-hanuman",
  "deity-sai-baba",
  "deity-vishnu",
  "deity-lakshmi",
  "deity-saraswati",
  "deity-kuber",
  "deity-kartikeya",
  "deity-radha",
  "deity-durga",
  "deity-guru-nanak",
  "deity-jagannath",
  "deity-balabhadra",
  "deity-subhadra",
  "deity-kamdhenu",
  "deity-laughing-buddha",
  "deity-maharaja-agrasen",
  "deity-rama",
  "deity-sita",
  "deity-mahavir",
  "deity-buddha",
  "deity-br-ambedkar",
  "deity-kali",
  "deity-annapurna",
  "deity-parshvanath",
]);

function getArgumentValue(name) {
  const inline = process.argv.find((argument) => argument.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function resolveInputPath(value, fallback) {
  if (!value) return fallback;
  return path.isAbsolute(value) ? value : path.resolve(projectRoot, value);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readPngDimensions(filePath) {
  const bytes = Buffer.alloc(24);
  const descriptor = fs.openSync(filePath, "r");
  try {
    const count = fs.readSync(descriptor, bytes, 0, bytes.length, 0);
    if (count !== bytes.length) throw new Error("file is shorter than a PNG header");
  } finally {
    fs.closeSync(descriptor);
  }
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!bytes.subarray(0, 8).equals(signature)) throw new Error("not a PNG file");
  if (bytes.toString("ascii", 12, 16) !== "IHDR") throw new Error("missing PNG IHDR");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function addUniqueError(products, property, errors) {
  const seen = new Map();
  for (const product of products) {
    const value = product[property];
    if (typeof value !== "string" && typeof value !== "number") continue;
    const previous = seen.get(value);
    if (previous !== undefined) {
      errors.push(`${property} is duplicated by products ${previous} and ${product.number}: ${value}`);
    } else {
      seen.set(value, product.number);
    }
  }
}

function positiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

function csvCell(value) {
  const text = Array.isArray(value)
    ? value
        .map((item) =>
          item && typeof item === "object" ? JSON.stringify(item) : String(item),
        )
        .join(" | ")
    : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function writeReviewCsv(manifest, outputPath) {
  const headers = [
    "number",
    "sourcePath",
    "imagePath",
    "reference",
    "title",
    "categoryId",
    "utensilType",
    "material",
    "purity",
    "weightGrams",
    "heightInches",
    "widthInches",
    "depthInches",
    "diameterInches",
    "suppliedSizeLabel",
    "singhasanWidthInches",
    "singhasanDepthInches",
    "idolConstruction",
    "deityIds",
    "coinShape",
    "sizeVariants",
    "recordType",
    "parentReference",
    "shortDescription",
    "alt",
    "publishBlockers",
    "readyForSanityAssetUpload",
    "readyForProductPublish",
  ];
  const rows = manifest.products.map((product) =>
    [
      ...headers.slice(0, -2).map((header) => csvCell(product[header])),
      csvCell(manifest.readyForSanityAssetUpload),
      csvCell(manifest.readyForProductPublish && product.publishBlockers.length === 0),
    ].join(","),
  );
  fs.writeFileSync(outputPath, `${headers.map(csvCell).join(",")}\n${rows.join("\n")}\n`);
}

function validateManifest(manifest, manifestPath) {
  const errors = [];
  const warnings = [];
  const products = Array.isArray(manifest.products) ? manifest.products : [];
  const manifestDirectory = path.dirname(manifestPath);

  if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (!manifest.batchId) errors.push("batchId is required");
  if (!Array.isArray(manifest.publishBlockers)) errors.push("publishBlockers must be an array");
  if (!Array.isArray(manifest.products)) errors.push("products must be an array");
  if (manifest.sourceCount !== products.length) {
    errors.push(`sourceCount ${manifest.sourceCount} does not match product count ${products.length}`);
  }
  if (products.length === 0) errors.push("products must contain at least one product");

  for (const property of [
    "number",
    "id",
    "reference",
    "title",
    "slug",
    "shortDescription",
    "alt",
    "sourcePath",
    "imagePath",
  ]) {
    addUniqueError(products, property, errors);
  }

  const mappedSourcePaths = new Set();
  const mappedImagePaths = new Set();
  let validImageCount = 0;
  let productBlockerCount = 0;

  for (const [index, product] of products.entries()) {
    const label = `product ${product.number ?? index + 1}`;
    if (product.number !== index + 1) errors.push(`${label}: number must follow stable sequence ${index + 1}`);
    if (!/^product-dda-[a-z0-9-]+$/.test(product.id ?? "")) errors.push(`${label}: invalid id`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug ?? "")) errors.push(`${label}: invalid slug`);
    if (!supportedCategories.has(product.categoryId)) errors.push(`${label}: unsupported category ${product.categoryId}`);
    if (!supportedPurities.has(product.purity)) {
      errors.push(`${label}: purity must be 91.60, 92.5, 99.50 or 99.80`);
    }
    if (!supportedMaterials.has(product.material)) {
      errors.push(`${label}: material must be silver or gold`);
    }
    if (product.categoryId === "category-gold" && product.material !== "gold") {
      errors.push(`${label}: Gold category products must use gold material`);
    }
    if (product.categoryId !== "category-gold" && product.material === "gold") {
      errors.push(`${label}: gold material is only valid for the Gold category`);
    }
    if ((product.shortDescription?.length ?? 0) < 20 || product.shortDescription.length > 240) {
      errors.push(`${label}: shortDescription must be 20-240 characters`);
    }
    if ((product.alt?.length ?? 0) < 12 || product.alt.length > 180) {
      errors.push(`${label}: alt must be 12-180 characters`);
    }
    if (product.weightGrams !== undefined && !positiveNumber(product.weightGrams)) {
      errors.push(`${label}: weightGrams must be a positive number when present`);
    }
    for (const field of [
      "heightInches",
      "widthInches",
      "depthInches",
      "diameterInches",
      "singhasanWidthInches",
      "singhasanDepthInches",
    ]) {
      if (product[field] !== undefined && !positiveNumber(product[field])) {
        errors.push(`${label}: ${field} must be a positive number when present`);
      }
    }
    const hasSinghasanWidth = product.singhasanWidthInches !== undefined;
    const hasSinghasanDepth = product.singhasanDepthInches !== undefined;
    if (hasSinghasanWidth !== hasSinghasanDepth) {
      errors.push(`${label}: singhasan width and depth must be supplied together`);
    }
    if (
      (hasSinghasanWidth || hasSinghasanDepth) &&
      product.categoryId !== "category-jhula"
    ) {
      errors.push(`${label}: singhasan measurements are only valid for Jhula`);
    }
    if (!Array.isArray(product.publishBlockers)) errors.push(`${label}: publishBlockers must be an array`);
    productBlockerCount += product.publishBlockers?.length ?? 0;

    if (product.recordType === "alternateGalleryImage") {
      if (product.createProduct !== false) {
        errors.push(`${label}: alternate gallery records must set createProduct to false`);
      }
      if (!product.parentProductId || !product.parentReference) {
        errors.push(`${label}: alternate gallery records require parentProductId and parentReference`);
      }
    } else if (product.createProduct === false) {
      errors.push(`${label}: createProduct false is only valid for alternate gallery records`);
    }

    if (product.sizeVariants !== undefined) {
      if (!Array.isArray(product.sizeVariants) || product.sizeVariants.length === 0) {
        errors.push(`${label}: sizeVariants must be a non-empty array when present`);
      } else {
        const variantKeys = new Set();
        for (const variant of product.sizeVariants) {
          if (!positiveNumber(variant.weightGrams) || !positiveNumber(variant.diameterInches)) {
            errors.push(`${label}: every size variant requires positive weightGrams and diameterInches`);
          }
          variantKeys.add(`${variant.weightGrams}/${variant.diameterInches}`);
        }
        if (variantKeys.size !== product.sizeVariants.length) {
          errors.push(`${label}: sizeVariants must be unique`);
        }
      }
    }

    if (product.reference?.startsWith("JH-") && product.categoryId !== "category-jhula") {
      errors.push(`${label}: JH references must use the Jhula category`);
    }

    if (product.categoryId === "category-idols") {
      if (!/^SSM-[A-Z]{2}-[1-9][0-9]*$/.test(product.reference ?? "")) {
        errors.push(`${label}: semi-solid idol reference must match SSM-XX-N`);
      }
      if (product.idolConstruction !== "semi-solid") errors.push(`${label}: idolConstruction must be semi-solid`);
      if (!Array.isArray(product.deityIds)) errors.push(`${label}: deityIds must be an array`);
      if (product.deityIds?.length === 0 && product.publishBlockers?.length === 0) {
        errors.push(`${label}: empty deityIds requires a publish blocker`);
      }
      for (const deityId of product.deityIds ?? []) {
        if (!supportedSeedDeityIds.has(deityId)) {
          warnings.push(`${label}: ${deityId} is not in the current deity seed list`);
        }
      }
    } else if (product.categoryId === "category-jhula") {
      if (!/^JH-[0-9]{2}$/.test(product.reference)) errors.push(`${label}: jhula reference must match JH-NN`);
    } else if (product.categoryId === "category-coin") {
      if (!/^DDA-COIN-[A-Z0-9-]+$/.test(product.reference ?? "")) {
        errors.push(`${label}: coin reference must start with DDA-COIN-`);
      }
      if (!supportedCoinShapes.has(product.coinShape)) {
        errors.push(`${label}: Coin products require a supported coinShape`);
      }
    } else if (product.categoryId === "category-gold") {
      if (!/^DDA-GOLD-[A-Z0-9-]+$/.test(product.reference ?? "")) {
        errors.push(`${label}: gold reference must start with DDA-GOLD-`);
      }
      if (!supportedCoinShapes.has(product.coinShape)) {
        errors.push(`${label}: Gold products require a supported coinShape`);
      }
    } else if (product.categoryId === "category-utensils") {
      const referenceCode = utensilReferenceCodeByType.get(product.utensilType);
      if (!referenceCode) {
        errors.push(`${label}: unsupported utensilType ${product.utensilType ?? "(missing)"}`);
      } else if (!new RegExp(`^DDA-UT-${referenceCode}-[1-9][0-9]*$`).test(product.reference ?? "")) {
        errors.push(`${label}: ${product.utensilType} reference must match DDA-UT-${referenceCode}-N`);
      }
    } else if (product.reference?.startsWith("SD-")) {
      if (!/^SD-[0-9]{2}$/.test(product.reference)) errors.push(`${label}: Sindoor Dani reference must match SD-NN`);
    } else if (product.categoryId === "category-purse") {
      const pursePattern = product.recordType === "alternateGalleryImage"
        ? /^PR-[1-9][0-9]*-ALT$/
        : /^PR-[1-9][0-9]*$/;
      if (!pursePattern.test(product.reference ?? "")) {
        errors.push(`${label}: purse reference has an invalid format`);
      }
    }
    if (product.categoryId !== "category-utensils" && product.utensilType !== undefined) {
      errors.push(`${label}: utensilType is only valid for Utensils`);
    }
    if (
      product.categoryId !== "category-coin" &&
      product.categoryId !== "category-gold" &&
      product.coinShape !== undefined
    ) {
      errors.push(`${label}: coinShape is only valid for Coin or Gold products`);
    }

    const sourcePath = path.resolve(product.sourcePath ?? "");
    if (!fs.existsSync(sourcePath)) errors.push(`${label}: source file is missing: ${product.sourcePath}`);
    else if (!/\.jpe?g$/i.test(sourcePath)) errors.push(`${label}: source must be a JPEG`);
    mappedSourcePaths.add(sourcePath.toLowerCase());

    const imagePath = path.resolve(projectRoot, product.imagePath ?? "");
    if (!imagePath.startsWith(`${projectRoot}${path.sep}`)) errors.push(`${label}: imagePath escapes the project root`);
    if (!fs.existsSync(imagePath)) {
      errors.push(`${label}: image file is missing: ${product.imagePath}`);
    } else {
      try {
        const dimensions = readPngDimensions(imagePath);
        if (dimensions.width !== 1254 || dimensions.height !== 1254) {
          errors.push(`${label}: expected 1254x1254 PNG, found ${dimensions.width}x${dimensions.height}`);
        } else {
          validImageCount += 1;
        }
      } catch (error) {
        errors.push(`${label}: ${error.message}`);
      }
    }
    mappedImagePaths.add(imagePath.toLowerCase());
  }

  if (manifest.sourceFolder && fs.existsSync(manifest.sourceFolder)) {
    const sourceFiles = fs
      .readdirSync(manifest.sourceFolder, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.jpe?g$/i.test(entry.name))
      .map((entry) => path.join(manifest.sourceFolder, entry.name).toLowerCase());
    const expectedOriginalCount = manifest.originalSourceCount ?? manifest.sourceCount;
    if (sourceFiles.length !== expectedOriginalCount) {
      errors.push(`source folder contains ${sourceFiles.length} JPEGs, expected ${expectedOriginalCount}`);
    }
    const excludedSourcePaths = new Set(
      (manifest.excludedSources ?? []).map((row) =>
        path.resolve(row.sourcePath ?? "").toLowerCase(),
      ),
    );
    for (const sourceFile of sourceFiles) {
      if (!mappedSourcePaths.has(sourceFile) && !excludedSourcePaths.has(sourceFile)) {
        errors.push(`source JPEG is not mapped or excluded: ${sourceFile}`);
      }
    }
  } else {
    errors.push(`sourceFolder is missing: ${manifest.sourceFolder}`);
  }

  if (mappedSourcePaths.size !== products.length) errors.push("source mapping is not one-to-one");
  if (mappedImagePaths.size !== products.length) errors.push("image mapping is not one-to-one");
  if (manifest.readyForSanityAssetUpload !== (validImageCount === products.length)) {
    errors.push("readyForSanityAssetUpload does not match image readiness");
  }
  const hasPublishBlockers = (manifest.publishBlockers?.length ?? 0) > 0 || productBlockerCount > 0;
  if (manifest.readyForProductPublish !== !hasPublishBlockers) {
    errors.push(
      hasPublishBlockers
        ? "readyForProductPublish must be false while blockers remain"
        : "readyForProductPublish must be true when no blockers remain",
    );
  }

  for (const fileField of ["approvedBackgroundPath"]) {
    const filePath = path.resolve(projectRoot, manifest[fileField] ?? "");
    if (!fs.existsSync(filePath)) errors.push(`${fileField} is missing: ${manifest[fileField]}`);
  }
  if (manifest.approvedTreatmentReferencePath) {
    const filePath = path.resolve(projectRoot, manifest.approvedTreatmentReferencePath);
    if (!fs.existsSync(filePath)) {
      errors.push(
        `approvedTreatmentReferencePath is missing: ${manifest.approvedTreatmentReferencePath}`,
      );
    }
  }

  return {
    errors,
    warnings,
    counts: {
      products: products.length,
      productDocuments: products.filter((product) => product.createProduct !== false).length,
      alternateImages: products.filter((product) => product.recordType === "alternateGalleryImage").length,
      validImages: validImageCount,
      coins: products.filter((product) => product.categoryId === "category-coin").length,
      gold: products.filter((product) => product.categoryId === "category-gold").length,
      gifts: products.filter((product) => product.categoryId === "category-gifts").length,
      jhulas: products.filter((product) => product.categoryId === "category-jhula").length,
      purses: products.filter((product) => product.categoryId === "category-purse").length,
      idols: products.filter((product) => product.categoryId === "category-idols").length,
      utensils: products.filter((product) => product.categoryId === "category-utensils").length,
      manifestBlockers: manifest.publishBlockers?.length ?? 0,
      productBlockers: productBlockerCount,
    },
    manifestDirectory,
  };
}

const applyChanges = process.argv.includes("--apply");
const writeCsv = process.argv.includes("--write-review-csv");
const manifestPath = resolveInputPath(getArgumentValue("--manifest"), defaultManifestPath);
const reviewCsvPath = resolveInputPath(getArgumentValue("--review-csv"), defaultReviewCsvPath);

if (applyChanges) {
  throw new Error(
    "This mixed-gallery command is intentionally dry-run only. It validates prospective asset/document uploads but cannot write to Sanity.",
  );
}

const manifest = readJson(manifestPath);
const result = validateManifest(manifest, manifestPath);

if (writeCsv && result.errors.length === 0) {
  writeReviewCsv(manifest, reviewCsvPath);
  console.log(`Wrote human-review CSV: ${path.relative(projectRoot, reviewCsvPath)}`);
}

console.log("Mixed gallery dry run (no Sanity writes)");
console.table(result.counts);
for (const warning of result.warnings) console.warn(`WARNING: ${warning}`);
if (result.errors.length > 0) {
  for (const error of result.errors) console.error(`ERROR: ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${result.counts.validImages} prospective image asset uploads.`);
  console.log(
    `Validated ${result.counts.productDocuments} prospective product documents across Coin, Gold, Gifts, Jhula, Purse, Idols and Utensils.`,
  );
  console.log("Dry run complete. No network request, asset upload, product mutation or publication occurred.");
}
