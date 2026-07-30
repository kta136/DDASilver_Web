import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-30" });

const categoryId = "category-coin";
const applyChanges = process.argv.includes("--apply");
const overwriteExisting = process.argv.includes("--overwrite");
const shapeArgument = process.argv.find((argument) =>
  argument.startsWith("--shape="),
);
const seriesArgument = process.argv.find((argument) =>
  argument.startsWith("--series="),
);

type ManagedCoinShape = "round" | "oval" | "square" | "rectangle";
type ManagedCoinSeries = "classic" | "lakshmi-ganesh" | "design-10g";
type ManagedCoinDesign = {
  id: string;
  key: string;
  title: string;
  slug: string;
  reference: string;
  description: string;
  alt: string;
};
type CoinProduct = {
  weight: number;
  shape: ManagedCoinShape;
  series?: ManagedCoinSeries;
  design?: ManagedCoinDesign;
  displayOrder: number;
  imagePath: string;
};

const coinProducts = [
  {
    weight: 10,
    shape: "round",
    displayOrder: 10,
    imagePath:
      "public/images/silver-coins/silver-coin-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 20,
    shape: "round",
    displayOrder: 20,
    imagePath:
      "public/images/silver-coins/silver-coin-20g-front-back-neutral-watermark.png",
  },
  {
    weight: 50,
    shape: "round",
    displayOrder: 30,
    imagePath:
      "public/images/silver-coins/silver-coin-50g-front-back-neutral-watermark.png",
  },
  {
    weight: 100,
    shape: "round",
    displayOrder: 40,
    imagePath:
      "public/images/silver-coins/silver-coin-100g-front-back-neutral-watermark.png",
  },
  {
    weight: 250,
    shape: "round",
    displayOrder: 50,
    imagePath:
      "public/images/silver-coins/silver-coin-250g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "oval",
    displayOrder: 60,
    imagePath:
      "public/images/silver-coins/silver-coin-oval-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 20,
    shape: "oval",
    displayOrder: 70,
    imagePath:
      "public/images/silver-coins/silver-coin-oval-20g-front-back-neutral-watermark.png",
  },
  {
    weight: 25,
    shape: "oval",
    displayOrder: 80,
    imagePath:
      "public/images/silver-coins/silver-coin-oval-25g-front-back-neutral-watermark.png",
  },
  {
    weight: 50,
    shape: "oval",
    displayOrder: 90,
    imagePath:
      "public/images/silver-coins/silver-coin-oval-50g-front-back-neutral-watermark.png",
  },
  {
    weight: 100,
    shape: "oval",
    displayOrder: 100,
    imagePath:
      "public/images/silver-coins/silver-coin-oval-100g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "rectangle",
    displayOrder: 110,
    imagePath:
      "public/images/silver-coins/silver-coin-rectangle-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 20,
    shape: "rectangle",
    displayOrder: 120,
    imagePath:
      "public/images/silver-coins/silver-coin-rectangle-20g-front-back-neutral-watermark.png",
  },
  {
    weight: 50,
    shape: "rectangle",
    displayOrder: 130,
    imagePath:
      "public/images/silver-coins/silver-coin-rectangle-50g-front-back-neutral-watermark.png",
  },
  {
    weight: 100,
    shape: "rectangle",
    displayOrder: 140,
    imagePath:
      "public/images/silver-coins/silver-coin-rectangle-100g-front-back-neutral-watermark.png",
  },
  {
    weight: 250,
    shape: "rectangle",
    displayOrder: 150,
    imagePath:
      "public/images/silver-coins/silver-coin-rectangle-250g-front-back-neutral-watermark.png",
  },
  {
    weight: 500,
    shape: "rectangle",
    displayOrder: 160,
    imagePath:
      "public/images/silver-coins/silver-coin-rectangle-500g-front-back-neutral-watermark.png",
  },
  {
    weight: 1000,
    shape: "rectangle",
    displayOrder: 170,
    imagePath:
      "public/images/silver-coins/silver-coin-rectangle-1000g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "round",
    series: "lakshmi-ganesh",
    displayOrder: 180,
    imagePath:
      "public/images/silver-coins/silver-coin-lakshmi-ganesh-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 20,
    shape: "round",
    series: "lakshmi-ganesh",
    displayOrder: 190,
    imagePath:
      "public/images/silver-coins/silver-coin-lakshmi-ganesh-20g-front-back-neutral-watermark.png",
  },
  {
    weight: 50,
    shape: "round",
    series: "lakshmi-ganesh",
    displayOrder: 200,
    imagePath:
      "public/images/silver-coins/silver-coin-lakshmi-ganesh-50g-front-back-neutral-watermark.png",
  },
  {
    weight: 100,
    shape: "round",
    series: "lakshmi-ganesh",
    displayOrder: 210,
    imagePath:
      "public/images/silver-coins/silver-coin-lakshmi-ganesh-100g-front-back-neutral-watermark.png",
  },
  {
    weight: 250,
    shape: "round",
    series: "lakshmi-ganesh",
    displayOrder: 220,
    imagePath:
      "public/images/silver-coins/silver-coin-lakshmi-ganesh-250g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "square",
    series: "design-10g",
    design: {
      id: "product-dda-10g-square-lakshmi-ganesh-silver-coin",
      key: "square-lakshmi-ganesh",
      title: "DDA 10 Gram Square Lakshmi Ganesh Silver Coin",
      slug: "dda-10-gram-square-lakshmi-ganesh-silver-coin",
      reference: "DDA-COIN-10G-SQUARE-LAKSHMI-GANESH",
      description:
        "A 10 gram square DDA silver coin in 99.80% purity, featuring Lakshmi and Ganesh on the front and a Tree of Life reverse.",
      alt: "Front and reverse views of the square 10 gram DDA Lakshmi Ganesh silver coin",
    },
    displayOrder: 230,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-square-lakshmi-ganesh-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "round",
    series: "design-10g",
    design: {
      id: "product-dda-10g-round-tree-of-life-silver-coin",
      key: "round-tree-of-life",
      title: "DDA 10 Gram Round Tree of Life Silver Coin",
      slug: "dda-10-gram-round-tree-of-life-silver-coin",
      reference: "DDA-COIN-10G-ROUND-TREE-OF-LIFE",
      description:
        "A 10 gram round DDA silver coin in 99.80% purity, featuring a Tree of Life design with its branded reverse.",
      alt: "Front and reverse views of the round 10 gram DDA Tree of Life silver coin",
    },
    displayOrder: 240,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-round-tree-of-life-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "oval",
    series: "design-10g",
    design: {
      id: "product-dda-10g-oval-radha-krishna-silver-coin",
      key: "oval-radha-krishna",
      title: "DDA 10 Gram Oval Radha Krishna Silver Coin",
      slug: "dda-10-gram-oval-radha-krishna-silver-coin",
      reference: "DDA-COIN-10G-OVAL-RADHA-KRISHNA",
      description:
        "A 10 gram oval DDA silver coin in 99.80% purity, featuring Radha and Krishna with its ornamental reverse.",
      alt: "Front and reverse views of the oval 10 gram DDA Radha Krishna silver coin",
    },
    displayOrder: 250,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-oval-radha-krishna-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "oval",
    series: "design-10g",
    design: {
      id: "product-dda-10g-oval-bal-krishna-silver-coin",
      key: "oval-bal-krishna",
      title: "DDA 10 Gram Oval Bal Krishna Silver Coin",
      slug: "dda-10-gram-oval-bal-krishna-silver-coin",
      reference: "DDA-COIN-10G-OVAL-BAL-KRISHNA",
      description:
        "A 10 gram oval DDA silver coin in 99.80% purity, featuring Bal Krishna with its ornamental reverse.",
      alt: "Front and reverse views of the oval 10 gram DDA Bal Krishna silver coin",
    },
    displayOrder: 260,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-oval-bal-krishna-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "oval",
    series: "design-10g",
    design: {
      id: "product-dda-10g-oval-anniversary-silver-coin",
      key: "oval-anniversary",
      title: "DDA 10 Gram Oval Anniversary Silver Coin",
      slug: "dda-10-gram-oval-anniversary-silver-coin",
      reference: "DDA-COIN-10G-OVAL-ANNIVERSARY",
      description:
        "A 10 gram oval DDA silver coin in 99.80% purity, featuring a couple and Happy Anniversary design with its reverse.",
      alt: "Front and reverse views of the oval 10 gram DDA Happy Anniversary silver coin",
    },
    displayOrder: 270,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-oval-anniversary-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "round",
    series: "design-10g",
    design: {
      id: "product-dda-10g-round-shiva-parvati-silver-coin",
      key: "round-shiva-parvati",
      title: "DDA 10 Gram Round Shiva Parvati Silver Coin",
      slug: "dda-10-gram-round-shiva-parvati-silver-coin",
      reference: "DDA-COIN-10G-ROUND-SHIVA-PARVATI",
      description:
        "A 10 gram round DDA silver coin in 99.80% purity, featuring Shiva and Parvati with its branded reverse.",
      alt: "Front and reverse views of the round 10 gram DDA Shiva Parvati silver coin",
    },
    displayOrder: 280,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-round-shiva-parvati-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "round",
    series: "design-10g",
    design: {
      id: "product-dda-10g-round-ganesha-silver-coin",
      key: "round-ganesha",
      title: "DDA 10 Gram Round Ganesha Silver Coin",
      slug: "dda-10-gram-round-ganesha-silver-coin",
      reference: "DDA-COIN-10G-ROUND-GANESHA",
      description:
        "A 10 gram round DDA silver coin in 99.80% purity, featuring Ganesha with its branded reverse.",
      alt: "Front and reverse views of the round 10 gram DDA Ganesha silver coin",
    },
    displayOrder: 290,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-round-ganesha-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "round",
    series: "design-10g",
    design: {
      id: "product-dda-10g-round-hanuman-silver-coin",
      key: "round-hanuman",
      title: "DDA 10 Gram Round Hanuman Silver Coin",
      slug: "dda-10-gram-round-hanuman-silver-coin",
      reference: "DDA-COIN-10G-ROUND-HANUMAN",
      description:
        "A 10 gram round DDA silver coin in 99.80% purity, featuring Hanuman with its branded reverse.",
      alt: "Front and reverse views of the round 10 gram DDA Hanuman silver coin",
    },
    displayOrder: 300,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-round-hanuman-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "round",
    series: "design-10g",
    design: {
      id: "product-dda-10g-round-guru-nanak-silver-coin",
      key: "round-guru-nanak",
      title: "DDA 10 Gram Round Guru Nanak Silver Coin",
      slug: "dda-10-gram-round-guru-nanak-silver-coin",
      reference: "DDA-COIN-10G-ROUND-GURU-NANAK",
      description:
        "A 10 gram round DDA silver coin in 99.80% purity, featuring Guru Nanak with its branded reverse.",
      alt: "Front and reverse views of the round 10 gram DDA Guru Nanak silver coin",
    },
    displayOrder: 310,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-round-guru-nanak-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "round",
    series: "design-10g",
    design: {
      id: "product-dda-10g-round-seated-shiva-silver-coin",
      key: "round-seated-shiva",
      title: "DDA 10 Gram Round Seated Shiva Silver Coin",
      slug: "dda-10-gram-round-seated-shiva-silver-coin",
      reference: "DDA-COIN-10G-ROUND-SEATED-SHIVA",
      description:
        "A 10 gram round DDA silver coin in 99.80% purity, featuring a seated Shiva design with its branded reverse.",
      alt: "Front and reverse views of the round 10 gram DDA seated Shiva silver coin",
    },
    displayOrder: 320,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-round-shiva-seated-10g-front-back-neutral-watermark.png",
  },
  {
    weight: 10,
    shape: "round",
    series: "design-10g",
    design: {
      id: "product-dda-10g-round-mahavir-silver-coin",
      key: "round-mahavir",
      title: "DDA 10 Gram Round Mahavir Silver Coin",
      slug: "dda-10-gram-round-mahavir-silver-coin",
      reference: "DDA-COIN-10G-ROUND-MAHAVIR",
      description:
        "A 10 gram round DDA silver coin in 99.80% purity, featuring Mahavir with its branded reverse.",
      alt: "Front and reverse views of the round 10 gram DDA Mahavir silver coin",
    },
    displayOrder: 330,
    imagePath:
      "public/images/silver-coins/new-10g-designs-2026-07-30/silver-coin-round-mahavir-10g-front-back-neutral-watermark.png",
  },
] satisfies readonly CoinProduct[];

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

