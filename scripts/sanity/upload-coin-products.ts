import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-28" });

const categoryId = "category-coin";
const applyChanges = process.argv.includes("--apply");
const overwriteExisting = process.argv.includes("--overwrite");
const shapeArgument = process.argv.find((argument) =>
  argument.startsWith("--shape="),
);
const seriesArgument = process.argv.find((argument) =>
  argument.startsWith("--series="),
);

type ManagedCoinShape = "round" | "oval" | "rectangle";
type ManagedCoinSeries = "classic" | "lakshmi-ganesh";
type CoinProduct = {
  weight: number;
  shape: ManagedCoinShape;
  series?: ManagedCoinSeries;
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
  if (shape !== "round" && shape !== "oval" && shape !== "rectangle") {
    throw new Error(
      `Unsupported shape "${shape}". Expected --shape=round, --shape=oval, or --shape=rectangle.`,
    );
  }

  return shape;
}

function getRequestedSeries(): ManagedCoinSeries | undefined {
  if (!seriesArgument) {
    return undefined;
  }

  const series = seriesArgument.slice("--series=".length);
  if (series !== "classic" && series !== "lakshmi-ganesh") {
    throw new Error(
      `Unsupported series "${series}". Expected --series=classic or --series=lakshmi-ganesh.`,
    );
  }

  return series;
}

function getSeries(product: CoinProduct): ManagedCoinSeries {
  return product.series ?? "classic";
}

function getProductId(product: CoinProduct) {
  if (getSeries(product) === "lakshmi-ganesh") {
    return `product-dda-lakshmi-ganesh-silver-coin-${product.weight}g`;
  }

  if (product.shape === "round") {
    return `product-dda-silver-coin-${product.weight}g`;
  }

  return `product-dda-silver-${product.shape}-coin-${product.weight}g`;
}

function getProductTitle(product: CoinProduct) {
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
  if (getSeries(product) === "lakshmi-ganesh") {
    return `dda-${product.weight}-gram-lakshmi-ganesh-silver-coin`;
  }

  if (product.shape === "round") {
    return `dda-${product.weight}-gram-silver-coin`;
  }

  return `dda-${product.weight}-gram-${product.shape}-silver-coin`;
}

function getProductReference(product: CoinProduct) {
  if (getSeries(product) === "lakshmi-ganesh") {
    return `DDA-COIN-LAKSHMI-GANESH-${product.weight}G`;
  }

  if (product.shape === "round") {
    return `DDA-COIN-${product.weight}G`;
  }

  return `DDA-COIN-${product.shape.toUpperCase()}-${product.weight}G`;
}

function getGalleryKey(product: CoinProduct) {
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
  const design =
    getSeries(product) === "lakshmi-ganesh"
      ? " featuring Lakshmi and Ganesh"
      : "";

  return `A ${product.weight} gram ${getShapeDescription(product)} DDA silver coin in 99.80% purity${design}, shown with its front and reverse together.`;
}

function getImageAlt(product: CoinProduct) {
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
  const requestedShape = getRequestedShape();
  const requestedSeries = getRequestedSeries();
  const selectedProducts = coinProducts.filter(
    (product) =>
      (!requestedShape || product.shape === requestedShape) &&
      (!requestedSeries || getSeries(product) === requestedSeries),
  );

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
      requestedSeries === "lakshmi-ganesh"
        ? "sanity:upload-lakshmi-ganesh-coins"
        : requestedShape === "oval"
        ? "sanity:upload-oval-coins"
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
