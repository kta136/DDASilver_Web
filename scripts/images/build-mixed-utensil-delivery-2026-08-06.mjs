import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");
const sourceDir = "C:/Users/kk/Desktop/img";
const deliveryRelative = "public/images/silver-utensils/mixed-utensils-2026-08-06";
const deliveryDir = join(repoRoot, deliveryRelative);

const rows = [
  [42, "12.59.12", "Mini Concentric-Line Silver Plate", "mini-concentric-line-silver-plate", "plate", 50, "diameterInches", 4, "a compact raised rim and fine concentric rings"],
  [43, "1.00.09", "Compact Concentric-Line Silver Plate", "compact-concentric-line-silver-plate", "plate", 75, "diameterInches", 5, "a compact round profile and closely spaced concentric rings"],
  [44, "1.01.28", "Medium Concentric-Line Silver Plate", "medium-concentric-line-silver-plate", "plate", 100, "diameterInches", 5.5, "a balanced round profile with fine linear finishing"],
  [45, "1.02.19", "Deep Concentric-Line Silver Plate", "deep-concentric-line-silver-plate", "plate", 125, "diameterInches", 6, "a deeper plate profile and continuous horizontal line work"],
  [46, "1.03.00", "Wide Concentric-Line Silver Plate", "wide-concentric-line-silver-plate", "plate", 150, "diameterInches", 7, "a wider serving surface and neatly finished concentric bands"],
  [47, "1.04.46", "Large Concentric-Line Silver Plate", "large-concentric-line-silver-plate", "plate", 200, "diameterInches", 8, "a generous rounded surface and fine concentric texture"],
  [48, "1.06.17", "Grand Concentric-Line Silver Plate", "grand-concentric-line-silver-plate", "plate", 250, "diameterInches", 9, "a broad serving profile with an even lined finish"],
  [49, "1.07.10", "Extra-Large Concentric-Line Silver Plate", "extra-large-concentric-line-silver-plate", "plate", 300, "diameterInches", 10, "an extra-wide plate profile and continuous ring detailing"],
  [50, "1.08.27", "Eleven-Inch Concentric-Line Silver Plate", "eleven-inch-concentric-line-silver-plate", "plate", 400, "diameterInches", 11, "a substantial round form with fine horizontal rings"],
  [51, "1.09.12", "Twelve-Inch Concentric-Line Silver Plate", "twelve-inch-concentric-line-silver-plate", "plate", 500, "diameterInches", 12, "a broad twelve-inch surface with a refined lined finish"],
  [52, "1.10.55", "Thirteen-Inch Concentric-Line Silver Plate", "thirteen-inch-concentric-line-silver-plate", "plate", 600, "diameterInches", 13, "the broadest plate profile in the set with dense concentric finishing"],
  [53, "2.50.45", "Mini Raised-Centre Silver Plate", "mini-raised-centre-silver-plate", "plate", 10, "diameterInches", 2, "a miniature round form with a subtly raised centre"],
  [54, "2.52.14", "Compact Triple-Ring Silver Plate", "compact-triple-ring-silver-plate", "plate", 15, "diameterInches", 2.5, "a petite profile defined by three circular rim lines"],
  [55, "2.54.02", "Broad-Rim Three-Inch Silver Plate", "broad-rim-three-inch-silver-plate", "plate", 20, "diameterInches", 3, "a small recessed centre framed by a broad polished rim"],
  [56, "2.56.08", "Stepped-Rim Three-and-a-Half-Inch Silver Plate", "stepped-rim-three-and-half-inch-silver-plate", "plate", 30, "diameterInches", 3.5, "a shallow centre and crisp stepped rim"],
  [57, "2.57.46", "Ringed Four-Inch Silver Plate", "ringed-four-inch-silver-plate", "plate", 40, "diameterInches", 4, "a compact round profile with clean circular ring detailing"],
  [58, "2.59.45", "Ringed Five-Inch Silver Plate", "ringed-five-inch-silver-plate", "plate", 50, "diameterInches", 5, "a shallow five-inch form with an orderly ringed rim"],
  [59, "3.01.15", "Raised-Rim Six-Inch Silver Plate", "raised-rim-six-inch-silver-plate", "plate", 75, "diameterInches", 6, "a smooth centre and gently raised serving rim"],
  [60, "3.02.43", "Raised-Rim Six-and-a-Half-Inch Silver Plate", "raised-rim-six-and-half-inch-silver-plate", "plate", 100, "diameterInches", 6.5, "a softly recessed centre with a defined raised edge"],
  [61, "3.03.51", "Raised-Rim Seven-Inch Silver Plate", "raised-rim-seven-inch-silver-plate", "plate", 125, "diameterInches", 7, "a balanced seven-inch surface and polished raised rim"],
  [62, "3.05.14", "Raised-Rim Seven-and-a-Half-Inch Silver Plate", "raised-rim-seven-and-half-inch-silver-plate", "plate", 150, "diameterInches", 7.5, "a broad shallow centre bordered by a neat raised rim"],
  [63, "3.06.18", "Raised-Rim Nine-Inch Silver Plate", "raised-rim-nine-inch-silver-plate", "plate", 200, "diameterInches", 9, "a generous nine-inch serving surface and gently elevated edge"],
  [64, "3.07.24", "Raised-Rim Ten-Inch Silver Plate", "raised-rim-ten-inch-silver-plate", "plate", 250, "diameterInches", 10, "a wide polished centre with a clean raised border"],
  [65, "3.09.27", "Twin-Line Eleven-Inch Silver Plate", "twin-line-eleven-inch-silver-plate", "plate", 300, "diameterInches", 11, "a broad serving profile accented by twin circular rim lines"],
  [66, "3.09.38", "Wide-Rim Eleven-Inch Silver Plate", "wide-rim-eleven-inch-silver-plate", "plate", 300, "diameterInches", 11, "a separately photographed eleven-inch form with a wide polished rim"],
  [67, "3.10.57", "Raised-Rim Twelve-Inch Silver Plate", "raised-rim-twelve-inch-silver-plate", "plate", 400, "diameterInches", 12, "a substantial twelve-inch serving area and defined raised edge"],
  [68, "3.11.46", "Raised-Rim Thirteen-Inch Silver Plate", "raised-rim-thirteen-inch-silver-plate", "plate", 500, "diameterInches", 13, "a large shallow centre surrounded by a smoothly raised rim"],
  [69, "3.12.23", "Raised-Rim Fourteen-Inch Silver Plate", "raised-rim-fourteen-inch-silver-plate", "plate", 600, "diameterInches", 14, "the broadest plate in the set with a clean elevated border"],
  [70, "3.20.25", "Tall Linear-Band Silver Jug", "tall-linear-band-silver-jug", "jug", 150, "heightInches", 5, "a tall cylindrical body, horizontal line finish and curved handle"],
  [71, "3.21.37", "Double-Band Silver Jug", "double-band-silver-jug", "jug", 200, "heightInches", 5.5, "a straight-sided body, double polished bands and sturdy handle"],
  [72, "3.22.25", "Classic Linear Silver Jug", "classic-linear-silver-jug", "jug", 250, "heightInches", 5.5, "a classic handled silhouette, linear texture and rounded handle"],
  [73, "3.23.22", "Tall Double-Band Silver Jug", "tall-double-band-silver-jug", "jug", 300, "heightInches", 6, "a taller handled profile with paired horizontal accent bands"],
  [74, "3.30.09", "Lidded Linear Silver Jug", "lidded-linear-silver-jug", "jug", 400, "heightInches", 7.5, "a fitted lid, curved handle and fine horizontal surface lines"],
  [75, "3.31.07", "Large Lidded Linear Silver Jug", "large-lidded-linear-silver-jug", "jug", 500, "heightInches", 8, "a tall lidded body, generous handle and linear finish"],
  [76, "3.41.09", "Mini Rounded Silver Kalash", "mini-rounded-silver-kalash", "kalash", 25, "heightInches", 2, "a miniature rounded belly, narrow neck and flared rim"],
  [77, "3.42.10", "Compact Rounded Silver Kalash", "compact-rounded-silver-kalash", "kalash", 40, "heightInches", 2.5, "a compact bulbous body with a rolled open rim"],
  [78, "3.44.55", "Broad Rounded Silver Kalash", "broad-rounded-silver-kalash", "kalash", 50, "heightInches", 2.5, "a broad low body, narrow neck and polished flared lip"],
  [79, "3.45.21", "Low-Profile Rounded Silver Kalash", "low-profile-rounded-silver-kalash", "kalash", 40, "heightInches", 2.2, "a low rounded profile with fine horizontal line work"],
  [80, "3.46.08", "Classic Rounded Silver Kalash", "classic-rounded-silver-kalash", "kalash", 75, "heightInches", 3, "a classic spherical belly and neatly rolled rim"],
  [81, "3.48.48", "Tall Rounded Silver Kalash", "tall-rounded-silver-kalash", "kalash", 100, "heightInches", 3.2, "a slightly taller rounded form with clean band accents"],
  [82, "3.51.42", "Wide Rounded Silver Kalash", "wide-rounded-silver-kalash", "kalash", 125, "heightInches", 3.5, "a wider belly, short neck and flared open rim"],
  [83, "3.54.31", "Curved Rounded Silver Kalash", "curved-rounded-silver-kalash", "kalash", 150, "heightInches", 3.9, "a full curved body with contrasting polished bands"],
  [84, "3.58.58", "Four-Inch Rounded Silver Kalash", "four-inch-rounded-silver-kalash", "kalash", 200, "heightInches", 4, "a balanced four-inch form with a rounded belly and rolled lip"],
  [85, "4.01.55", "Wide-Neck Rounded Silver Kalash", "wide-neck-rounded-silver-kalash", "kalash", 250, "heightInches", 4.5, "a full rounded body with a wider neck and flared rim"],
  [86, "4.03.43", "Five-Inch Rounded Silver Kalash", "five-inch-rounded-silver-kalash", "kalash", 300, "heightInches", 5, "a five-inch rounded body with polished band detailing"],
  [87, "4.05.02", "Broad Five-Inch Rounded Silver Kalash", "broad-five-inch-rounded-silver-kalash", "kalash", 400, "heightInches", 5, "a broader five-inch belly, short neck and open rolled rim"],
  [88, "4.05.54", "Large Six-Inch Rounded Silver Kalash", "large-six-inch-rounded-silver-kalash", "kalash", 500, "heightInches", 6, "a large six-inch silhouette with a rounded belly and flared lip"],
];

