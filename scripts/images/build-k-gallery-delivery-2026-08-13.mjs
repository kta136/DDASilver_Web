import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const batchId = "k-mixed-gallery-2026-08-13";
const sourceFolder = "C:\\Users\\kk\\Desktop\\k";
const deliveryRoot = "public/images/gallery-ingestion/k-2026-08-13";
const imageRoot = `${deliveryRoot}/images`;
const manifestPath = path.join(projectRoot, deliveryRoot, "sanity-gallery-manifest.json");
const reviewCsvPath = path.join(projectRoot, deliveryRoot, "gallery-review.csv");
const validationPath = path.join(projectRoot, deliveryRoot, "validation-report.json");
const contactSheetPath = path.join(projectRoot, deliveryRoot, "contact-sheet.png");
const uploadManifestPath = path.join(projectRoot, deliveryRoot, "sanity-upload-27-manifest.json");
const publishManifestPath = path.join(projectRoot, deliveryRoot, "sanity-publish-ready-manifest.json");

const confirmedPurity = "92.5";
const purityBlocker = "Owner must confirm the product purity; purity was not supplied with this batch.";
const missingPhysicalMeasurement =
  "Owner must supply the applicable verified physical measurement; none was visible in the source photograph.";
const standaloneDepthSchemaBlocker =
  "Sanity schema mismatch: standalone Singhasan depth has no dedicated field outside category-jhula. The supplied depth is retained as suppliedDepthInches for review and must not be dropped.";
const variantSchemaBlocker =
  "Deferred from upload: the current product schema has no weight-and-height variant model for this Kalash range.";

