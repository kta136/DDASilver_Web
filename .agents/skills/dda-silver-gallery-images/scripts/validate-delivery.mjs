import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "../../../..");
const args = process.argv.slice(2);
const manifestArgument = args.find((argument) => !argument.startsWith("--"));

if (!manifestArgument) {
  throw new Error("Usage: validate-delivery.mjs <manifest.json> [--write-review-csv] [--write-validation-report]");
}

const manifestPath = path.isAbsolute(manifestArgument)
  ? manifestArgument
  : path.resolve(projectRoot, manifestArgument);
const manifestDirectory = path.dirname(manifestPath);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const products = Array.isArray(manifest.products) ? manifest.products : [];
const errors = [];
const warnings = [];
const supportedPurities = new Set(["91.60", "92.5", "99.50", "99.80"]);

function blockerText(blockers) {
  return Array.isArray(blockers) ? blockers.join(" ").toLowerCase() : "";
}

function positiveNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
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

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex").toUpperCase();
}

function checkUnique(property) {
  const seen = new Map();
  for (const product of products) {
    const value = product[property];
    if (value === null || value === undefined || value === "") continue;
    const previous = seen.get(value);
    if (previous !== undefined) {
      errors.push(`${property} is duplicated by products ${previous} and ${product.number}: ${value}`);
    } else {
      seen.set(value, product.number);
    }
  }
}

function csvCell(value) {
  const text = Array.isArray(value)
    ? value.map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item))).join(" | ")
    : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function writeReviewCsv(outputPath) {
  const headers = [
    "number",
    "sourcePath",
    "imagePath",
    "reference",
    "referenceFamily",
    "title",
    "slug",
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
    "idolConstruction",
    "deityIds",
    "shortDescription",
    "alt",
    "publishBlockers",
    "readyForSanityAssetUpload",
    "readyForProductPublish",
  ];
  const rows = products.map((product) =>
    [
      ...headers.slice(0, -2).map((header) => csvCell(product[header])),
      csvCell(manifest.readyForSanityAssetUpload),
      csvCell(manifest.readyForProductPublish && product.publishBlockers.length === 0),
    ].join(","),
  );
  fs.writeFileSync(outputPath, `${headers.map(csvCell).join(",")}\n${rows.join("\n")}\n`);
}

if (manifest.schemaVersion !== 1) errors.push("schemaVersion must be 1");
if (!manifest.batchId) errors.push("batchId is required");
if (!Array.isArray(manifest.publishBlockers)) errors.push("publishBlockers must be an array");
if (!Array.isArray(manifest.products)) errors.push("products must be an array");
if (manifest.sourceCount !== products.length) {
  errors.push(`sourceCount ${manifest.sourceCount} does not match product count ${products.length}`);
}
if (products.length === 0) errors.push("products must contain at least one product");

for (const property of ["number", "id", "title", "slug", "sourcePath", "imagePath", "reference"]) {
  checkUnique(property);
}

const sourcePaths = new Set();
const imagePaths = new Set();
let validImageCount = 0;
let verifiedSourceCount = 0;
let productBlockerCount = 0;