function getRequestedShape(): ManagedCoinShape | undefined {
  if (!shapeArgument) {
    return undefined;
  }

  const shape = shapeArgument.slice("--shape=".length);
  if (
    shape !== "round" &&
    shape !== "oval" &&
    shape !== "square" &&
    shape !== "rectangle"
  ) {
    throw new Error(
      `Unsupported shape "${shape}". Expected --shape=round, --shape=oval, --shape=square, or --shape=rectangle.`,
    );
  }

  return shape;
}

function getRequestedSeries(): ManagedCoinSeries | undefined {
  if (!seriesArgument) {
    return undefined;
  }

  const series = seriesArgument.slice("--series=".length);
  if (
    series !== "classic" &&
    series !== "lakshmi-ganesh" &&
    series !== "design-10g"
  ) {
    throw new Error(
      `Unsupported series "${series}". Expected --series=classic, --series=lakshmi-ganesh, or --series=design-10g.`,
    );
  }

  return series;
}

function getSeries(product: CoinProduct): ManagedCoinSeries {
  return product.series ?? "classic";
}

function getProductId(product: CoinProduct) {
  if (product.design) {
    return product.design.id;
  }

  if (getSeries(product) === "lakshmi-ganesh") {
    return `product-dda-lakshmi-ganesh-silver-coin-${product.weight}g`;
  }

  if (product.shape === "round") {
    return `product-dda-silver-coin-${product.weight}g`;
  }

  return `product-dda-silver-${product.shape}-coin-${product.weight}g`;
}