const codeByType = {
  bowl: "BW",
  plate: "PL",
  jug: "JG",
  kalash: "KL",
};

const existingProductIdSlugs = new Map([
  [42, "mini-concentric-line-silver-bowl"],
  [43, "compact-concentric-line-silver-bowl"],
  [44, "medium-concentric-line-silver-bowl"],
  [45, "deep-concentric-line-silver-bowl"],
  [46, "wide-concentric-line-silver-bowl"],
  [47, "large-concentric-line-silver-bowl"],
  [48, "grand-concentric-line-silver-bowl"],
  [49, "extra-large-concentric-line-silver-bowl"],
  [50, "eleven-inch-concentric-line-silver-bowl"],
  [51, "twelve-inch-concentric-line-silver-bowl"],
  [52, "thirteen-inch-concentric-line-silver-bowl"],
]);

const products = rows.map(([number, time, title, slug, utensilType, weightGrams, dimensionKey, dimensionValue, feature]) => {
  const dimensionLabel = dimensionKey === "diameterInches" ? "diameter" : "height";
  return {
    sourceSequence: number,
    sourceFilename: `WhatsApp Image 2026-08-05 at ${time} PM.jpeg`,
    number,
    id: `product-dda-utensil-${number}-${existingProductIdSlugs.get(number) ?? slug}`,
    title,
    slug,
    shortDescription: `${title} in 99.80% pure silver, featuring ${feature}; supplied at ${weightGrams} g with a ${dimensionLabel} of ${dimensionValue} in.`,
    alt: `${title} showing ${feature} on the warm ivory DDA Silver background`,
    utensilType,
    purity: "99.80",
    weightGrams,
    [dimensionKey]: dimensionValue,
    reference: `DDA-UT-${codeByType[utensilType]}-${number}`,
    imagePath: `${deliveryRelative}/${number}-${slug}.png`,
  };
});