const rows = [
  {
    source: "WhatsApp Image 2026-08-12 at 3.25.33 PM.jpeg",
    image: "jh-13-fan-crest-peacock-floral-silver-jhula.png",
    reference: "JH-13",
    title: "Fan-Crest Peacock Floral Silver Jhula",
    categoryId: "category-jhula",
    weightGrams: 1815,
    description:
      "An ornate silver jhula weighing 1815 g, with a fan-tail peacock crest, paired peacocks, floral scrollwork and an engraved suspended seat.",
    alt: "Ornate silver jhula with fan-tail peacock crest, floral arch, four supports and engraved suspended seat",
    blockers: [purityBlocker, "Owner must supply the verified singhasan width and depth; they were not visible in the source photograph."],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 3.25.49 PM.jpeg",
    image: "jh-14-swan-seat-peacock-arch-silver-jhula.png",
    reference: "JH-14",
    title: "Swan Seat Peacock Arch Silver Jhula",
    categoryId: "category-jhula",
    weightGrams: 1868,
    description:
      "An ornate silver jhula weighing 1868 g, with a sculpted swan seat back, paired peacocks, fan-tail crest and floral arch.",
    alt: "Silver jhula with sculpted swan seat, paired peacocks, fan-tail crest, four supports and hanging chains",
    blockers: [purityBlocker, "Owner must supply the verified singhasan width and depth; they were not visible in the source photograph."],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 4.04.21 PM.jpeg",
    image: "ny-01-om-shubh-labh-gold-accent-silver-nariyal-3in.png",
    reference: "NY-01",
    previousReference: "SD-11",
    title: "Om Shubh Labh Gold-Accent Silver Nariyal",
    categoryId: "category-gifts",
    weightGrams: 25,
    heightInches: 3,
    description: "A ceremonial silver nariyal with gold-toned accents and auspicious Om and Shubh Labh motifs. Weight: 25 g; height: 3 in.",
    alt: "Coconut-shaped silver nariyal with gold-toned neck, Om and Shubh Labh motifs",
    blockers: [purityBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 4.05.39 PM.jpeg",
    image: "ny-02-shubh-om-gold-panel-silver-nariyal-3in.png",
    reference: "NY-02",
    previousReference: "SD-12",
    title: "Shubh Om Gold-Panel Silver Nariyal",
    categoryId: "category-gifts",
    weightGrams: 25,
    heightInches: 3,
    description: "A compact ceremonial silver nariyal with a gold-toned upper panel, engraved Shubh and Om motifs and a polished centre band. Weight: 25 g; height: 3 in.",
    alt: "Compact coconut-shaped silver nariyal with gold-toned panel and engraved Shubh and Om motifs",
    blockers: [purityBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 4.06.41 PM.jpeg",
    image: "ny-03-swastik-om-gold-accent-silver-nariyal-4in.png",
    reference: "NY-03",
    previousReference: "SD-13",
    title: "Swastik Om Gold-Accent Silver Nariyal",
    categoryId: "category-gifts",
    weightGrams: 45,
    heightInches: 4,
    description: "A ceremonial silver nariyal with a gold-toned neck, Swastik upper panel and Om lower panel. Weight: 45 g; height: 4 in.",
    alt: "Coconut-shaped silver nariyal with gold-toned neck and Swastik and Om panels",
    blockers: [purityBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 4.07.12 PM.jpeg",
    image: "ny-04-shubh-om-fine-line-silver-nariyal-4in.png",
    reference: "NY-04",
    previousReference: "SD-14",
    title: "Shubh Om Fine-Line Silver Nariyal",
    categoryId: "category-gifts",
    weightGrams: 45,
    heightInches: 4,
    description: "A ceremonial silver nariyal with fine-line Shubh and Om motifs, a gold-toned neck and polished centre band. Weight: 45 g; height: 4 in.",
    alt: "Coconut-shaped silver nariyal with fine-line Shubh and Om motifs and gold-toned neck",
    blockers: [purityBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 4.08.56 PM.jpeg",
    image: "ny-05-auspicious-script-gold-neck-silver-nariyal-5in.png",
    reference: "NY-05",
    previousReference: "SD-15",
    title: "Auspicious Script Gold-Neck Silver Nariyal",
    categoryId: "category-gifts",
    weightGrams: 65,
    heightInches: 5,
    description: "A tall ceremonial silver nariyal with a gold-toned neck, finely engraved auspicious script and a polished centre band. Weight: 65 g; height: 5 in.",
    alt: "Tall coconut-shaped silver nariyal with gold-toned neck and engraved auspicious script",
    blockers: [purityBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 4.10.28 PM.jpeg",
    image: "ny-06-om-swastik-gold-band-silver-nariyal-5in.png",
    reference: "NY-06",
    previousReference: "SD-16",
    title: "Om Swastik Gold-Band Silver Nariyal",
    categoryId: "category-gifts",
    weightGrams: 65,
    heightInches: 5,
    description: "A tall ceremonial silver nariyal with gold-toned Om and Swastik motifs and a broad polished centre band. Weight: 65 g; height: 5 in.",
    alt: "Tall coconut-shaped silver nariyal with gold-toned Om and Swastik motifs and polished centre band",
    blockers: [purityBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 4.16.15 PM.jpeg",
    image: "ny-07-large-swastik-om-silver-nariyal-6in.png",
    reference: "NY-07",
    previousReference: "SD-17",
    title: "Large Swastik Om Silver Nariyal",
    categoryId: "category-gifts",
    weightGrams: 100,
    heightInches: 6,
    description: "A large ceremonial silver nariyal with an engraved Swastik upper panel, Om lower panel and wide centre band. Weight: 100 g; height: 6 in.",
    alt: "Large coconut-shaped silver nariyal with engraved Swastik and Om panels",
    blockers: [purityBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 4.16.36 PM.jpeg",
    image: "ny-08-large-gold-neck-swastik-om-silver-nariyal-6in.png",
    reference: "NY-08",
    previousReference: "SD-18",
    title: "Large Gold-Neck Swastik Om Silver Nariyal",
    categoryId: "category-gifts",
    weightGrams: 100,
    heightInches: 6,
    description: "A large ceremonial silver nariyal with a gold-toned neck, Swastik and Om panels and polished centre band. Weight: 100 g; height: 6 in.",
    alt: "Large coconut-shaped silver nariyal with gold-toned neck, Swastik upper panel and Om lower panel",
    blockers: [purityBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 5.05.13 PM.jpeg",
    image: "jh-15-bal-krishna-lotus-decorated-silver-jhula.png",
    reference: "JH-15",
    title: "Bal Krishna Lotus Decorated Silver Jhula",
    categoryId: "category-jhula",
    weightGrams: 135,
    description: "A decorated silver jhula display weighing 135 g, with Bal Krishna artwork, lotus accents, pearl borders, flowers, lights and a peacock feather.",
    alt: "Decorated silver jhula with Bal Krishna artwork, lotus accents, pearl borders, flowers and peacock feather",
    blockers: [purityBlocker, "Owner must supply the verified singhasan width and depth; they were not visible in the source photograph."],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 5.06.49 PM.jpeg",
    image: "jh-16-yashoda-bal-krishna-peacock-decorated-silver-jhula.png",
    reference: "JH-16",
    title: "Yashoda Bal Krishna Peacock Decorated Silver Jhula",
    categoryId: "category-jhula",
    weightGrams: 300,
    description: "A decorated silver jhula display weighing 300 g, with Yashoda and Bal Krishna artwork, peacock-feather crest, flowers, butterflies and lights.",
    alt: "Decorated silver jhula with Yashoda and Bal Krishna artwork, peacock feathers, flowers and butterflies",
    blockers: [purityBlocker, "Owner must supply the verified singhasan width and depth; they were not visible in the source photograph."],
  },
  {
    source: "WhatsApp Image 2026-08-12 at 5.08.54 PM.jpeg",
    image: "jh-17-radha-krishna-lotus-decorated-silver-jhula.png",
    reference: "JH-17",
    title: "Radha Krishna Lotus Decorated Silver Jhula",
    categoryId: "category-jhula",
    weightGrams: 215,
    description: "A decorated silver jhula display weighing 215 g, with Radha Krishna artwork, lotus ornaments, pearl strands, flowers, butterfly and peacock crest.",
    alt: "Decorated silver jhula with Radha Krishna artwork, lotus ornaments, pearl strands and large white flowers",
    blockers: [purityBlocker, "Owner must supply the verified singhasan width and depth; they were not visible in the source photograph."],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 1.00.11 PM.jpeg",
    image: "97-flared-rim-linear-band-silver-lota-2in.png",
    reference: "DDA-UT-KL-97",
    title: "Flared-Rim Linear-Band Silver Lota",
    categoryId: "category-utensils",
    utensilType: "kalash",
    purity: "99.80",
    weightGrams: 25,
    heightInches: 2,
    availabilityVariants: [
      { weightGrams: 25, heightInches: 2 },
      { weightGrams: 40, heightInches: 2.3 },
      { weightGrams: 50, heightInches: 2.5 },
      { weightGrams: 75, heightInches: 2.8 },
      { weightGrams: 100, heightInches: 3 },
      { weightGrams: 125, heightInches: 3.5 },
      { weightGrams: 150, heightInches: 4 },
    ],
    description: "A 99.80% silver lota range with a flared rim, tapered neck, brushed body and fine polished bands, available in seven supplied weight-and-height sizes.",
    alt: "Compact silver lota with flared rim, tapered neck and fine horizontal bands",
    blockers: [variantSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 1.26.46 PM.jpeg",
    image: "98-bulbous-shoulder-linear-band-silver-lota.png",
    reference: "DDA-UT-KL-98",
    title: "Bulbous-Shoulder Linear-Band Silver Lota",
    categoryId: "category-utensils",
    utensilType: "kalash",
    purity: "99.80",
    availabilityVariants: [
      { weightGrams: 15, heightInches: 1.5 },
      { weightGrams: 25, heightInches: 2 },
      { weightGrams: 50, heightInches: 2.3 },
      { weightGrams: 75, heightInches: 2.5 },
      { weightGrams: 100, heightInches: 3 },
      { weightGrams: 125, heightInches: 3.2 },
      { weightGrams: 150, heightInches: 3.5 },
      { weightGrams: 200, heightInches: 4 },
      { weightGrams: 250, heightInches: 4.2 },
      { weightGrams: 300, heightInches: 4.5 },
      { weightGrams: 400, heightInches: 5 },
      { weightGrams: 500, heightInches: 5.5 },
    ],
    description: "A 99.80% silver lota range with a broad flared rim, stepped neck, polished bulbous shoulder and brushed lower body, available in twelve supplied sizes.",
    alt: "Rounded silver lota with broad flared rim, bulbous polished shoulder and brushed linear-band body",
    blockers: [variantSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 3.28.06 PM.jpeg",
    image: "99-ornate-paisley-six-piece-silver-pudding-set.png",
    reference: "DDA-UT-BW-99",
    title: "Ornate Paisley Six-Piece Silver Pudding Set",
    categoryId: "category-utensils",
    utensilType: "bowl",
    weightGrams: 550,
    description: "A six-piece silver pudding set weighing 550 g, with one large pedestal bowl and five footed bowls decorated in paisley, floral and crosshatch panels.",
    alt: "Six-piece silver pudding set with one large pedestal bowl and five ornate paisley footed bowls",
    blockers: [purityBlocker, missingPhysicalMeasurement],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 3.33.59 PM.jpeg",
    image: "100-scalloped-floral-six-piece-silver-pudding-set.png",
    reference: "DDA-UT-BW-100",
    title: "Scalloped Floral Six-Piece Silver Pudding Set",
    categoryId: "category-utensils",
    utensilType: "bowl",
    weightGrams: 650,
    description: "A six-piece silver pudding set weighing 650 g, with one large pedestal bowl and five footed bowls featuring scalloped rims, beaded edges and floral panels.",
    alt: "Six-piece silver pudding set with scalloped rims, one large pedestal bowl and five smaller footed bowls",
    blockers: [purityBlocker, missingPhysicalMeasurement],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 3.40.40 PM.jpeg",
    image: "101-leaf-panel-five-piece-silver-pudding-set.png",
    reference: "DDA-UT-BW-101",
    title: "Leaf-Panel Five-Piece Silver Pudding Set",
    categoryId: "category-utensils",
    utensilType: "bowl",
    weightGrams: 600,
    description: "A five-piece silver pudding set weighing 600 g, with one large pedestal bowl and four smaller footed bowls decorated with repeated leaf panels.",
    alt: "Five-piece silver pudding set with one large pedestal bowl and four leaf-panel footed bowls",
    blockers: [purityBlocker, missingPhysicalMeasurement],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 3.49.13 PM.jpeg",
    image: "sg-01-twin-peacock-om-floral-silver-singhasan-8x6.png",
    reference: "SG-01",
    title: "Twin Peacock Om Floral Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 500,
    suppliedSizeLabel: "8/6",
    widthInches: 8,
    suppliedDepthInches: 6,
    description: "An ornate silver singhasan weighing 500 g, with twin peacocks, Om back panel and floral seat. Supplied size: 8 × 6 in.",
    alt: "Rectangular silver singhasan with twin peacocks, Om back panel, pierced rails and engraved floral seat",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 3.51.01 PM.jpeg",
    image: "sg-02-twin-peacock-om-round-silver-singhasan-8x6.png",
    reference: "SG-02",
    title: "Twin Peacock Om Round Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 500,
    suppliedSizeLabel: "8/6",
    widthInches: 8,
    suppliedDepthInches: 6,
    description: "A round silver singhasan weighing 500 g, with twin peacocks, Om back panel, pierced guard rail and floral seat. Supplied size: 8 × 6 in.",
    alt: "Round silver singhasan with twin peacocks, Om back panel, pierced circular rail and floral seat",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 3.52.58 PM.jpeg",
    image: "sg-03-floral-crown-rectangular-silver-singhasan-5x6.png",
    reference: "SG-03",
    title: "Floral Crown Rectangular Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 350,
    suppliedSizeLabel: "5/6 inch",
    widthInches: 5,
    suppliedDepthInches: 6,
    description: "A rectangular silver singhasan weighing 350 g, with a layered floral-crown back, pierced rails and engraved seat. Supplied size: 5 × 6 in.",
    alt: "Rectangular silver singhasan with layered floral crown, pierced rails and densely engraved seat",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 3.55.21 PM.jpeg",
    image: "sg-04-round-floral-back-silver-singhasan-7x5.png",
    reference: "SG-04",
    title: "Round Floral-Back Antique Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 300,
    suppliedSizeLabel: "7/5 inch",
    widthInches: 7,
    suppliedDepthInches: 5,
    description: "A round antique-finish silver singhasan weighing 300 g, with a pointed floral back and raised engraved seat. Supplied size: 7 × 5 in.",
    alt: "Round antique-finish silver singhasan with pointed floral back, raised engraved seat and leaf border",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 4.00.04 PM.jpeg",
    image: "sg-05-gold-accent-arched-throne-silver-singhasan-10x8.png",
    reference: "SG-05",
    title: "Gold-Accent Arched Throne Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 1700,
    suppliedSizeLabel: "10/8 inch",
    widthInches: 10,
    suppliedDepthInches: 8,
    description: "A silver singhasan weighing 1700 g, with a gold-toned arched back, coloured floral reliefs, canopy and bolsters. Supplied size: 10 × 8 in.",
    alt: "Gold-accent silver singhasan with coloured arched back, suspended canopy, bolsters and engraved platform",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 4.04.22 PM.jpeg",
    image: "sg-06-green-blue-peacock-enamel-silver-singhasan-8x5-5.png",
    reference: "SG-06",
    title: "Green Blue Peacock Enamel Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 800,
    suppliedSizeLabel: "8/5.5 inch",
    widthInches: 8,
    suppliedDepthInches: 5.5,
    description: "A round silver singhasan weighing 800 g, with green-and-gold fan-tail, blue peacock, cream floral seat and peacock-form legs. Supplied size: 8 × 5.5 in.",
    alt: "Round silver singhasan with green and blue enamel peacock fan, cream floral seat and peacock-form legs",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 4.12.42 PM.jpeg",
    image: "sg-07-fan-tail-peacock-silver-singhasan-9x7.png",
    reference: "SG-07",
    title: "Fan-Tail Peacock Round Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 600,
    suppliedSizeLabel: "9/7 inch",
    widthInches: 9,
    suppliedDepthInches: 7,
    description: "A round silver singhasan weighing 600 g, with a layered fan-tail peacock back, pierced rail and floral seat. Supplied size: 9 × 7 in.",
    alt: "Round silver singhasan with layered fan-tail peacock back, pierced guard rail and engraved floral seat",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 4.19.16 PM.jpeg",
    image: "sg-08-gold-accent-arched-silver-singhasan-7x7.png",
    reference: "SG-08",
    title: "Gold-Accent Arched Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 650,
    suppliedSizeLabel: "7/7 inch",
    widthInches: 7,
    suppliedDepthInches: 7,
    description: "A rectangular silver singhasan weighing 650 g, with a gold-accented pointed arch, palm reliefs, bolsters and floral border. Supplied size: 7 × 7 in.",
    alt: "Rectangular silver singhasan with gold-accented arch, palm reliefs, bolsters and floral front border",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 4.21.24 PM.jpeg",
    image: "sg-09-canopy-palm-floral-antique-silver-singhasan-10x8.png",
    reference: "SG-09",
    title: "Canopy Palm Floral Antique Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 1050,
    suppliedSizeLabel: "10/8 inch",
    widthInches: 10,
    suppliedDepthInches: 8,
    description: "An antique-finish silver singhasan weighing 1050 g, with palm and floral back, suspended canopy, bolsters and engraved platform. Supplied size: 10 × 8 in.",
    alt: "Antique-finish silver singhasan with palm and floral reliefs, suspended canopy, bolsters and platform",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 4.57.06 PM.jpeg",
    image: "sg-10-lakshmi-peacock-tiered-silver-singhasan-10x10.png",
    reference: "SG-10",
    title: "Lakshmi Peacock Tiered Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 1175,
    suppliedSizeLabel: "10/10 inch",
    widthInches: 10,
    suppliedDepthInches: 10,
    description: "A three-tier silver singhasan weighing 1175 g, with seated Lakshmi relief, paired peacocks, pierced rails and floral scrollwork. Supplied size: 10 × 10 in.",
    alt: "Three-tier silver singhasan with seated Lakshmi relief, paired peacocks, pierced rails and floral scrollwork",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
  {
    source: "WhatsApp Image 2026-08-13 at 5.00.21 PM.jpeg",
    image: "sg-11-grand-columned-canopy-silver-singhasan-9x7.png",
    reference: "SG-11",
    title: "Grand Columned Canopy Silver Singhasan",
    categoryId: "category-gifts",
    weightGrams: 2500,
    suppliedSizeLabel: "9/7 inch",
    widthInches: 9,
    suppliedDepthInches: 7,
    description: "A grand silver-and-gold singhasan weighing 2500 g, with spiral columns, openwork arch, inner throne and suspended canopy. Supplied size: 9 × 7 in.",
    alt: "Grand silver-and-gold singhasan with spiral columns, openwork arch, inner throne and hanging canopy",
    blockers: [purityBlocker, standaloneDepthSchemaBlocker],
  },
];

const ownerConfirmedPurityReferences = new Set(
  rows
    .filter(
      (row) =>
        row.categoryId === "category-jhula" ||
        row.reference.startsWith("DDA-UT-BW-") ||
        row.reference.startsWith("NY-") ||
        row.reference.startsWith("SG-"),
    )
    .map((row) => row.reference),
);

function slugify(value) {
  return value
    .toLowerCase()
    .replaceAll("&", " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const products = rows.map((row, index) => {
  const slug = slugify(row.title);
  const purity = row.purity ??
    (ownerConfirmedPurityReferences.has(row.reference) ? confirmedPurity : undefined);
  const hasConfirmedPurity = purity !== undefined;
  return {
    number: index + 1,
    id: `product-dda-${slug}`,
    reference: row.reference,
    ...(row.previousReference ? { previousReference: row.previousReference } : {}),
    title: row.title,
    slug,
    shortDescription: hasConfirmedPurity
      ? `${row.description.replace(/\.$/, "")}. Purity: ${purity}%.`
      : row.description,
    alt: row.alt,
    categoryId: row.categoryId,
    ...(hasConfirmedPurity ? { purity } : {}),
    ...(row.utensilType ? { utensilType: row.utensilType } : {}),
    ...(row.weightGrams ? { weightGrams: row.weightGrams } : {}),
    ...(row.heightInches ? { heightInches: row.heightInches } : {}),
    ...(row.widthInches ? { widthInches: row.widthInches } : {}),
    ...(row.suppliedSizeLabel ? { suppliedSizeLabel: row.suppliedSizeLabel } : {}),
    ...(row.suppliedDepthInches ? { suppliedDepthInches: row.suppliedDepthInches } : {}),
    ...(row.availabilityVariants ? { availabilityVariants: row.availabilityVariants } : {}),
    sourcePath: path.join(sourceFolder, row.source),
    imagePath: `${imageRoot}/${row.image}`,
    publishBlockers: hasConfirmedPurity
      ? row.blockers.filter((blocker) => blocker !== purityBlocker)
      : row.blockers,
  };
});

const confirmedPurityProducts = products.filter((product) => product.purity === confirmedPurity);
const unresolvedPurityProducts = products.filter((product) => product.purity === undefined);
const blockedProspectiveProducts = products.filter(
  (product) => product.purity === undefined || product.publishBlockers.length > 0,
);
const publishReadyProspectiveProducts = products.filter(
  (product) => product.purity !== undefined && product.publishBlockers.length === 0,
);
const excludedUploadReferences = new Set(["DDA-UT-KL-97", "DDA-UT-KL-98"]);
const renumberProducts = (selectedProducts) =>
  selectedProducts.map((product, index) => ({
    ...product,
    originalNumber: product.number,
    number: index + 1,
  }));
const uploadProducts = renumberProducts(
  products.filter((product) => !excludedUploadReferences.has(product.reference)),
);
const publishProducts = renumberProducts(
  products.filter(
    (product) =>
      !excludedUploadReferences.has(product.reference) && product.publishBlockers.length === 0,
  ),
);

function readPngDimensions(filePath) {
  const bytes = fs.readFileSync(filePath).subarray(0, 24);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length !== 24 || !bytes.subarray(0, 8).equals(signature)) {
    throw new Error(`Not a readable PNG: ${filePath}`);
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
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

const categoryCounts = Object.fromEntries(
  [...new Set(products.map((product) => product.categoryId))].map((categoryId) => [
    categoryId,
    products.filter((product) => product.categoryId === categoryId).length,
  ]),
);

const fullBatchPublishBlockers = [
  ...(unresolvedPurityProducts.length > 0
    ? [
        `Owner confirmation of purity is still required for ${unresolvedPurityProducts.length} products: ${unresolvedPurityProducts.map((product) => product.reference).join(", ")}.`,
      ]
    : []),
  "Standalone Singhasan depth is unsupported by the current product schema outside category-jhula; 11 supplied depths are retained in suppliedDepthInches.",
  "JH-13 through JH-17 require verified singhasan width and depth.",
  "DDA-UT-KL-97 and DDA-UT-KL-98 are deferred because the current schema has no weight-and-height variant model.",
  "DDA-UT-BW-99 through DDA-UT-BW-101 require an applicable verified physical measurement.",
];

const manifest = {
  schemaVersion: 1,
  batchId,
  sourceDirectory: sourceFolder,
  sourceFolder,
  sourceCount: products.length,
  finalImageCount: products.length,
  categoryCounts,
  approvedBackgroundPath: "public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png",
  approvedTreatmentReferencePath: `${deliveryRoot}/approval/jh-13-fan-crest-peacock-floral-silver-jhula-approval.png`,
  backgroundPath: "public/images/product-backgrounds/dda-silver-warm-ivory-watermark-1254.png",
  generatedWith: "Built-in image generation tool; one AI compositing edit per source photograph",
  ownerConfirmedPurity: {
    defaultPurity: confirmedPurity,
    confirmedProductTypes: ["Jhula", "Singhasan", "Nariyal", "Pudding bowl set"],
    matchedReferences: confirmedPurityProducts.map((product) => product.reference),
    exceptions: [
      {
        references: ["DDA-UT-KL-97", "DDA-UT-KL-98"],
        purity: "99.80",
        uploadStatus: "deferred",
      },
    ],
    note: "The eight products originally labelled SD-11 through SD-18 were corrected to Nariyal references NY-01 through NY-08. All products except deferred KL-97 and KL-98 use owner-confirmed 92.5% purity; the two deferred Kalash ranges use 99.80%.",
  },
  readyForSanityAssetUpload: true,
  readyForProductPublish: false,
  publishBlockers: fullBatchPublishBlockers,
  products,
};

const uploadManifest = {
  ...manifest,
  sourceCount: uploadProducts.length,
  finalImageCount: uploadProducts.length,
  categoryCounts: Object.fromEntries(
    [...new Set(uploadProducts.map((product) => product.categoryId))].map((categoryId) => [
      categoryId,
      uploadProducts.filter((product) => product.categoryId === categoryId).length,
    ]),
  ),
  uploadScope: {
    purpose: "Sanity asset upload for approved products",
    excludedReferences: [...excludedUploadReferences],
  },
  products: uploadProducts,
};

const publishManifest = {
  ...manifest,
  sourceCount: publishProducts.length,
  finalImageCount: publishProducts.length,
  categoryCounts: Object.fromEntries(
    [...new Set(publishProducts.map((product) => product.categoryId))].map((categoryId) => [
      categoryId,
      publishProducts.filter((product) => product.categoryId === categoryId).length,
    ]),
  ),
  readyForProductPublish: true,
  publishBlockers: [],
  publishScope: {
    purpose: "Publish only blocker-free products from the approved upload scope",
    excludedReferences: [...excludedUploadReferences],
    deferredReferences: uploadProducts
      .filter((product) => product.publishBlockers.length > 0)
      .map((product) => product.reference),
  },
  products: publishProducts,
};

const headers = [
  "number",
  "sourcePath",
  "imagePath",
  "reference",
  "previousReference",
  "title",
  "categoryId",
  "utensilType",
  "purity",
  "weightGrams",
  "heightInches",
  "widthInches",
  "diameterInches",
  "suppliedSizeLabel",
  "suppliedDepthInches",
  "shortDescription",
  "alt",
  "publishBlockers",
  "readyForSanityAssetUpload",
  "readyForProductPublish",
];

function csv(value) {
  const text = Array.isArray(value) ? value.join(" | ") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

const csvRows = products.map((product) =>
  headers
    .map((header) => {
      if (header === "readyForSanityAssetUpload") return csv(true);
      if (header === "readyForProductPublish") return csv(false);
      return csv(product[header]);
    })
    .join(","),
);

const sourceFiles = fs.readdirSync(sourceFolder).filter((name) => /\.jpe?g$/i.test(name));
const imageFiles = fs
  .readdirSync(path.join(projectRoot, imageRoot))
  .filter((name) => name.endsWith(".png"));
const imageDetails = products.map((product) => {
  const absolutePath = path.join(projectRoot, product.imagePath);
  return {
    reference: product.reference,
    imagePath: product.imagePath,
    ...readPngDimensions(absolutePath),
    bytes: fs.statSync(absolutePath).size,
    sha256: sha256(absolutePath),
  };
});
const validationErrors = [];
if (sourceFiles.length !== products.length) {
  validationErrors.push(`Source count ${sourceFiles.length} does not match product count ${products.length}.`);
}
if (imageFiles.length !== products.length) {
  validationErrors.push(`Image count ${imageFiles.length} does not match product count ${products.length}.`);
}
for (const product of products) {
  if (!fs.existsSync(product.sourcePath)) validationErrors.push(`Missing source: ${product.sourcePath}`);
  if (!fs.existsSync(path.join(projectRoot, product.imagePath))) {
    validationErrors.push(`Missing image: ${product.imagePath}`);
  }
}
for (const detail of imageDetails) {
  if (detail.width !== 1254 || detail.height !== 1254) {
    validationErrors.push(`${detail.imagePath} is ${detail.width}x${detail.height}; expected 1254x1254.`);
  }
}
for (const field of ["id", "reference", "title", "slug", "shortDescription", "alt", "sourcePath", "imagePath"]) {
  const repeated = duplicates(products.map((product) => product[field]));
  if (repeated.length > 0) validationErrors.push(`${field} has duplicates: ${repeated.join(", ")}`);
}
for (const product of products) {
  if (product.shortDescription.length < 20 || product.shortDescription.length > 240) {
    validationErrors.push(`${product.reference} shortDescription is outside 20-240 characters.`);
  }
  if (product.alt.length < 12 || product.alt.length > 180) {
    validationErrors.push(`${product.reference} alt is outside 12-180 characters.`);
  }
  if (ownerConfirmedPurityReferences.has(product.reference) && product.purity !== confirmedPurity) {
    validationErrors.push(`${product.reference} must retain the owner-confirmed ${confirmedPurity}% purity.`);
  }
  if (product.purity === confirmedPurity && product.publishBlockers.includes(purityBlocker)) {
    validationErrors.push(`${product.reference} has confirmed purity but still carries the purity blocker.`);
  }
  if (product.availabilityVariants) {
    for (const [variantIndex, variant] of product.availabilityVariants.entries()) {
      if (!(variant.weightGrams > 0) || !(variant.heightInches > 0)) {
        validationErrors.push(
          `${product.reference} availability variant ${variantIndex + 1} must have positive weight and height.`,
        );
      }
    }
  }
}
if (uploadProducts.length !== 27) {
  validationErrors.push(`Upload manifest contains ${uploadProducts.length} products; expected 27.`);
}
if (publishProducts.some((product) => product.publishBlockers.length > 0)) {
  validationErrors.push("Publish manifest contains a product with unresolved blockers.");
}
if (publishProducts.some((product) => excludedUploadReferences.has(product.reference))) {
  validationErrors.push("Publish manifest contains a deferred KL-97 or KL-98 product.");
}

const validation = {
  batchId,
  generatedAt: new Date().toISOString(),
  status: validationErrors.length === 0 ? "passed-with-publish-blockers" : "failed",
  counts: {
    sources: sourceFiles.length,
    images: imageFiles.length,
    manifestProducts: products.length,
    categories: categoryCounts,
  },
  readiness: {
    readyForSanityAssetUpload: true,
    readyForProductPublish: false,
  },
  integrityChecks: {
    allImagesAre1254SquarePng: imageDetails.every(
      ({ width, height }) => width === 1254 && height === 1254,
    ),
    oneSourcePerProduct: new Set(products.map((product) => product.sourcePath)).size === products.length,
    oneImagePerProduct: new Set(products.map((product) => product.imagePath)).size === products.length,
    uniqueReferences: new Set(products.map((product) => product.reference)).size === products.length,
    uniqueTitles: new Set(products.map((product) => product.title)).size === products.length,
    uniqueSlugs: new Set(products.map((product) => product.slug)).size === products.length,
    uniqueDescriptions:
      new Set(products.map((product) => product.shortDescription)).size === products.length,
    uniqueAltText: new Set(products.map((product) => product.alt)).size === products.length,
  },
  sanityDryRun: {
    status: "blocked-by-remaining-publish-blockers",
    validProspectiveImageAssets: products.length,
    publishReadyProspectiveProducts: publishReadyProspectiveProducts.length,
    blockedProspectiveProducts: blockedProspectiveProducts.length,
    confirmedPurityProducts: confirmedPurityProducts.length,
    unresolvedPurityProducts: unresolvedPurityProducts.length,
    uploadProducts: uploadProducts.length,
    excludedUploadReferences: [...excludedUploadReferences],
    reason: `${uploadProducts.length} products are approved for Sanity asset upload. KL-97 and KL-98 remain deferred. ${publishProducts.length} blocker-free products are ready for product publication; all other confirmed products retain their measurement or schema blockers.`,
    noSanityWritesPerformedDuringLocalValidation: true,
  },
  blockers: manifest.publishBlockers,
  errors: validationErrors,
  images: imageDetails,
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
fs.writeFileSync(uploadManifestPath, `${JSON.stringify(uploadManifest, null, 2)}\n`);
fs.writeFileSync(publishManifestPath, `${JSON.stringify(publishManifest, null, 2)}\n`);
fs.writeFileSync(reviewCsvPath, `${headers.map(csv).join(",")}\n${csvRows.join("\n")}\n`);
fs.writeFileSync(validationPath, `${JSON.stringify(validation, null, 2)}\n`);

const tileSize = 220;
const columns = 5;
const rowsCount = Math.ceil(products.length / columns);
const contactSheetLayers = await Promise.all(
  products.map(async (product, index) => {
    const thumbnail = await sharp(path.join(projectRoot, product.imagePath))
      .resize(200, 185, { fit: "contain", background: "#f7f3ee" })
      .png()
      .toBuffer();
    const label = Buffer.from(
      `<svg width="200" height="25"><rect width="200" height="25" fill="#f7f3ee"/><text x="100" y="17" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#27211d">${product.reference}</text></svg>`,
    );
    return [
      {
        input: thumbnail,
        left: (index % columns) * tileSize + 10,
        top: Math.floor(index / columns) * tileSize + 5,
      },
      {
        input: label,
        left: (index % columns) * tileSize + 10,
        top: Math.floor(index / columns) * tileSize + 190,
      },
    ];
  }),
);
await sharp({
  create: {
    width: columns * tileSize,
    height: rowsCount * tileSize,
    channels: 3,
    background: "#f7f3ee",
  },
})
  .composite(contactSheetLayers.flat())
  .png()
  .toFile(contactSheetPath);

console.log(`Wrote ${path.relative(projectRoot, manifestPath)}`);
console.log(`Wrote ${path.relative(projectRoot, uploadManifestPath)}`);
console.log(`Wrote ${path.relative(projectRoot, publishManifestPath)}`);
console.log(`Wrote ${path.relative(projectRoot, reviewCsvPath)}`);
console.log(`Wrote ${path.relative(projectRoot, validationPath)}`);
console.log(`Wrote ${path.relative(projectRoot, contactSheetPath)}`);