function getProductTitle(product: CoinProduct) {
  if (product.design) {
    return product.design.title;
  }

  if (getSeries(product) === "lakshmi-ganesh") {
    return `DDA ${product.weight} Gram Lakshmi Ganesh Silver Coin`;
  }

  if (product.shape === "round") {
    return `DDA ${product.weight} Gram Silver Coin`;
  }

  const shapeLabel =
    product.shape === "oval" ? "Oval" : "Rectangle";
  return `DDA ${product.weight} Gram ${shapeLabel} Silver Coin`;
}

function getProductSlug(product: CoinProduct) {
  if (product.design) {
    return product.design.slug;
  }

  if (getSeries(product) === "lakshmi-ganesh") {
    return `dda-${product.weight}-gram-lakshmi-ganesh-silver-coin`;
  }

  if (product.shape === "round") {
    return `dda-${product.weight}-gram-silver-coin`;
  }

  return `dda-${product.weight}-gram-${product.shape}-silver-coin`;
}

function getProductReference(product: CoinProduct) {
  if (product.design) {
    return product.design.reference;
  }

  if (getSeries(product) === "lakshmi-ganesh") {
    return `DDA-COIN-LAKSHMI-GANESH-${product.weight}G`;
  }

  if (product.shape === "round") {
    return `DDA-COIN-${product.weight}G`;
  }

  return `DDA-COIN-${product.shape.toUpperCase()}-${product.weight}G`;
}

