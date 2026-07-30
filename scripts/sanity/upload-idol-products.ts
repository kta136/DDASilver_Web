import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2026-07-30" });

const categoryId = "category-idols";
const applyChanges = process.argv.includes("--apply");
const overwriteExisting = process.argv.includes("--overwrite");

type IdolProduct = {
  number: number;
  id: string;
  codeFamily: string;
  assignedItemCode?: string;
  title: string;
  slug: string;
  description: string;
  alt: string;
  weightGrams: number;
  heightInches: number;
  deityIds: readonly string[];
  imagePath: string;
};

const idolProducts = [
  {
    number: 1,
    id: "product-dda-idol-01-bal-krishna-laddu-gopal",
    codeFamily: "BK",
    assignedItemCode: "HM-BK-1",
    title: "Bal Krishna / Laddu Gopal Silver Idol",
    slug: "bal-krishna-laddu-gopal-silver-idol",
    description:
      "A hollow 99.80% pure silver Bal Krishna / Laddu Gopal idol for devotional display.",
    alt: "Bal Krishna Laddu Gopal silver idol on a warm ivory DDA Silver background",
    weightGrams: 50,
    heightInches: 3,
    deityIds: ["deity-krishna"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/silver-idol-bal-krishna-laddu-gopal-50g-3in-branded-template.png",
  },
  {
    number: 2,
    id: "product-dda-idol-02-kneeling-bal-krishna",
    codeFamily: "BK",
    assignedItemCode: "HM-BK-2",
    title: "Kneeling Bal Krishna Silver Idol",
    slug: "kneeling-bal-krishna-silver-idol",
    description:
      "A hollow 99.80% pure silver Bal Krishna idol in a kneeling devotional pose.",
    alt: "Kneeling Bal Krishna silver idol on a warm ivory DDA Silver background",
    weightGrams: 60,
    heightInches: 4,
    deityIds: ["deity-krishna"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-02-kneeling-deity-60g-4in.png",
  },
  {
    number: 3,
    id: "product-dda-idol-03-ganesha-arch",
    codeFamily: "GN",
    assignedItemCode: "HM-GN-1",
    title: "Ganesha Silver Idol with Arch",
    slug: "ganesha-silver-idol-with-arch",
    description:
      "A hollow 99.80% pure silver Ganesha idol framed by an ornate arch.",
    alt: "Ganesha silver idol with an ornate arch on a warm ivory DDA Silver background",
    weightGrams: 20,
    heightInches: 2.5,
    deityIds: ["deity-ganesha"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-03-ganesha-arch-20g-2-5in.png",
  },
  {
    number: 4,
    id: "product-dda-idol-04-four-arm-ganesha",
    codeFamily: "GN",
    assignedItemCode: "HM-GN-2",
    title: "Four-Arm Ganesha Silver Idol",
    slug: "four-arm-ganesha-silver-idol",
    description:
      "A hollow 99.80% pure silver four-arm Ganesha idol for devotional display.",
    alt: "Four-arm Ganesha silver idol on a warm ivory DDA Silver background",
    weightGrams: 20,
    heightInches: 2,
    deityIds: ["deity-ganesha"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-04-ganesha-four-arm-20g-2in.png",
  },
  {
    number: 5,
    id: "product-dda-idol-05-khatu-shyam",
    codeFamily: "KS",
    assignedItemCode: "HM-KS-1",
    title: "Khatu Shyam Silver Idol",
    slug: "khatu-shyam-silver-idol",
    description:
      "A hollow 99.80% pure silver Khatu Shyam idol with a detailed circular halo.",
    alt: "Khatu Shyam silver idol with a circular halo on a warm ivory DDA Silver background",
    weightGrams: 15,
    heightInches: 2,
    deityIds: ["deity-khatu-shyam"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-05-khatu-shyam-15g-2in.png",
  },
  {
    number: 6,
    id: "product-dda-idol-06-ganesha-yellow-dhoti",
    codeFamily: "GN",
    assignedItemCode: "HM-GN-3",
    title: "Ganesha Silver Idol with Yellow Dhoti",
    slug: "ganesha-silver-idol-with-yellow-dhoti",
    description:
      "A hollow 99.80% pure silver Ganesha idol with a hand-painted yellow dhoti.",
    alt: "Ganesha silver idol with a yellow dhoti on a warm ivory DDA Silver background",
    weightGrams: 28,
    heightInches: 2.5,
    deityIds: ["deity-ganesha"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-06-ganesha-yellow-dhoti-28g-2-5in.png",
  },
  {
    number: 7,
    id: "product-dda-idol-07-colored-bal-krishna",
    codeFamily: "BK",
    assignedItemCode: "HM-BK-3",
    title: "Colored Bal Krishna Silver Idol",
    slug: "colored-bal-krishna-silver-idol",
    description:
      "A hollow 99.80% pure silver Bal Krishna idol with hand-painted devotional details.",
    alt: "Colored Bal Krishna silver idol on a warm ivory DDA Silver background",
    weightGrams: 20,
    heightInches: 3,
    deityIds: ["deity-krishna"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-07-bal-krishna-colored-20g-3in.png",
  },
  {
    number: 8,
    id: "product-dda-idol-08-colored-crawling-bal-krishna",
    codeFamily: "BK",
    assignedItemCode: "HM-BK-4",
    title: "Colored Crawling Bal Krishna Silver Idol",
    slug: "colored-crawling-bal-krishna-silver-idol",
    description:
      "A hollow 99.80% pure silver crawling Bal Krishna idol with hand-painted details.",
    alt: "Colored crawling Bal Krishna silver idol on a warm ivory DDA Silver background",
    weightGrams: 15,
    heightInches: 2,
    deityIds: ["deity-krishna"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-08-bal-krishna-crawling-colored-15g-2in.png",
  },
  {
    number: 9,
    id: "product-dda-idol-09-shiva-on-throne",
    codeFamily: "KB",
    assignedItemCode: "HM-KB-2",
    title: "Kuber Silver Idol on Throne",
    slug: "kuber-silver-idol-on-throne",
    description:
      "A hollow 99.80% pure silver Kuber idol seated on a detailed throne.",
    alt: "Kuber silver idol seated on a throne on a warm ivory DDA Silver background",
    weightGrams: 6,
    heightInches: 1.5,
    deityIds: ["deity-kuber"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-09-kuber-on-throne-6g-1-5in.png",
  },
  {
    number: 10,
    id: "product-dda-idol-10-meditating-shiva",
    codeFamily: "SH",
    assignedItemCode: "HM-SH-1",
    title: "Meditating Shiva Silver Idol",
    slug: "meditating-shiva-silver-idol",
    description:
      "A hollow 99.80% pure silver Shiva idol in a meditative seated pose.",
    alt: "Meditating Shiva silver idol on a warm ivory DDA Silver background",
    weightGrams: 15,
    heightInches: 2,
    deityIds: ["deity-shiva"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-10-shiva-meditating-15g-2in.png",
  },
  {
    number: 11,
    id: "product-dda-idol-11-colored-meditating-shiva",
    codeFamily: "SH",
    assignedItemCode: "HM-SH-2",
    title: "Colored Meditating Shiva Silver Idol",
    slug: "colored-meditating-shiva-silver-idol",
    description:
      "A hollow 99.80% pure silver meditating Shiva idol with hand-painted details.",
    alt: "Colored meditating Shiva silver idol on a warm ivory DDA Silver background",
    weightGrams: 15,
    heightInches: 2,
    deityIds: ["deity-shiva"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-11-shiva-meditating-colored-15g-2in.png",
  },
  {
    number: 12,
    id: "product-dda-idol-12-shiva-family",
    codeFamily: "SH",
    assignedItemCode: "HM-SH-3",
    title: "Shiva Family Silver Idol",
    slug: "shiva-family-silver-idol",
    description:
      "A hollow 99.80% pure silver Shiva family idol with multiple devotional figures.",
    alt: "Shiva family silver idol group on a warm ivory DDA Silver background",
    weightGrams: 20,
    heightInches: 2.5,
    deityIds: [
      "deity-shiva",
      "deity-parvati",
      "deity-ganesha",
      "deity-kartikeya",
    ],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-12-shiva-family-20g-2-5in.png",
  },
  {
    number: 13,
    id: "product-dda-idol-13-panchmukhi-hanuman",
    codeFamily: "HN",
    assignedItemCode: "HM-HN-1",
    title: "Panchmukhi Hanuman Silver Idol",
    slug: "panchmukhi-hanuman-silver-idol",
    description:
      "A hollow 99.80% pure silver Panchmukhi Hanuman idol with five faces and multiple arms.",
    alt: "Panchmukhi Hanuman silver idol on a warm ivory DDA Silver background",
    weightGrams: 50,
    heightInches: 3.5,
    deityIds: ["deity-hanuman"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-13-panchmukhi-hanuman-50g-3-5in.png",
  },
  {
    number: 14,
    id: "product-dda-idol-14-sai-baba",
    codeFamily: "SB",
    assignedItemCode: "HM-SB-1",
    title: "Sai Baba Silver Idol",
    slug: "sai-baba-silver-idol",
    description:
      "A hollow 99.80% pure silver Sai Baba idol in a seated blessing pose.",
    alt: "Sai Baba silver idol with a painted garland on a warm ivory DDA Silver background",
    weightGrams: 15,
    heightInches: 2.5,
    deityIds: ["deity-sai-baba"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-14-sai-baba-15g-2-5in.png",
  },
  {
    number: 15,
    id: "product-dda-idol-15-colored-panchmukhi-hanuman",
    codeFamily: "HN",
    assignedItemCode: "HM-HN-2",
    title: "Colored Panchmukhi Hanuman Silver Idol",
    slug: "colored-panchmukhi-hanuman-silver-idol",
    description:
      "A hollow 99.80% pure silver Panchmukhi Hanuman idol with hand-painted details.",
    alt: "Colored Panchmukhi Hanuman silver idol on a warm ivory DDA Silver background",
    weightGrams: 50,
    heightInches: 3.5,
    deityIds: ["deity-hanuman"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-15-panchmukhi-hanuman-colored-50g-3-5in.png",
  },
  {
    number: 16,
    id: "product-dda-idol-16-lakshmi-narayan-sheshnag",
    codeFamily: "LN",
    assignedItemCode: "HM-LN-1",
    title: "Lakshmi Narayan Silver Idol on Sheshnag",
    slug: "lakshmi-narayan-silver-idol-on-sheshnag",
    description:
      "A hollow 99.80% pure silver Lakshmi Narayan idol seated beneath the Sheshnag canopy.",
    alt: "Lakshmi Narayan silver idol on Sheshnag on a warm ivory DDA Silver background",
    weightGrams: 20,
    heightInches: 3,
    deityIds: ["deity-lakshmi", "deity-vishnu"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-16-lakshmi-narayan-sheshnag-20g-3in.png",
  },
  {
    number: 17,
    id: "product-dda-idol-17-saraswati-veena",
    codeFamily: "SR",
    assignedItemCode: "HM-SR-1",
    title: "Saraswati Silver Idol with Veena",
    slug: "saraswati-silver-idol-with-veena",
    description:
      "A hollow 99.80% pure silver Saraswati idol seated with a veena.",
    alt: "Saraswati silver idol playing a veena on a warm ivory DDA Silver background",
    weightGrams: 6,
    heightInches: 1.5,
    deityIds: ["deity-saraswati"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-17-saraswati-veena-6g-1-5in.png",
  },
  {
    number: 18,
    id: "product-dda-idol-18-crawling-bal-krishna",
    codeFamily: "BK",
    assignedItemCode: "HM-BK-5",
    title: "Crawling Bal Krishna Silver Idol",
    slug: "crawling-bal-krishna-silver-idol",
    description:
      "A hollow 99.80% pure silver crawling Bal Krishna idol holding a ball of butter.",
    alt: "Crawling Bal Krishna silver idol on a warm ivory DDA Silver background",
    weightGrams: 5,
    heightInches: 2,
    deityIds: ["deity-krishna"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-18-bal-krishna-crawling-5g-2in.png",
  },
  {
    number: 19,
    id: "product-dda-idol-19-seated-kuber",
    codeFamily: "KB",
    assignedItemCode: "HM-KB-1",
    title: "Seated Kuber Silver Idol",
    slug: "seated-kuber-silver-idol",
    description:
      "A hollow 99.80% pure silver Kuber idol in a seated blessing pose.",
    alt: "Seated Kuber silver idol on a warm ivory DDA Silver background",
    weightGrams: 15,
    heightInches: 2,
    deityIds: ["deity-kuber"],
    imagePath:
      "public/images/silver-idols/new-designs-2026-07-30/idol-19-seated-kuber-15g-2in.png",
  },
] satisfies readonly IdolProduct[];

type ExistingDocument = {
  _id: string;
  title: string;
  reference?: string;
};

type ExistingAsset = {
  _id: string;
  originalFilename?: string;
  title?: string;
};

type Summary = {
  uploadedAssets: number;
  reusedAssets: number;
  updatedAssetTitles: number;
  createdProducts: number;
  replacedProducts: number;
  skippedProducts: number;
};

const itemCodePattern = /^HM-([A-Z]{2})-([1-9][0-9]*)$/;

function getItemName(product: IdolProduct, itemCode: string) {
  return `${itemCode} — ${product.title}`;
}

function allocateItemCodes(
  products: readonly IdolProduct[],
  existingDocuments: readonly ExistingDocument[],
) {
  const managedProductIds = new Set(products.map((product) => product.id));
  const existingById = new Map(
    existingDocuments.map((document) => [document._id, document]),
  );
  const usedCodes = new Set<string>();
  const highestSequenceByFamily = new Map<string, number>();

  for (const document of existingDocuments) {
    if (managedProductIds.has(document._id)) {
      continue;
    }

    const match = document.reference?.match(itemCodePattern);
    if (!match) {
      continue;
    }

    const [, family, sequenceText] = match;
    const sequence = Number(sequenceText);
    usedCodes.add(document.reference!);
    highestSequenceByFamily.set(
      family,
      Math.max(highestSequenceByFamily.get(family) ?? 0, sequence),
    );
  }

  const itemCodeByProductId = new Map<string, string>();

  for (const product of products) {
    if (!product.assignedItemCode) {
      continue;
    }

    const match = product.assignedItemCode.match(itemCodePattern);
    if (!match || match[1] !== product.codeFamily) {
      throw new Error(
        `Invalid assigned item code for ${product.id}: ${product.assignedItemCode}`,
      );
    }
    if (usedCodes.has(product.assignedItemCode)) {
      throw new Error(
        `Assigned item code is already in use: ${product.assignedItemCode}`,
      );
    }

    const sequence = Number(match[2]);
    usedCodes.add(product.assignedItemCode);
    highestSequenceByFamily.set(
      product.codeFamily,
      Math.max(highestSequenceByFamily.get(product.codeFamily) ?? 0, sequence),
    );
    itemCodeByProductId.set(product.id, product.assignedItemCode);
  }

  for (const product of products) {
    if (itemCodeByProductId.has(product.id)) {
      continue;
    }

    const existingReference = existingById.get(product.id)?.reference;
    const existingMatch = existingReference?.match(itemCodePattern);

    if (
      existingMatch?.[1] === product.codeFamily &&
      !usedCodes.has(existingReference!)
    ) {
      usedCodes.add(existingReference!);
      highestSequenceByFamily.set(
        product.codeFamily,
        Math.max(
          highestSequenceByFamily.get(product.codeFamily) ?? 0,
          Number(existingMatch[2]),
        ),
      );
      itemCodeByProductId.set(product.id, existingReference!);
      continue;
    }

    let nextSequence =
      (highestSequenceByFamily.get(product.codeFamily) ?? 0) + 1;
    let itemCode = `HM-${product.codeFamily}-${nextSequence}`;

    while (usedCodes.has(itemCode)) {
      nextSequence += 1;
      itemCode = `HM-${product.codeFamily}-${nextSequence}`;
    }

    usedCodes.add(itemCode);
    highestSequenceByFamily.set(product.codeFamily, nextSequence);
    itemCodeByProductId.set(product.id, itemCode);
  }

  return itemCodeByProductId;
}

function validateItemCodeAllocation(
  products: readonly IdolProduct[],
  itemCodeByProductId: ReadonlyMap<string, string>,
) {
  const allocatedCodes = new Set<string>();

  for (const product of products) {
    const itemCode = itemCodeByProductId.get(product.id);
    const match = itemCode?.match(itemCodePattern);

    if (!itemCode || !match) {
      throw new Error(`Invalid item code allocated for ${product.id}.`);
    }
    if (match[1] !== product.codeFamily) {
      throw new Error(
        `Allocated item code uses the wrong family for ${product.id}: ${itemCode}`,
      );
    }
    if (allocatedCodes.has(itemCode)) {
      throw new Error(`Duplicate allocated item code: ${itemCode}`);
    }
    if (getItemName(product, itemCode).length > 100) {
      throw new Error(`Item Name exceeds 100 characters: ${product.id}`);
    }

    allocatedCodes.add(itemCode);
  }
}

function getProductDescription(product: IdolProduct) {
  return `${product.description} Weight: ${product.weightGrams} g. Height: ${product.heightInches} in.`;
}

function getGalleryKey(product: IdolProduct) {
  return `idol-${String(product.number).padStart(2, "0")}-${product.slug}`;
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
      originalFilename,
      title
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

    if (existingAsset.title !== title) {
      await client.patch(existingAsset._id).set({ title }).commit();
      summary.updatedAssetTitles += 1;
      console.log(`  Updated image title to "${title}"`);
    }

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

function validateProductDefinitions(products: readonly IdolProduct[]) {
  const ids = new Set<string>();
  const slugs = new Set<string>();

  if (products.length !== 19) {
    throw new Error(`Expected 19 idol products, received ${products.length}.`);
  }

  for (const product of products) {
    const description = getProductDescription(product);

    if (ids.has(product.id)) {
      throw new Error(`Duplicate product ID: ${product.id}`);
    }
    if (slugs.has(product.slug)) {
      throw new Error(`Duplicate product slug: ${product.slug}`);
    }
    if (!/^[A-Z]{2}$/.test(product.codeFamily)) {
      throw new Error(
        `Item-code family must contain two uppercase letters: ${product.id}`,
      );
    }
    if (/\b\d+(?:\.\d+)?\s*(?:g|gram|in|inch)\b/i.test(product.title)) {
      throw new Error(
        `Weight or height must not appear in the product title: ${product.title}`,
      );
    }
    if (product.title.length > 100) {
      throw new Error(`Product title exceeds 100 characters: ${product.title}`);
    }
    if (description.length > 240) {
      throw new Error(`Product description exceeds 240 characters: ${product.id}`);
    }
    if (!description.includes("Weight:") || !description.includes("Height:")) {
      throw new Error(`Measurements are missing from description: ${product.id}`);
    }
    if (product.alt.length < 12 || product.alt.length > 180) {
      throw new Error(`Product image alt text is invalid: ${product.id}`);
    }
    if (product.deityIds.length === 0) {
      throw new Error(`At least one deity is required: ${product.id}`);
    }
    ids.add(product.id);
    slugs.add(product.slug);
  }
}

async function assertConfiguredTarget() {
  const { projectId, dataset } = client.config();

  if (
    process.env.SANITY_EXPECTED_PROJECT_ID &&
    process.env.SANITY_EXPECTED_PROJECT_ID !== projectId
  ) {
    throw new Error("Sanity project does not match SANITY_EXPECTED_PROJECT_ID");
  }
  if (
    process.env.SANITY_EXPECTED_DATASET &&
    process.env.SANITY_EXPECTED_DATASET !== dataset
  ) {
    throw new Error("Sanity dataset does not match SANITY_EXPECTED_DATASET");
  }

  return { projectId, dataset };
}

async function validateInputs(products: readonly IdolProduct[]) {
  const deityIds = [...new Set(products.flatMap((product) => product.deityIds))];
  const productIds = products.map((product) => product.id);
  const slugs = products.map((product) => product.slug);
  const [category, deityDocuments, slugConflicts] = await Promise.all([
    client.fetch<{ _id: string; title: string } | null>(
      `*[_id == $categoryId && _type == "category"][0]{_id, title}`,
      { categoryId },
    ),
    client.fetch<ExistingDocument[]>(
      `*[_id in $deityIds && _type == "deity"]{_id, title}`,
      { deityIds },
    ),
    client.fetch<ExistingDocument[]>(
      `*[
        _type == "product" &&
        slug.current in $slugs &&
        !(_id in $productIds)
      ]{_id, title}`,
      { slugs, productIds },
    ),
  ]);

  if (!category) {
    throw new Error(
      `Required category "${categoryId}" was not found in the configured dataset.`,
    );
  }

  const foundDeityIds = new Set(deityDocuments.map((deity) => deity._id));
  const missingDeityIds = deityIds.filter((id) => !foundDeityIds.has(id));
  if (missingDeityIds.length > 0) {
    throw new Error(`Missing required deity records: ${missingDeityIds.join(", ")}`);
  }

  if (slugConflicts.length > 0) {
    throw new Error(
      `Product slugs already belong to other documents: ${slugConflicts
        .map((document) => `${document.title} (${document._id})`)
        .join(", ")}`,
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
  console.log(
    `Verified ${deityDocuments.length} deity records: ${deityDocuments
      .map((deity) => deity.title)
      .toSorted((first, second) => first.localeCompare(second, "en-IN"))
      .join(", ")}`,
  );
}

async function main() {
  validateProductDefinitions(idolProducts);
  const { projectId, dataset } = await assertConfiguredTarget();
  await validateInputs(idolProducts);

  const existingDocuments = await client.fetch<ExistingDocument[]>(
    `*[_type == "product" && defined(reference)]{_id, title, reference}`,
  );
  const existingById = new Map(
    existingDocuments.map((document) => [document._id, document]),
  );
  const itemCodeByProductId = allocateItemCodes(
    idolProducts,
    existingDocuments,
  );
  validateItemCodeAllocation(idolProducts, itemCodeByProductId);

  console.log(`Target: ${projectId}/${dataset}`);

  if (!applyChanges) {
    console.log("\nDry run only. No assets or documents will be written.");
    console.log(
      "Run `npm run sanity:upload-idols:apply` to upload and publish.",
    );
    console.log(
      "Run `npm run sanity:upload-idols:overwrite` only when existing script-managed products should be replaced.\n",
    );

    for (const product of idolProducts) {
      const absolutePath = resolve(process.cwd(), product.imagePath);
      const existingAsset = await findExistingAsset(absolutePath);
      const existingProduct = existingById.get(product.id);
      const itemCode = itemCodeByProductId.get(product.id);
      if (!itemCode) {
        throw new Error(`No item code was allocated for ${product.id}.`);
      }
      const action = existingProduct
        ? overwriteExisting
          ? "REPLACE"
          : "SKIP"
        : "CREATE";
      const deityLabels = product.deityIds.map((id) => id.replace("deity-", ""));

      console.log(
        `${action} ${product.id}: ${getItemName(product, itemCode)}; ${product.weightGrams} g; ${product.heightInches} in; deities=${deityLabels.join("+")}; image ${
          existingAsset ? "already uploaded" : "would be uploaded"
        }`,
      );
    }

    return;
  }

  const summary: Summary = {
    uploadedAssets: 0,
    reusedAssets: 0,
    updatedAssetTitles: 0,
    createdProducts: 0,
    replacedProducts: 0,
    skippedProducts: 0,
  };

  for (const product of idolProducts) {
    const existingProduct = existingById.get(product.id);
    const itemCode = itemCodeByProductId.get(product.id);
    if (!itemCode) {
      throw new Error(`No item code was allocated for ${product.id}.`);
    }
    const itemName = getItemName(product, itemCode);

    if (existingProduct && !overwriteExisting) {
      summary.skippedProducts += 1;
      console.log(
        `Skipped ${existingProduct.title} (${product.id}); use --overwrite to replace it.`,
      );
      continue;
    }

    const absolutePath = resolve(process.cwd(), product.imagePath);
    const assetId = await getOrUploadImage(
      absolutePath,
      itemName,
      summary,
    );

    await client.createOrReplace({
      _id: product.id,
      _type: "product",
      title: itemName,
      slug: {
        _type: "slug",
        current: product.slug,
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
          alt: product.alt,
        },
      ],
      category: {
        _type: "reference",
        _ref: categoryId,
      },
      purity: "99.80",
      idolConstruction: "hollow",
      deities: product.deityIds.map((deityId) => ({
        _key: deityId,
        _type: "reference",
        _ref: deityId,
      })),
      featured: false,
      displayOrder: 390 + product.number * 10,
      reference: itemCode,
    });

    if (existingProduct) {
      summary.replacedProducts += 1;
      console.log(`Replaced ${itemName} (${product.id})`);
    } else {
      summary.createdProducts += 1;
      console.log(`Created ${itemName} (${product.id})`);
    }
  }

  console.log("\nUpload complete.");
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