const publishBlockers = [];

const manifest = {
  schemaVersion: 1,
  batchId: "mixed-utensils-2026-08-06",
  categoryId: "category-utensils",
  approvedTaxonomy: ["glass", "bowl", "plate", "jug", "kalash", "spoon"],
  approvedBackground: "public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png",
  sourceDirectory: sourceDir,
  sourcePhotographsPreserved: true,
  readyForSanityAssetUpload: true,
  readyForProductPublish: true,
  publishBlockers,
  products,
};

const csvEscape = (value) => {
  if (value === undefined || value === null) return "";
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const csvColumns = [
  "sourceSequence", "sourceFilename", "number", "reference", "title", "slug", "shortDescription", "alt",
  "utensilType", "purity", "weightGrams", "heightInches", "widthInches", "diameterInches", "imagePath",
];

const csv = [
  csvColumns.join(","),
  ...products.map((product) => csvColumns.map((column) => csvEscape(product[column])).join(",")),
].join("\n") + "\n";

function inspectPng(path) {
  const bytes = readFileSync(path);
  const pngSignature = "89504e470d0a1a0a";
  if (bytes.subarray(0, 8).toString("hex") !== pngSignature) {
    throw new Error(`Not a valid PNG: ${path}`);
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    bytes: bytes.length,
  };
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

const errors = [];
const approvedTypes = new Set(["bowl", "plate", "jug", "kalash"]);
if (products.length !== 47) errors.push(`Expected 47 products, found ${products.length}`);

const expectedNumbers = Array.from({ length: 47 }, (_, index) => index + 42);
if (products.map((product) => product.number).join(",") !== expectedNumbers.join(",")) {
  errors.push("Product numbers are not the complete 42-88 sequence");
}

for (const field of ["sourceFilename", "number", "id", "title", "slug", "shortDescription", "alt", "reference", "imagePath"]) {
  const repeated = duplicates(products.map((product) => product[field]));
  if (repeated.length) errors.push(`Duplicate ${field}: ${repeated.join(", ")}`);
}

for (const product of products) {
  const sourcePath = join(sourceDir, product.sourceFilename);
  const imagePath = join(repoRoot, product.imagePath);
  if (!existsSync(sourcePath)) errors.push(`Missing source: ${sourcePath}`);
  if (!existsSync(imagePath)) {
    errors.push(`Missing gallery image: ${imagePath}`);
    continue;
  }
  const png = inspectPng(imagePath);
  if (png.width !== 1254 || png.height !== 1254) {
    errors.push(`Incorrect dimensions for ${product.imagePath}: ${png.width}x${png.height}`);
  }
  if (product.shortDescription.length < 20 || product.shortDescription.length > 240) {
    errors.push(`Description length out of range for product ${product.number}: ${product.shortDescription.length}`);
  }
  if (product.alt.length < 12 || product.alt.length > 180) {
    errors.push(`Alt length out of range for product ${product.number}: ${product.alt.length}`);
  }
  if (product.purity !== "99.80") errors.push(`Unexpected purity for product ${product.number}`);
  if (!approvedTypes.has(product.utensilType)) errors.push(`Unexpected utensil type for product ${product.number}`);
  if (/handledCup|liddedMug|waterPot|water-pot|water pot|cup-with-handle|silver mug/i.test(
    `${product.title} ${product.slug} ${product.shortDescription} ${product.alt} ${product.utensilType} ${product.imagePath}`,
  )) {
    errors.push(`Legacy customer-facing taxonomy remains in product ${product.number}`);
  }
  if (!(product.weightGrams > 0)) errors.push(`Invalid weight for product ${product.number}`);
  const suppliedDimensions = ["heightInches", "widthInches", "diameterInches"].filter((key) => product[key] !== undefined);
  if (suppliedDimensions.length !== 1) errors.push(`Expected exactly one supplied dimension for product ${product.number}`);
}

const sourceFiles = readdirSync(sourceDir).filter((name) => /\.(jpe?g|png|webp)$/i.test(name));
const galleryFiles = readdirSync(deliveryDir).filter((name) => /\.png$/i.test(name));
if (sourceFiles.length !== 47) errors.push(`Expected 47 source photographs, found ${sourceFiles.length}`);
if (galleryFiles.length !== 47) errors.push(`Expected 47 gallery PNGs, found ${galleryFiles.length}`);

if (errors.length) {
  throw new Error(`Delivery validation failed:\n- ${errors.join("\n- ")}`);
}

writeFileSync(join(deliveryDir, "sanity-utensil-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
writeFileSync(join(deliveryDir, "sanity-utensil-review.csv"), csv);

const prompts = `# Image generation prompt set\n\nMode: built-in image generation/editing with each local source photograph and the approved DDA Silver background supplied as references. Each source was processed as a separate asset.\n\nShared constraints for every product: the real product photograph was the sole source of truth; preserve exact silhouette, proportions, rim, decorative bands, and authentic details; do not redesign, add, or remove ornament; remove the original setup, labels, measurement text, and unrelated reflections; center the product with consistent framing; use the exact approved warm-ivory DDA Silver background with its existing watermark and logo; neutralize color cast while retaining realistic silver reflections and a soft contact shadow; output a clean 1254 x 1254 PNG.\n\nProduct-specific prompts described only the visible category and preservation requirements:\n\n- Bowls: preserve the exact basin depth, straight or rounded wall, rim profile, concentric rings, and brushed/polished finish.\n- Plates: preserve the exact shallow profile, centre, rim width, stepped or ringed edge, and all circular line details.\n- Jugs: preserve the exact body, handle shape and attachment, rim, horizontal lines, and lid where present; never invent a lid or handle.\n- Kalash: preserve the exact rounded belly, narrow neck, flared rolled rim, base, proportions, and every horizontal band; never add a handle or lid.\n`;
writeFileSync(join(deliveryDir, "imagegen-prompts.md"), prompts);

const report = {
  batchId: manifest.batchId,
  validatedAt: new Date().toISOString(),
  valid: true,
  sourcePhotographCount: sourceFiles.length,
  galleryPngCount: galleryFiles.length,
  manifestProductCount: products.length,
  imageDimensions: "1254x1254",
  uniqueFieldsChecked: ["sourceFilename", "number", "id", "title", "slug", "shortDescription", "alt", "reference", "imagePath"],
  sourcePhotographsPreserved: true,
  widthsInferred: false,
  readyForSanityAssetUpload: true,
  readyForProductPublish: true,
  publishBlockers,
};
writeFileSync(join(deliveryDir, "validation-report.json"), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  deliveryDir: relative(repoRoot, deliveryDir).replaceAll("\\", "/"),
  products: products.length,
  galleryPngs: galleryFiles.length,
  sourcePhotographs: sourceFiles.length,
  valid: true,
  publishBlockers,
}, null, 2));