function getGalleryKey(product: CoinProduct) {
  if (product.design) {
    return `coin-${product.design.key}-${product.weight}g-front-back`;
  }

  if (getSeries(product) === "lakshmi-ganesh") {
    return `coin-lakshmi-ganesh-${product.weight}g-front-back`;
  }

  if (product.shape === "round") {
    return `coin-${product.weight}g-front-back`;
  }

  return `coin-${product.shape}-${product.weight}g-front-back`;
}

function getShapeDescription(product: CoinProduct) {
  return product.shape === "rectangle" ? "rectangular" : product.shape;
}

function getProductDescription(product: CoinProduct) {
  if (product.design) {
    return product.design.description;
  }

  const design =
    getSeries(product) === "lakshmi-ganesh"
      ? " featuring Lakshmi and Ganesh"
      : "";

  return `A ${product.weight} gram ${getShapeDescription(product)} DDA silver coin in 99.80% purity${design}, shown with its front and reverse together.`;
}

function getImageAlt(product: CoinProduct) {
  if (product.design) {
    return product.design.alt;
  }

  const design =
    getSeries(product) === "lakshmi-ganesh" ? " Lakshmi Ganesh" : "";

  return `Front and reverse views of the ${product.weight} gram ${product.shape} DDA${design} silver coin`;
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

  const asset = await client.assets.upload(
    "image",
    createReadStream(filePath),
    {
      filename: basename(filePath),
      title,
    },
  );

  summary.uploadedAssets += 1;
  console.log(`  Uploaded image asset ${asset._id}`);
  return asset._id;
}

function validateProductDefinitions(products: readonly CoinProduct[]) {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const references = new Set<string>();

  for (const product of products) {
    const id = getProductId(product);
    const title = getProductTitle(product);
    const slug = getProductSlug(product);
    const reference = getProductReference(product);
    const description = getProductDescription(product);
    const alt = getImageAlt(product);

    if (getSeries(product) === "design-10g" && !product.design) {
      throw new Error(`Design metadata is required for ${id}.`);
    }
    if (getSeries(product) !== "design-10g" && product.design) {
      throw new Error(`Design metadata is only valid for design-10g: ${id}.`);
    }
    if (ids.has(id)) {
      throw new Error(`Duplicate product ID: ${id}`);
    }
    if (slugs.has(slug)) {
      throw new Error(`Duplicate product slug: ${slug}`);
    }
    if (references.has(reference)) {
      throw new Error(`Duplicate product reference: ${reference}`);
    }
    if (title.length > 100) {
      throw new Error(`Product title exceeds 100 characters: ${title}`);
    }
    if (description.length > 240) {
      throw new Error(`Product description exceeds 240 characters: ${id}`);
    }
    if (alt.length < 12 || alt.length > 180) {
      throw new Error(`Product image alt text is invalid: ${id}`);
    }
    if (reference.length > 60) {
      throw new Error(`Product reference exceeds 60 characters: ${reference}`);
    }

    ids.add(id);
    slugs.add(slug);
    references.add(reference);
  }
}

