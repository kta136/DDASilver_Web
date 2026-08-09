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
  "category-gifts",
  "category-jhula",
  "category-purse",
  "category-idols",
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
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
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
    "purity",
    "weightGrams",
    "heightInches",
    "widthInches",
    "diameterInches",
    "suppliedSizeLabel",
    "singhasanWidthInches",
    "singhasanDepthInches",
    "idolConstruction",
    "deityIds",
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
  if (products.length !== 53) errors.push(`expected 53 products, found ${products.length}`);

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
    if (product.purity !== "92.5") errors.push(`${label}: purity must be 92.5`);
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
    } else if (product.reference?.startsWith("SD-")) {
      if (!/^SD-[0-9]{2}$/.test(product.reference)) errors.push(`${label}: Sindoor Dani reference must match SD-NN`);
    } else if (product.categoryId === "category-purse") {
      if (!/^PR-[1-9][0-9]*$/.test(product.reference ?? "")) errors.push(`${label}: purse reference must match PR-N`);
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
    if (sourceFiles.length !== manifest.sourceCount) {
      errors.push(`source folder contains ${sourceFiles.length} JPEGs, expected ${manifest.sourceCount}`);
    }
    for (const sourceFile of sourceFiles) {
      if (!mappedSourcePaths.has(sourceFile)) errors.push(`source JPEG is not mapped: ${sourceFile}`);
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

  for (const fileField of ["approvedBackgroundPath", "approvedTreatmentReferencePath"]) {
    const filePath = path.resolve(projectRoot, manifest[fileField] ?? "");
    if (!fs.existsSync(filePath)) errors.push(`${fileField} is missing: ${manifest[fileField]}`);
  }

  return {
    errors,
    warnings,
    counts: {
      products: products.length,
      validImages: validImageCount,
      gifts: products.filter((product) => product.categoryId === "category-gifts").length,
      jhulas: products.filter((product) => product.categoryId === "category-jhula").length,
      purses: products.filter((product) => product.categoryId === "category-purse").length,
      idols: products.filter((product) => product.categoryId === "category-idols").length,
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
  console.log(`Validated ${result.counts.products} prospective product documents across Gifts, Jhula, Purse and Idols.`);
  console.log("Dry run complete. No network request, asset upload, product mutation or publication occurred.");
}