for (const [index, product] of products.entries()) {
  const label = `product ${product.number ?? index + 1}`;
  const blockers = blockerText(product.publishBlockers);
  productBlockerCount += product.publishBlockers?.length ?? 0;

  if (product.number !== index + 1) errors.push(`${label}: number must equal ${index + 1}`);
  for (const field of ["id", "title", "slug", "shortDescription", "alt", "categoryId", "material", "sourcePath", "imagePath"]) {
    if (typeof product[field] !== "string" || product[field].trim() === "") {
      errors.push(`${label}: ${field} is required`);
    }
  }
  if (!Array.isArray(product.publishBlockers)) errors.push(`${label}: publishBlockers must be an array`);
  if ((product.shortDescription?.length ?? 0) < 20 || product.shortDescription.length > 240) {
    errors.push(`${label}: shortDescription must be 20-240 characters`);
  }
  if ((product.alt?.length ?? 0) < 12 || product.alt.length > 180) {
    errors.push(`${label}: alt must be 12-180 characters`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product.slug ?? "")) errors.push(`${label}: invalid slug`);
  if (product.reference === null || product.reference === undefined || product.reference === "") {
    if (!/(reference|construction|code family|taxonomy)/.test(blockers)) {
      errors.push(`${label}: a missing reference requires an explicit blocker`);
    }
  }
  if (!supportedPurities.has(product.purity)) {
    if (!blockers.includes("purity")) errors.push(`${label}: a missing purity requires an explicit blocker`);
  }
  if (product.weightGrams === null || product.weightGrams === undefined) {
    if (!blockers.includes("weight")) errors.push(`${label}: a missing weight requires an explicit blocker`);
  } else if (!positiveNumber(product.weightGrams)) {
    errors.push(`${label}: weightGrams must be positive`);
  }
  for (const field of ["heightInches", "widthInches", "depthInches", "diameterInches"]) {
    if (product[field] !== null && product[field] !== undefined && !positiveNumber(product[field])) {
      errors.push(`${label}: ${field} must be positive when present`);
    }
  }
  const hasDimension = ["heightInches", "widthInches", "depthInches", "diameterInches"].some((field) =>
    positiveNumber(product[field]),
  );
  if (!hasDimension && !blockers.includes("dimension")) {
    errors.push(`${label}: a missing physical dimension requires an explicit blocker`);
  }

  const sourcePath = path.resolve(product.sourcePath ?? "");
  sourcePaths.add(sourcePath.toLowerCase());
  if (!fs.existsSync(sourcePath)) {
    errors.push(`${label}: source file is missing: ${product.sourcePath}`);
  } else {
    const actualHash = sha256(sourcePath);
    if (actualHash !== product.sourceSha256) {
      errors.push(`${label}: source SHA-256 does not match the recorded original`);
    } else {
      verifiedSourceCount += 1;
    }
  }

  const imagePath = path.resolve(projectRoot, product.imagePath ?? "");
  imagePaths.add(imagePath.toLowerCase());
  if (!imagePath.startsWith(`${projectRoot}${path.sep}`)) errors.push(`${label}: imagePath escapes project root`);
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
}

if (sourcePaths.size !== products.length) errors.push("source mapping is not one-to-one");
if (imagePaths.size !== products.length) errors.push("image mapping is not one-to-one");

if (manifest.sourceFolder && fs.existsSync(manifest.sourceFolder)) {
  const sourceCount = fs
    .readdirSync(manifest.sourceFolder, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /\.jpe?g$/i.test(entry.name)).length;
  if (sourceCount !== manifest.originalSourceCount) {
    errors.push(`source folder contains ${sourceCount} JPEGs, expected ${manifest.originalSourceCount}`);
  }
} else {
  errors.push(`sourceFolder is missing: ${manifest.sourceFolder}`);
}

for (const field of ["approvedBackgroundPath", "approvedTreatmentReferencePath", "promptAuditPath"]) {
  if (!manifest[field]) {
    errors.push(`${field} is required`);
    continue;
  }
  const filePath = path.resolve(projectRoot, manifest[field]);
  if (!fs.existsSync(filePath)) errors.push(`${field} is missing: ${manifest[field]}`);
}

const expectedAssetReadiness = validImageCount === products.length && verifiedSourceCount === products.length;
if (manifest.readyForSanityAssetUpload !== expectedAssetReadiness) {
  errors.push("readyForSanityAssetUpload does not match verified source/image readiness");
}
const hasBlockers = (manifest.publishBlockers?.length ?? 0) > 0 || productBlockerCount > 0;
if (manifest.readyForProductPublish !== !hasBlockers) {
  errors.push("readyForProductPublish does not match blocker state");
}

if (hasBlockers) warnings.push(`${(manifest.publishBlockers?.length ?? 0) + productBlockerCount} publish blockers remain`);

const report = {
  batchId: manifest.batchId,
  validatedAt: new Date().toISOString(),
  deliveryValid: errors.length === 0,
  readyForSanityAssetUpload: expectedAssetReadiness,
  readyForProductPublish: !hasBlockers,
  counts: {
    sources: manifest.originalSourceCount,
    products: products.length,
    verifiedSources: verifiedSourceCount,
    validImages: validImageCount,
    manifestBlockers: manifest.publishBlockers?.length ?? 0,
    productBlockers: productBlockerCount,
  },
  errors,
  warnings,
};

if (args.includes("--write-review-csv")) {
  writeReviewCsv(path.join(manifestDirectory, "gallery-review.csv"));
}
if (args.includes("--write-validation-report")) {
  fs.writeFileSync(path.join(manifestDirectory, "validation-report.json"), `${JSON.stringify(report, null, 2)}\n`);
}

console.log(JSON.stringify(report, null, 2));
if (errors.length > 0) process.exitCode = 1;