async function validateInputs(products: readonly CoinProduct[]) {
  const category = await client.fetch<{ _id: string; title: string } | null>(
    `*[_id == $categoryId && _type == "category"][0]{_id, title}`,
    { categoryId },
  );

  if (!category) {
    throw new Error(
      `Required category "${categoryId}" was not found in the configured dataset.`,
    );
  }

  for (const product of products) {
    const absolutePath = resolve(process.cwd(), product.imagePath);
    const fileStats = await stat(absolutePath);

    if (!fileStats.isFile()) {
      throw new Error(`Image path is not a file: ${absolutePath}`);
    }
  }

  console.log(`Using category ${category.title} (${category._id})`);
}

async function main() {
  validateProductDefinitions(coinProducts);

  const requestedShape = getRequestedShape();
  const requestedSeries = getRequestedSeries();
  const selectedProducts = coinProducts.filter(
    (product) =>
      (!requestedShape || product.shape === requestedShape) &&
      (!requestedSeries || getSeries(product) === requestedSeries),
  );

  if (selectedProducts.length === 0) {
    throw new Error("The requested filters did not match any coin products.");
  }

  await validateInputs(selectedProducts);

  const productIds = selectedProducts.map((product) => getProductId(product));
  const existingDocuments = await client.fetch<ExistingDocument[]>(
    `*[_id in $productIds]{_id, title}`,
    { productIds },
  );
  const existingById = new Map(
    existingDocuments.map((document) => [document._id, document]),
  );

  if (!applyChanges) {
    const commandName =
      requestedSeries === "design-10g"
        ? "sanity:upload-new-10g-coins"
        : requestedSeries === "lakshmi-ganesh"
        ? "sanity:upload-lakshmi-ganesh-coins"
        : requestedShape === "oval"
        ? "sanity:upload-oval-coins"
        : requestedShape === "square"
          ? "sanity:upload-square-coins"
          : requestedShape === "rectangle"
          ? "sanity:upload-rectangle-coins"
          : "sanity:upload-coins";

    console.log("\nDry run only. No assets or documents will be written.");
    console.log(
      `Run \`npm run ${commandName}:apply\` to upload and publish.`,
    );
    console.log(
      `Run \`npm run ${commandName}:overwrite\` only when existing script-managed products should be replaced.\n`,
    );

    for (const product of selectedProducts) {
      const id = getProductId(product);
      const absolutePath = resolve(process.cwd(), product.imagePath);
      const existingAsset = await findExistingAsset(absolutePath);
      const existingProduct = existingById.get(id);
      const action = existingProduct
        ? overwriteExisting
          ? "REPLACE"
          : "SKIP"
        : "CREATE";

      console.log(
        `${action} ${id}: ${getProductTitle(product)}; image ${
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

  for (const product of selectedProducts) {
    const productId = getProductId(product);
    const existingProduct = existingById.get(productId);

    if (existingProduct && !overwriteExisting) {
      summary.skippedProducts += 1;
      console.log(
        `Skipped ${existingProduct.title} (${productId}); use --overwrite to replace it.`,
      );
      continue;
    }

    const title = getProductTitle(product);
    const absolutePath = resolve(process.cwd(), product.imagePath);
    const assetId = await getOrUploadImage(
      absolutePath,
      `${title} front and reverse catalog image`,
      summary,
    );

    await client.createOrReplace({
      _id: productId,
      _type: "product",
      title,
      slug: {
        _type: "slug",
        current: getProductSlug(product),
      },
      shortDescription: getProductDescription(product),
      gallery: [
        {
          _key: getGalleryKey(product),
          _type: "image",
          asset: {
            _type: "reference",
            _ref: assetId,
          },
          alt: getImageAlt(product),
        },
      ],
      category: {
        _type: "reference",
        _ref: categoryId,
      },
      purity: "99.80",
      coinShape: product.shape,
      featured: false,
      displayOrder: product.displayOrder,
      reference: getProductReference(product),
    });

    if (existingProduct) {
      summary.replacedProducts += 1;
      console.log(`Replaced ${title} (${productId})`);
    } else {
      summary.createdProducts += 1;
      console.log(`Created ${title} (${productId})`);
    }
  }

  console.log("\nUpload complete.");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
